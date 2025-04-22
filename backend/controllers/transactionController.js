// controllers/transactionController.js
const pool = require('../models/db');

exports.getAllTransactions = async (req, res) => {
  try {
    const { transaction_type } = req.query;

    if (!transaction_type) {
      return res.status(400).json({ error: 'Transaction type is required.' });
    }

    // Base query: select transactions matching the provided transaction_type
    let query = `
      SELECT 
        t.transaction_id, 
        t.first_name, 
        t.last_name, 
        t.address1, 
        t.address2, 
        t.city, 
        t.state, 
        t.list_price, 
        t.stage_id, 
        t.zip, 
        t.delete_ind, 
        t.created_date, 
        t.created_by, 
        t.updated_date, 
        t.updated_by,
        COUNT(td.task_id) AS total_tasks,
        COUNT(CASE WHEN LOWER(td.task_status) = 'completed' THEN 1 END) AS completed_tasks
      FROM 
        tkg.transaction t
      LEFT JOIN 
        tkg.transaction_detail td 
      ON 
        t.transaction_id = td.transaction_id
      WHERE 
        t.transaction_type = $1
    `;
    const params = [transaction_type];

    // If the logged-in user is not superadmin and has allowedStates, add filtering.
    if (
      req.user &&
      req.user.role !== 'superadmin' &&
      req.user.allowedStates &&
      req.user.allowedStates.length > 0
    ) {
      query += ` AND t.state = ANY($2)`;
      params.push(req.user.allowedStates);
    }

    query += `
      GROUP BY 
        t.transaction_id
      ORDER BY 
        t.created_date DESC;
    `;

    const result = await pool.query(query, params);

    res.status(200).json({
      message: 'Transactions retrieved successfully.',
      transactions: result.rows,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      message: 'Error fetching transactions.',
      error: error.message,
    });
  }
};


