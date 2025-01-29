const pool = require('../models/db');

// Define valid date names
const validDateNames = [
    'Appointment Date',
    'Listing Date',
    'Contract Signed Date',
    'Home Inspection Date',
    'Appraisal Date',
    'Closing Date',
    'Expiration Date'
]

exports.addOrUpdateDates = async (req, res) => {
    const { state_id, dates, transaction_id, stage_id, created_by } = req.body;
  
    if (!state_id || !created_by || !transaction_id || !stage_id || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ error: 'All fields are required, and dates must be an array.' });
    }
  
    try {
      // Step 1: Insert or update dates
      const queries = dates.map(({ date_id, date_name, date_value }) => ({
        text: `
          INSERT INTO tkg.dates (state_id, date_id, date_name, entered_date, created_date, created_by, transaction_id, stage_id, updated_date, updated_by) 
          VALUES ($1, $2, $3, $4::DATE, CURRENT_TIMESTAMP, $5, $6, $7, CURRENT_TIMESTAMP, $5)
          ON CONFLICT (state_id, date_name, transaction_id, stage_id) 
          DO UPDATE SET 
              entered_date = $4::DATE,
              updated_date = NOW(), 
              updated_by = $5 
          RETURNING *;
        `,
        values: [state_id, date_id, date_name, date_value, created_by, transaction_id, stage_id],
      }));
  
      const results = await Promise.all(queries.map((query) => pool.query(query.text, query.values)));
      const insertedOrUpdatedDates = results.map((result) => result.rows[0]);
  
      // Step 2: Fetch tasks with `null` task_days for the transaction, grouped by task_id
      const fetchTasksQuery = `
        SELECT td.transaction_detail_id, t.date_id, td.task_id, t.task_days, t.is_repeatable, t.frequency, t.interval, t.interval_type
        FROM tkg.transaction_detail td
        JOIN tkg.tasks t ON td.task_id = t.task_id AND td.stage_id = t.stage_id AND td.state_id = t.state
        WHERE td.transaction_id = $1 AND td.task_days IS NULL AND td.stage_id = $2
        ORDER BY td.task_id, td.transaction_detail_id;
      `;
      const tasksWithNullTaskDays = (await pool.query(fetchTasksQuery, [transaction_id, stage_id])).rows;
      console.log('task with null: ', tasksWithNullTaskDays.length)
      // Group tasks by task_id
      const tasksGroupedByTaskId = tasksWithNullTaskDays.reduce((acc, task) => {
        acc[task.task_id] = acc[task.task_id] || [];
        acc[task.task_id].push(task);
        return acc;
      }, {});
      console.log('grouped: ', tasksGroupedByTaskId)
      
      function addMonthsSafely(date, months) {
        const newDate = new Date(date);
        const expectedMonth = newDate.getMonth() + months;
        
        newDate.setMonth(expectedMonth);
      
        if (newDate.getDate() !== date.getDate()) {
          newDate.setDate(0); // Moves to the last day of the previous month
        }
      
        return newDate;
      }
      
  
      // Step 3: Calculate and update task_days for each group of tasks
      for (const [taskId, taskGroup] of Object.entries(tasksGroupedByTaskId)) {
        const taskConfig = taskGroup[0]; // All tasks in the group share the same config
        const assignedDate = dates.find((date) => date.date_id === taskConfig.date_id)?.date_value;
  
        if (taskConfig.is_repeatable && assignedDate) {
          const { interval, interval_type, task_days } = taskConfig;
  
          // Parse assigned date
          const [month, day, year] = assignedDate.split("/");
          const baseDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  
          for (let i = 0; i < taskGroup.length; i++) {
            const task = taskGroup[i];
  
            // Calculate additional `task_days`
            let additionalDays = 0;
            if (interval_type === 'day') {
              additionalDays = interval * (i + 1);
            } else if (interval_type === 'week') {
              additionalDays = interval * 7 * (i + 1);
            } else if (interval_type === 'month') {
              const newDate = addMonthsSafely(baseDate, interval * (i + 1));
              console.log('new date: ', newDate)
            //   newDate.setMonth(newDate.getMonth() + interval * (i + 1));
              additionalDays = Math.floor((newDate - baseDate) / (1000 * 60 * 60 * 24));
            }
            console.log('addtional days: ', additionalDays)
            const newTaskDays = task_days + additionalDays;
            console.log('new task days: ', newTaskDays)
  
            // Update task_days for the current task
            await pool.query(
              `
              UPDATE tkg.transaction_detail
              SET task_days = $1
              WHERE transaction_detail_id = $2 AND transaction_id = $3;
              `,
              [newTaskDays, task.transaction_detail_id, transaction_id]
            );
          }
        }
      }
  
      res.status(201).json({
        message: 'Dates and task days updated successfully.',
        dates: insertedOrUpdatedDates,
      });
    } catch (error) {
      console.error('Error adding or updating dates:', error);
      res.status(500).json({ error: 'Database error' });
    }
  };
  
  