exports.addTransaction = async (req, res) => {
    const {
        first_name, last_name, address1, address2, city, state, zip,
        list_price, stage_id, delete_ind, created_by, transaction_type
    } = req.body;

    try {
        // Step 1: Insert a new transaction
        const result = await pool.query(
            `INSERT INTO tkg.transaction 
            (first_name, last_name, address1, address2, city, state, zip, 
             list_price, stage_id, delete_ind, created_by, transaction_type) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
             RETURNING *`,
            [
                first_name || null, last_name || null, address1 || null,
                address2 || null, city || null, state || null, zip || null,
                list_price || null, stage_id || null, delete_ind || false,
                created_by || 'Faisal', transaction_type
            ]
        );

        const newTransaction = result.rows[0];
        console.log("Transaction added with ID:", newTransaction.transaction_id);

        // Step 2: Insert initial tasks for the transaction
        const taskDetails = await pool.query(
            `INSERT INTO tkg.transaction_detail 
            (transaction_id, transaction_detail_id, 
             state_id, date_id, stage_id, task_id, task_name, task_days,
             task_status, delete_ind, created_date, created_by, transaction_type)
             SELECT 
                 $1::BIGINT AS transaction_id, 
                 ROW_NUMBER() OVER (PARTITION BY $1 ORDER BY b.task_id) AS transaction_detail_id, 
                 b.state AS state_id,  
                 b.date_id, 
                 b.stage_id, 
                 b.task_id, 
                 b.task_name, 
                 b.task_days,
                 'Open' AS task_status, 
                 FALSE AS delete_ind, 
                 CURRENT_DATE AS created_date, 
                 $2 AS created_by,
                 transaction_type
             FROM 
                 tkg.tasks b 
             WHERE 
                 b.state = $3 AND b.transaction_type = $4
             RETURNING *`,
            [
                newTransaction.transaction_id,
                created_by || 'Faisal',
                state,
                transaction_type
            ]
        );

        const initialTasks = taskDetails.rows;

        // Step 3: Handle repeatable tasks by modifying `task_days`
        const duplicatedTasks = [];
        for (const task of initialTasks) {
            // Fetch the repeat configuration for the task
            const taskConfigQuery = `
                SELECT is_repeatable, frequency, interval, interval_type 
                FROM tkg.tasks 
                WHERE task_id = $1 AND stage_id = $2 AND state = $3 AND transaction_type = $4
            `;
            const taskConfigResult = await pool.query(taskConfigQuery, [task.task_id, task.stage_id, task.state_id, task.transaction_type]);
            const taskConfig = taskConfigResult.rows[0];

            // Proceed only if the task is repeatable
            if (taskConfig?.is_repeatable) {
                const { frequency, interval, interval_type } = taskConfig;

                for (let i = 1; i <= frequency; i++) {

                    // Determine the new `transaction_detail_id`
                    const maxTransactionDetailIdQuery = `
                        SELECT MAX(transaction_detail_id) AS max_id 
                        FROM tkg.transaction_detail 
                        WHERE transaction_id = $1
                    `;
                    const maxIdResult = await pool.query(maxTransactionDetailIdQuery, [newTransaction.transaction_id]);
                    const maxId = maxIdResult.rows[0]?.max_id || 0;

                    const newTransactionDetailId = parseInt(maxId) + 1;

                    // Insert the duplicate task with updated `task_days`
                    const duplicateTaskQuery = `
                        INSERT INTO tkg.transaction_detail 
                        (transaction_id, transaction_detail_id,
                        state_id, date_id, stage_id, task_id, task_name, task_days, 
                        task_status, delete_ind, created_date, created_by, transaction_type)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Open', FALSE, CURRENT_DATE, $9, $10)
                        RETURNING *
                    `;

                    const duplicateTaskValues = [
                        newTransaction.transaction_id,
                        newTransactionDetailId,
                        task.state_id,
                        task.date_id,
                        task.stage_id,
                        task.task_id,
                        task.task_name,
                        null,
                        created_by || 'Faisal',
                        task.transaction_type
                    ];

                    const duplicateResult = await pool.query(duplicateTaskQuery, duplicateTaskValues);
                    duplicatedTasks.push(duplicateResult.rows[0]);
                }
            }
        }

        // Combine initial tasks and duplicated tasks for response
        const allTasks = [...initialTasks, ...duplicatedTasks];

        // Step 4: Respond with transaction details
        res.status(201).json({
            message: 'Transaction added successfully.',
            transaction: {
                ...newTransaction,
                transaction_details: allTasks
            }
        });
    } catch (error) {
        console.error("Error adding transaction:", error);
        res.status(500).json({
            message: 'Error adding transaction.',
            error: error.message
        });
    }
};


exports.getDates = async (req, res) => {
    try {
        const { state, transaction_type } = req.query;

        if (!state || !transaction_type) {
            return res.status(400).json({ error: 'State and transaction type are required.' });
        }
        const query = 'SELECT * FROM tkg.formdates WHERE state_id = $1 AND transaction_type = $2';
        const result = await pool.query(query, [state, transaction_type]);
        res.status(200).json(result.rows); // Send the dates as JSON
    } catch (error) {
        console.error('Error fetching dates:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getStages = async (req, res) => {
    try {
        const { state, transaction_type } = req.query;

        if (!state || !transaction_type) {
            return res.status(400).json({ error: 'State and transaction type are required.' });
        }

        const query = `
        SELECT stage_id, stage_name, created_date, created_by
        FROM tkg.stages
        WHERE state_id = $1 AND transaction_type = $2
        ORDER BY stage_id
      `;
        const result = await pool.query(query, [state, transaction_type]);
        res.status(200).json({ stages: result.rows });
    } catch (error) {
        console.error("Error fetching stages:", error);
        res.status(500).json({ error: error.message || "Error fetching stages" });
    }
};

// Retrieve checklist details for a specific transaction
exports.getChecklistDetails = async (req, res) => {
    const { transaction_id } = req.params;

    try {
        const query = `
                SELECT 
                    td.stage_id, 
                    td.task_id, 
                    td.task_name, 
                    td.task_status, 
                    td.transaction_id, 
                    td.transaction_detail_id, 
                    td.state_id, 
                    td.date_id, 
                    td.delete_ind, 
                    td.created_date, 
                    td.created_by, 
                    td.updated_date, 
                    td.updated_by,
                    td.is_skipped,
                    td.skip_reason,
                    td.notes, 
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
                WHERE 
                    td.transaction_id = $1
                    AND (
                        (td.date_id IS NOT NULL AND d.date_id IS NOT NULL)
                        OR (td.task_due_date IS NOT NULL)
                    )
                ORDER BY 
                    td.stage_id, td.task_id, task_due_date;
            `;

        const result = await pool.query(query, [transaction_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No details found for the given transaction ID.'
            });
        }

        // Group tasks by stage_id
        const groupedDetails = result.rows.reduce((acc, row) => {
            const { stage_id, task_id, transaction_detail_id, task_name, task_status, is_skipped, skip_reason, notes, task_due_date } = row;

            // Initialize the group if it doesn't exist
            if (!acc[stage_id]) {
                acc[stage_id] = {
                    stage_id,
                    tasks: [],
                };
            }

            // Determine if the task should be removed (status = 'completed')
            const shouldRemove = task_status.toLowerCase() === 'completed';

            // Add task details with the 'remove' flag
            acc[stage_id].tasks.push({
                stage_id,
                task_id,
                transaction_detail_id,
                task_name,
                task_status,
                is_skipped,
                skip_reason,
                notes,
                task_due_date,
                remove: shouldRemove
            });

            return acc;
        }, {});

        res.status(200).json({
            message: 'Transaction details retrieved successfully.',
            transaction_id,
            stages: Object.values(groupedDetails),
        });

    } catch (error) {
        console.error("Error fetching transaction details:", error);
        res.status(500).json({
            message: 'Error fetching transaction details.',
            error: error.message,
        });
    }
};


// Change task status for a specific stage
exports.updateTaskStatus = async (req, res) => {
    const { transaction_detail_id } = req.params;
    const { transaction_id, stage_id, task_status, skip_reason = null } = req.body; // Default skip_reason to null

    try {
        // Base query for updating task status, is_skipped, and skip_reason
        let updateQuery = `
            UPDATE tkg.transaction_detail
            SET 
                task_status = $1, 
                is_skipped = $5, 
                skip_reason = $6, 
                updated_date = NOW()
        `;
        const queryValues = [task_status, transaction_detail_id, transaction_id, stage_id];

        // Determine the value of `is_skipped` and `skip_reason`
        let isSkipped = false;
        let newSkipReason = null;

        if (task_status === 'Open' && skip_reason) {
            isSkipped = true; // Mark as skipped when transitioning to Open with a reason
            newSkipReason = skip_reason;
        } else if (task_status === 'Completed') {
            isSkipped = false; // Clear skipped flag and reason when marking as completed
        }

        queryValues.push(isSkipped, newSkipReason);

        updateQuery += `
            WHERE transaction_detail_id = $2 AND transaction_id = $3 AND stage_id = $4
            RETURNING transaction_detail_id, task_name, task_status, stage_id, skip_reason, is_skipped;
        `;

        // Execute the query
        const updateResult = await pool.query(updateQuery, queryValues);

        if (updateResult.rowCount === 0) {
            return res.status(404).json({
                message: 'Task not found for the given transaction_detail_id, stage_id, and transaction_id.'
            });
        }

        const updatedTask = updateResult.rows[0];

        // Fetch total tasks and completed tasks count for the given stage and transaction
        const countQuery = `
            SELECT 
                COUNT(*) AS total_tasks, 
                COUNT(CASE WHEN LOWER(task_status) = 'completed' THEN 1 END) AS completed_tasks
            FROM tkg.transaction_detail
            WHERE transaction_id = $1 AND stage_id = $2;
        `;

        const countResult = await pool.query(countQuery, [transaction_id, stage_id]);
        const { total_tasks, completed_tasks } = countResult.rows[0];

        res.status(200).json({
            message: 'Task status updated successfully.',
            total_tasks,
            completed_tasks,
            task: updatedTask, // Includes updated task with stage_id, skip_reason, and is_skipped
        });

    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).json({
            message: 'Error updating task status.',
            error: error.message
        });
    }
};