exports.getTransactionDates = async (req, res) => {
    const { transaction_id } = req.params;

    try {
        const query = `
            SELECT 
                d.state_id, 
                d.date_name, 
                d.entered_date, 
                d.created_date, 
                d.created_by, 
                d.updated_date, 
                d.updated_by, 
                d.transaction_id, 
                d.stage_id, 
                s.state, 
                st.stage_name
            FROM 
                tkg.dates d
            LEFT JOIN 
                tkg.state s ON d.state_id = s.state
            LEFT JOIN 
                tkg.stages st ON d.stage_id = st.stage_id
            WHERE 
                d.transaction_id = $1
            ORDER BY 
                d.stage_id, d.date_name;
        `;

        const result = await pool.query(query, [transaction_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No dates found for the given transaction ID.'
            });
        }

        // Group dates by stage_id
        const groupedDates = result.rows.reduce((acc, row) => {
            const { stage_id, stage_name, ...dateDetails } = row;

            // Initialize the stage if it doesn't exist in the accumulator
            if (!acc[stage_id]) {
                acc[stage_id] = {
                    stage_id,
                    stage_name,
                    dates: [],
                };
            }

            // Add the date details to the corresponding stage
            acc[stage_id].dates.push(dateDetails);

            return acc;
        }, {});

        res.status(200).json({
            message: 'Dates retrieved successfully.',
            transaction_id,
            stages: Object.values(groupedDates), // Convert object to an array
        });
    } catch (error) {
        console.error('Error fetching transaction dates:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

exports.getTransactionDatesByStage = async (req, res) => {
    const { transaction_id, stage_id } = req.params;

    try {
        const query = `
            SELECT 
                d.state_id, 
                d.date_name, 
                d.entered_date::DATE::TEXT AS entered_date, 
                d.created_date, 
                d.created_by, 
                d.updated_date, 
                d.updated_by, 
                d.transaction_id, 
                d.stage_id, 
                s.state, 
                st.stage_name
            FROM 
                tkg.dates d
            LEFT JOIN 
                tkg.state s ON d.state_id = s.state
            LEFT JOIN 
                tkg.stages st ON d.stage_id = st.stage_id
            WHERE 
                d.transaction_id = $1 AND d.stage_id = $2
            ORDER BY 
                d.date_name;
        `;

        const result = await pool.query(query, [transaction_id, stage_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No dates found for the given transaction ID and stage ID.'
            });
        }

        // Format the dates for the response
        const dates = result.rows.map((row) => ({
            date_name: row.date_name,
            entered_date: row.entered_date,
            created_date: row.created_date,
            created_by: row.created_by,
            updated_date: row.updated_date,
            updated_by: row.updated_by,
        }));

        res.status(200).json({
            message: 'Dates retrieved successfully.',
            transaction_id,
            stage_id,
            stage_name: result.rows[0].stage_name, // Assuming all rows share the same stage_name
            dates,
        });
    } catch (error) {
        console.error('Error fetching transaction dates by stage:', error);
        res.status(500).json({ error: 'Database error' });
    }
};


// Retrieve all transactions with calendar details
exports.getAllTransactionsCalendar = async (req, res) => {
    try {
        const query = `
            SELECT 
                t.transaction_id, 
                t.first_name || ' ' || t.last_name AS transaction_name, 
                t.address1, 
                t.address2,
                t.city, 
                t.state, 
                t.zip, 
                t.list_price, 
                s.state AS state_name, 
                d.date_name,
                d.entered_date::DATE::TEXT AS entered_date, 
                td.task_id, 
                td.transaction_detail_id,
                td.task_name, 
                td.task_status,
                td.stage_id,  
                COALESCE(
                    td.task_due_date::DATE::TEXT, 
                    ((d.entered_date::DATE + td.task_days * INTERVAL '1 day')::DATE::TEXT)
                ) AS task_due_date
            FROM 
                tkg.transaction_detail td
            LEFT JOIN 
                tkg.dates d ON 
                    td.state_id = d.state_id AND 
                    td.date_id = d.date_id AND 
                    td.transaction_id = d.transaction_id AND 
                    td.stage_id = d.stage_id
            LEFT JOIN 
                tkg.transaction t ON t.transaction_id = td.transaction_id
            LEFT JOIN 
                tkg.state s ON t.state = s.state
            WHERE 
                td.date_id = d.date_id
            ORDER BY 
                task_due_date;
        `;

        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No transactions or dates found.'
            });
        }

        // Group transactions by transaction_id
        const groupedTransactions = result.rows.reduce((acc, row) => {
            const { transaction_id, transaction_name, address1, address2, city, state, zip, list_price, state_name } = row;
            const { date_name, task_due_date, task_id, task_name, task_status, stage_id, transaction_detail_id } = row;

            // Initialize the transaction group if it doesn't exist
            if (!acc[transaction_id]) {
                acc[transaction_id] = {
                    transaction_id,
                    transaction_name,
                    address: `${address1 || ''} ${address2 || ''}`.trim(),
                    city,
                    state,
                    zip,
                    list_price,
                    state_name,
                    dates: [],
                };
            }

            // Add date, task details, and stage_id directly to the transaction
            acc[transaction_id].dates.push({
                date_name,
                task_due_date,
                stage_id,  // Include stage_id
                task: {
                    task_id,
                    task_name,
                    task_status,
                    transaction_detail_id
                },
            });

            return acc;
        }, {});

        // Transform grouped transactions into an array of values
        const transactions = Object.values(groupedTransactions);

        res.status(200).json({
            message: 'All transactions calendar retrieved successfully.',
            transactions,
        });
    } catch (error) {
        console.error('Database query error:', error);  // Log the actual error
        res.status(500).json({
            message: 'Error fetching transaction details.',
            error: error.message,  // Include the error message in the response
        });
    }
};