exports.updateTransactionStage = async (req, res) => {
    const { transaction_id } = req.params;
    const { current_stage, new_stage } = req.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        await client.query('BEGIN'); // Start the transaction

        // Ensure the transaction exists and the current stage matches
        const checkQuery = `
        SELECT stage_id 
        FROM tkg.transaction
        WHERE transaction_id = $1;
      `;
        const checkResult = await client.query(checkQuery, [transaction_id]);

        if (checkResult.rows.length === 0) {
            throw new Error('Transaction not found.');
        }

        const existingStage = checkResult.rows[0].stage_id;

        if (existingStage != current_stage) {
            throw new Error(`The current stage is not '${current_stage}', update aborted.`);
        }

        // Update the transaction's stage
        const updateStageQuery = `
        UPDATE tkg.transaction
        SET stage_id = $1, updated_date = NOW()
        WHERE transaction_id = $2
        RETURNING transaction_id, stage_id;
      `;
        const updateStageResult = await client.query(updateStageQuery, [new_stage, transaction_id]);

        // Clone dates only when moving up a stage
        if (new_stage > current_stage) {
            const fetchDatesQuery = `
          SELECT state_id, date_id, transaction_type, date_name, entered_date::DATE::TEXT, created_date, created_by, transaction_id, stage_id, updated_date, updated_by
          FROM tkg.dates
          WHERE transaction_id = $1 AND stage_id = $2;
        `;
            const datesResult = await client.query(fetchDatesQuery, [transaction_id, current_stage]);

            if (datesResult.rows.length > 0) {
                const insertDatesQuery = `
            INSERT INTO tkg.dates 
            (state_id, date_id, transaction_type, date_name, entered_date, created_date, created_by, transaction_id, stage_id, updated_date, updated_by)
            VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT ON CONSTRAINT unique_state_date_name_transaction
            DO NOTHING;
          `;
                const insertPromises = datesResult.rows.map((date) =>
                    client.query(insertDatesQuery, [
                        date.state_id,
                        date.date_id,
                        date.transaction_type,
                        date.date_name,
                        date.entered_date,
                        date.created_date,
                        date.created_by,
                        transaction_id,
                        new_stage,
                        date.updated_date,
                        date.updated_by,
                    ])
                );

                await Promise.all(insertPromises); // Execute all insert queries
            }

            // Fetch tasks with `null` task_days for the new stage
            const fetchTasksQuery = `
              SELECT td.transaction_detail_id, t.date_id, td.task_id, t.task_days, t.is_repeatable, t.frequency, t.interval, t.interval_type
              FROM tkg.transaction_detail td
              JOIN tkg.tasks t ON td.task_id = t.task_id AND td.stage_id = t.stage_id AND td.state_id = t.state
              WHERE td.transaction_id = $1 AND td.task_days IS NULL AND td.stage_id = $2
              ORDER BY td.task_id, td.transaction_detail_id;
          `;
            const tasksWithNullTaskDays = (await client.query(fetchTasksQuery, [transaction_id, new_stage])).rows;

            // Group tasks by task_id
            const tasksGroupedByTaskId = tasksWithNullTaskDays.reduce((acc, task) => {
                acc[task.task_id] = acc[task.task_id] || [];
                acc[task.task_id].push(task);
                return acc;
            }, {});

            function addMonthsSafely(date, months) {
                const newDate = new Date(date);
                const expectedMonth = newDate.getMonth() + months;
                newDate.setMonth(expectedMonth);

                if (newDate.getDate() !== date.getDate()) {
                    newDate.setDate(0); // Moves to the last day of the previous month
                }

                return newDate;
            }

            // Process and update task_days
            for (const [taskId, taskGroup] of Object.entries(tasksGroupedByTaskId)) {
                const taskConfig = taskGroup[0]; // All tasks in the group share the same config
                const assignedDate = datesResult.rows.find((date) => date.date_id === taskConfig.date_id)?.entered_date;

                if (taskConfig.is_repeatable && assignedDate) {
                    const { interval, interval_type, task_days } = taskConfig;

                    // Parse assigned date
                    console.log('assigned date: ', assignedDate)
                    const [year, month, day] = assignedDate.split("-");
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
                            additionalDays = Math.floor((newDate - baseDate) / (1000 * 60 * 60 * 24));
                        }

                        const newTaskDays = (task_days || 0) + additionalDays;

                        // Update task_days for the current task
                        await client.query(
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
        }


        await client.query('COMMIT'); // Commit the transaction

        res.status(200).json({
            message: 'Transaction stage updated successfully.',
            transaction: updateStageResult.rows[0],
        });
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction on error
        console.error('Error updating transaction stage:', error.message);
        res.status(500).json({
            message: 'Error updating transaction stage.',
            error: error.message,
        });
    } finally {
        client.release(); // Release the client back to the pool
    }
};


// controllers/transactionController.js

exports.getStageWisePrices = async (req, res) => {
  try {
    const { transaction_type } = req.query;

    if (!transaction_type) {
      return res.status(400).json({ error: 'Transaction type is required.' });
    }

    // Build parameters and condition for filtering by allowed states
    let params = [transaction_type];
    let stateFilterClause = '';
    if (
      req.user &&
      req.user.role !== 'superadmin' &&
      req.user.allowedStates &&
      req.user.allowedStates.length > 0
    ) {
      stateFilterClause = ' AND t.state = ANY($2)';
      params.push(req.user.allowedStates);
    }

    const query = `
      SELECT 
        t.stage_id,
        COALESCE(SUM(t.list_price), 0) AS stage_total_price,
        COUNT(t.transaction_id) AS transaction_count
      FROM 
        tkg.transaction t
      WHERE 
        t.delete_ind = false
        AND t.transaction_type = $1
        ${stateFilterClause}
      GROUP BY 
        t.stage_id
      ORDER BY 
        t.stage_id;
    `;

    // Build the total query with similar filtering
    let totalParams = [transaction_type];
    let totalStateFilterClause = '';
    if (
      req.user &&
      req.user.role !== 'superadmin' &&
      req.user.allowedStates &&
      req.user.allowedStates.length > 0
    ) {
      totalStateFilterClause = ' AND state = ANY($2)';
      totalParams.push(req.user.allowedStates);
    }

    const totalQuery = `
      SELECT 
        COALESCE(SUM(list_price), 0) AS total_price,
        COUNT(transaction_id) AS total_transaction_count
      FROM 
        tkg.transaction
      WHERE 
        delete_ind = false
        AND transaction_type = $1
        ${totalStateFilterClause};
    `;

    // Execute both queries in parallel
    const [stageResult, totalResult] = await Promise.all([
      pool.query(query, params),
      pool.query(totalQuery, totalParams)
    ]);

    const stagePrices = stageResult.rows;
    const totalPrice = totalResult.rows[0].total_price;
    const totalTransactionCount = totalResult.rows[0].total_transaction_count;

    res.status(200).json({
      message: 'Transaction price summary retrieved successfully.',
      total_price: totalPrice,
      total_transaction_count: totalTransactionCount,
      stage_wise_prices: stagePrices
    });
  } catch (error) {
    console.error("Error fetching transaction price summary:", error);
    res.status(500).json({
      message: 'Error fetching transaction price summary.',
      error: error.message
    });
  }
};



exports.bulkDeleteTransactions = async (req, res) => {
    const { transaction_ids } = req.body;

    if (!transaction_ids || !Array.isArray(transaction_ids)) {
        return res.status(400).json({ message: 'Invalid transaction IDs.' });
    }

    try {
        // Step 1: Delete dependent rows in 'tkg.dates'
        const deleteDatesQuery = `
        DELETE FROM tkg.dates
        WHERE transaction_id = ANY($1::bigint[]);
      `;
        await pool.query(deleteDatesQuery, [transaction_ids]);

        // Step 2: Delete rows in 'tkg.transaction'
        const deleteTransactionsQuery = `
        DELETE FROM tkg."transaction"
        WHERE transaction_id = ANY($1::bigint[]);
      `;
        await pool.query(deleteTransactionsQuery, [transaction_ids]);

        res.status(200).json({ message: 'Transactions and related data deleted successfully.' });
    } catch (error) {
        console.error('Error deleting transactions:', error);
        res.status(500).json({ message: 'Error deleting transactions.', error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    const { transaction_detail_id } = req.params;
    const { transaction_id, stage_id, notes, task_due_date } = req.body;

    try {
        // Base query for updating task status, is_skipped, and skip_reason
        const updateQuery = `
            UPDATE tkg.transaction_detail
            SET 
                notes = $1, 
                task_due_date = $2, 
                updated_date = CURRENT_DATE
            WHERE transaction_detail_id = $3 AND transaction_id = $4 AND stage_id = $5
            RETURNING transaction_detail_id, task_name, task_status, stage_id, notes, task_due_date;
            `;

        const queryValues = [notes, task_due_date, transaction_detail_id, transaction_id, stage_id];

        // Execute the query
        const updateResult = await pool.query(updateQuery, queryValues);

        if (updateResult.rowCount === 0) {
            return res.status(404).json({
                message: 'Task not found for the given transaction_detail_id, stage_id, and transaction_id.'
            });
        }

        res.status(200).json({
            message: 'Task updated successfully.',
        });

    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).json({
            message: 'Error updating task status.',
            error: error.message
        });
    }
};

exports.duplicateTask = async (req, res) => {
    const { transaction_detail_id } = req.params;
    const { transaction_id, stage_id, taskDueDate, count, repeatInterval, frequency } = req.body;

    try {
        // Fetch the row to duplicate
        const fetchQuery = `
        SELECT * 
        FROM tkg.transaction_detail
        WHERE transaction_detail_id = $1 AND transaction_id = $2 AND stage_id = $3;`

        const fetchResult = await pool.query(fetchQuery, [transaction_detail_id, transaction_id, stage_id]);

        if (fetchResult.rowCount === 0) {
            return res.status(404).json({ message: 'Task not found for duplication.' });
        }

        const taskToDuplicate = fetchResult.rows[0];

        function addMonthsSafely(date, months) {
            const newDate = new Date(date);
            const expectedMonth = newDate.getMonth() + months;

            newDate.setMonth(expectedMonth);

            if (newDate.getDate() !== date.getDate()) {
                newDate.setDate(0); // Moves to the last day of the previous month
            }

            return newDate;
        }

        // Frequency-based date increment logic
        const calculateNewDate = (currentDate, repeatInterval, frequency, increment) => {
            console.log('currentDate:', currentDate);
            // Treat the input date as UTC by appending T00:00:00Z
            let utcDate = new Date(currentDate); // Ensure the input date is UTC
            console.log('utcDate:', utcDate);
            // Calculate the new date based on the frequency
            if (frequency === 'day') {
                utcDate.setUTCDate(utcDate.getUTCDate() + repeatInterval * increment);
            } else if (frequency === 'week') {
                utcDate.setUTCDate(utcDate.getUTCDate() + (repeatInterval * 7) * increment);
            } else if (frequency === 'month') {
                // utcDate.setUTCMonth(utcDate.getUTCMonth() + repeatInterval * increment);
                utcDate = addMonthsSafely(utcDate, repeatInterval * increment);
            }

            // Return the date in YYYY-MM-DD format
            return utcDate.toISOString().split('T')[0];
        };

        const duplicatedTasks = [];

        // Duplicate the task `count` number of times
        for (let i = 1; i <= count; i++) {
            const newDueDate = calculateNewDate(taskDueDate, repeatInterval, frequency, i);

            // Get the highest transaction_detail_id for the given transaction_id
            const getMaxIdQuery = `
                SELECT MAX(transaction_detail_id) AS max_id
                FROM tkg.transaction_detail
                WHERE transaction_id = $1;
            `;
            const maxIdResult = await pool.query(getMaxIdQuery, [transaction_id]);
            const maxId = maxIdResult.rows[0]?.max_id || 0;

            // Increment transaction_detail_id
            const newTransactionDetailId = parseInt(maxId) + i;

            // Insert the duplicated row with modifications
            const insertQuery = `
                INSERT INTO tkg.transaction_detail (
                    transaction_id, transaction_detail_id, stage_id, task_id, task_name, task_status, task_due_date, notes,
                    state_id, date_id, delete_ind, 
                    created_date, created_by, updated_date, updated_by,
                    skip_reason, is_skipped, skipped_by, skipped_date
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8,
                    $9, $10, $11,
                    CURRENT_DATE, 'system', NULL, NULL,
                    NULL, FALSE, NULL, NULL
                )
                RETURNING *;
            `;

            const queryValues = [
                taskToDuplicate.transaction_id,
                newTransactionDetailId,
                taskToDuplicate.stage_id,
                taskToDuplicate.task_id,
                taskToDuplicate.task_name,
                'Open',
                newDueDate,
                null,
                taskToDuplicate.state_id,
                taskToDuplicate.date_id,
                taskToDuplicate.delete_ind,
            ];

            const insertResult = await pool.query(insertQuery, queryValues);
            duplicatedTasks.push(insertResult.rows[0]);
        }

        res.status(201).json({
            message: 'Tasks duplicated successfully.',
            tasks: duplicatedTasks,
        });
    } catch (error) {
        console.error('Error duplicating tasks:', error);
        res.status(500).json({
            message: 'Error duplicating tasks.',
            error: error.message,
        });
    }
};


exports.updatePrice = async (req, res) => {
    const { transactionId, newPrice } = req.body;

    try {
        // Begin a transaction block
        await pool.query('BEGIN');

        // Update the price in the main transaction table
        const transactionResult = await pool.query(
            `UPDATE tkg.transaction
         SET list_price = $1
         WHERE transaction_id = $2
         RETURNING *`,
            [newPrice, transactionId]
        );

        if (transactionResult.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Transaction not found.' });
        }

        // Commit the transaction if both queries succeed
        await pool.query('COMMIT');

        console.log('Price updated for transaction:', transactionId);
        res.status(200).json({
            message: 'Price updated successfully.',
            transaction: transactionResult.rows[0],
        });
    } catch (error) {
        // Roll back any changes in case of an error
        await pool.query('ROLLBACK');
        console.error('Error updating price:', error);
        res.status(500).json({
            message: 'Error updating price.',
            error: error.message
        });
    }
};


exports.addTask = async (req, res) => {
    const {
        transaction_id,
        state_id,           // e.g., 'IL'
        stage_id,           // numeric stage id
        task_name,
        created_by,
        transaction_type,   // e.g., 'listing' or 'buyer'
        task_due_date
    } = req.body;

    // Validate required fields
    if (
        !transaction_id ||
        !state_id ||
        !stage_id ||
        !task_name ||
        !created_by ||
        !transaction_type ||
        !task_due_date
    ) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        // Step 1: Get the next task_id for the given transaction, stage, state, and transaction_type.
        const nextTaskIdQuery = `
      SELECT COALESCE(MAX(task_id), 0) + 1 AS next_task_id
      FROM tkg.transaction_detail
      WHERE transaction_id = $1 AND stage_id = $2 AND state_id = $3 AND transaction_type = $4;
    `;
        const nextTaskIdResult = await pool.query(nextTaskIdQuery, [
            transaction_id,
            stage_id,
            state_id,
            transaction_type
        ]);
        const nextTaskId = nextTaskIdResult.rows[0].next_task_id;
        console.log('next task id: ', nextTaskId)

        // Step 2: Get the next transaction_detail_id for the given transaction.
        const nextTDIdQuery = `
      SELECT COALESCE(MAX(transaction_detail_id), 0) + 1 AS next_td_id
      FROM tkg.transaction_detail
      WHERE transaction_id = $1;
    `;
        const nextTDIdResult = await pool.query(nextTDIdQuery, [transaction_id]);
        const nextTransactionDetailId = nextTDIdResult.rows[0].next_td_id;
        console.log('next transaction detail id: ', nextTransactionDetailId)

        // Step 3: Insert the new record into transaction_detail.
        const insertQuery = `
      INSERT INTO tkg.transaction_detail
        (transaction_id, transaction_detail_id, task_id, task_name, state_id, stage_id, transaction_type, created_by, task_status, is_skipped, delete_ind, task_due_date)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
        const values = [
            transaction_id,
            nextTransactionDetailId,
            nextTaskId,
            task_name,
            state_id,
            stage_id,
            transaction_type,
            created_by,
            'Open',
            false,
            false,
            task_due_date
        ];

        const insertResult = await pool.query(insertQuery, values);

        res.status(201).json({
            message: 'Task added to transaction detail successfully.',
            task: insertResult.rows[0]
        });
    } catch (error) {
        console.error('Error adding task to transaction detail:', error);
        res.status(500).json({
            message: 'Error adding task to transaction detail.',
            error: error.message
        });
    }
};
