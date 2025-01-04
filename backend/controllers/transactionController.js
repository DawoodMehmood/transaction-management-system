// controllers/transactionController.js
const pool = require('../models/db');

exports.getAllTransactions = async (req, res) => {
    try {
        const query = `
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
                -- Calculate total and completed tasks for each transaction
                COUNT(td.task_id) AS total_tasks,
                COUNT(CASE WHEN LOWER(td.task_status) = 'completed' THEN 1 END) AS completed_tasks
            FROM 
                tkg.transaction t
            LEFT JOIN 
                tkg.transaction_detail td 
            ON 
                t.transaction_id = td.transaction_id
            GROUP BY 
                t.transaction_id  -- Group by transaction to aggregate task counts
            ORDER BY 
                t.created_date DESC;  -- Order by newest transactions
        `;

        const result = await pool.query(query);

        res.status(200).json({
            message: 'Transactions retrieved successfully.',
            transactions: result.rows
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({
            message: 'Error fetching transactions.',
            error: error.message
        });
    }
};

exports.addTransaction = async (req, res) => {
    const {
        first_name, last_name, address1, address2, city, state, zip,
        list_price, stage_id, delete_ind, created_by
    } = req.body;

    try {
        // Insert a new transaction and return the generated ID
        const result = await pool.query(
            `INSERT INTO tkg.transaction 
            (first_name, last_name, address1, address2, city, state, zip, 
             list_price, stage_id, delete_ind, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
             RETURNING *`,  // Returning the inserted transaction
            [
                first_name || null, last_name || null, address1 || null,
                address2 || null, city || null, state || null, zip || null,
                list_price || null, stage_id || null, delete_ind || false,
                created_by || 'Faisal'
            ]
        );

        const newTransaction = result.rows[0];  // Store the new transaction
        console.log("Transaction added with ID:", newTransaction.transaction_id);

        // Insert task details for the new transaction
        const taskDetails = await pool.query(
            `INSERT INTO tkg.transaction_detail 
            (transaction_id, transaction_detail_id, list_price, sale_price, 
             state_id, date_id, transaction_date, stage_id, task_id, task_name, 
             task_status, delete_ind, created_date, created_by)
             SELECT 
                 $1::BIGINT AS transaction_id, 
                 ROW_NUMBER() OVER (PARTITION BY $1 ORDER BY b.task_id) AS transaction_detail_id, 
                 $2::NUMERIC AS list_price, 
                 $2::NUMERIC AS sale_price, 
                 b.state AS state_id,  
                 b.date_id, 
                 NULL AS transaction_date,  
                 b.stage_id, 
                 b.task_id, 
                 b.task_name, 
                 'Open' AS task_status, 
                 FALSE AS delete_ind, 
                 CURRENT_DATE AS created_date, 
                 $3 AS created_by
             FROM 
                 tkg.tasks b 
             WHERE 
                 b.state = $4
             RETURNING *`,  // Return the newly inserted task details
            [
                newTransaction.transaction_id, // Ensure it's passed as a bigint
                list_price || 0,               // Ensure it's a numeric value
                created_by || 'Faisal',
                state
            ]
        );

        // Respond with the new transaction and its details
        res.status(201).json({
            message: 'Transaction added successfully.',
            transaction: {
                ...newTransaction,
                transaction_details: taskDetails.rows
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


exports.getTransactionDetails = async (req, res) => {
    const { transaction_id } = req.params;

    try {
        const query = `
           SELECT 
            td.transaction_id, 
            td.transaction_detail_id, 
            td.list_price, 
            td.sale_price, 
            td.state_id, 
            td.date_id, 
            td.transaction_date, 
            td.stage_id, 
            MAX(st.stage_name) AS stage_name,  -- Aggregation to avoid duplicates
            td.task_id, 
            td.task_name, 
            td.task_status, 
            td.delete_ind, 
            td.created_date, 
            td.created_by, 
            td.updated_date, 
            td.updated_by, 
            MAX(t.task_days) AS task_days  -- Aggregation to avoid duplicates
            FROM 
                tkg.transaction_detail td
            LEFT JOIN 
                tkg.tasks t ON td.task_id = t.task_id
            LEFT JOIN 
                tkg.stages st ON td.stage_id = st.stage_id
            WHERE 
                td.transaction_id = $1
            GROUP BY 
                td.transaction_id, td.transaction_detail_id, td.list_price, td.sale_price, 
                td.state_id, td.date_id, td.transaction_date, td.stage_id, td.task_id, 
                td.task_name, td.task_status, td.delete_ind, td.created_date, td.created_by, 
                td.updated_date, td.updated_by
            ORDER BY 
                td.transaction_detail_id;

        `;

        const result = await pool.query(query, [transaction_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No details found for the given transaction ID.'
            });
        }

        res.status(200).json({
            message: 'Transaction details retrieved successfully.',
            transaction_id,
            details: result.rows
        });
    } catch (error) {
        console.error("Error fetching transaction details:", error);
        res.status(500).json({
            message: 'Error fetching transaction details.',
            error: error.message
        });
    }
};


// GET all dates
exports.getDates = async (req, res) => {
    try {
        const query = 'SELECT * FROM tkg.formdates';
        const result = await pool.query(query);
        res.status(200).json(result.rows); // Send the dates as JSON
    } catch (error) {
        console.error('Error fetching dates:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getStages = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tkg.stages ORDER BY state_id, stage_id');
        res.status(200).json(result.rows); // Return the rows as JSON
    } catch (error) {
        console.error('Error fetching stages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
                td.list_price, 
                td.sale_price, 
                td.state_id, 
                td.date_id, 
                td.transaction_date, 
                td.delete_ind, 
                td.created_date, 
                td.created_by, 
                td.updated_date, 
                td.updated_by,
                td.is_skipped,
                td.skip_reason,
                td.notes, 
                t.task_days,
                COALESCE(td.task_due_date, td.created_date + t.task_days * INTERVAL '1 day') AS task_due_date
            FROM 
                tkg.transaction_detail td
            LEFT JOIN 
                tkg.tasks t ON td.task_id = t.task_id
                AND td.state_id = t.state 
                AND td.stage_id = t.stage_id
            WHERE 
                td.transaction_id = $1
            ORDER BY 
                td.stage_id, td.task_id;
        `;

        const result = await pool.query(query, [transaction_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'No details found for the given transaction ID.'
            });
        }

        // Group tasks by stage_id
        const groupedDetails = result.rows.reduce((acc, row) => {
            const { stage_id, task_id, transaction_detail_id, task_name, task_status, task_days, is_skipped, skip_reason, notes, task_due_date } = row;

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
                task_days,
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
          SELECT state_id, date_id, date_name, entered_date, created_date, created_by, transaction_id, stage_id, updated_date, updated_by
          FROM tkg.dates
          WHERE transaction_id = $1 AND stage_id = $2;
        `;
        const datesResult = await client.query(fetchDatesQuery, [transaction_id, current_stage]);
  
        if (datesResult.rows.length > 0) {
          const insertDatesQuery = `
            INSERT INTO tkg.dates (state_id, date_id, date_name, entered_date, created_date, created_by, transaction_id, stage_id, updated_date, updated_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (state_id, date_name, transaction_id, stage_id)
            DO NOTHING;
          `;
          const insertPromises = datesResult.rows.map((date) =>
            client.query(insertDatesQuery, [
              date.state_id,
              date.date_id,
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
        const query = `
            SELECT 
                t.stage_id,
                COALESCE(SUM(t.list_price)::BIGINT, 0) AS stage_total_price,
                COUNT(t.transaction_id) AS transaction_count
            FROM 
                tkg.transaction t
            WHERE 
                t.delete_ind = false  -- Exclude deleted transactions
            GROUP BY 
                t.stage_id
            ORDER BY 
                t.stage_id;
        `;

        const totalQuery = `
            SELECT 
                COALESCE(SUM(list_price)::BIGINT, 0) AS total_price,
                COUNT(transaction_id) AS total_transaction_count
            FROM 
                tkg.transaction
            WHERE 
                delete_ind = false;
        `;

        // Execute both queries in parallel
        const [stageResult, totalResult] = await Promise.all([
            pool.query(query),
            pool.query(totalQuery)
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
                updated_date = NOW()
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
    const { transaction_id, stage_id, taskDueDate, count, frequency } = req.body;

    try {
        // Fetch the row to duplicate
        const fetchQuery =  `
        SELECT * 
        FROM tkg.transaction_detail
        WHERE transaction_detail_id = $1 AND transaction_id = $2 AND stage_id = $3;`
        
        const fetchResult = await pool.query(fetchQuery, [transaction_detail_id, transaction_id, stage_id]);

        if (fetchResult.rowCount === 0) {
            return res.status(404).json({ message: 'Task not found for duplication.' });
        }

        const taskToDuplicate = fetchResult.rows[0];

        // Frequency-based date increment logic
        const calculateNewDate = (currentDate, frequency, increment) => {
            const newDate = new Date(currentDate); // Clone the current date
            if (frequency === 'Every two days') {
                newDate.setDate(newDate.getDate() + 2 * increment);
            } else if (frequency === 'Every week') {
                newDate.setDate(newDate.getDate() + 7 * increment);
            } else if (frequency === 'Every month') {
                newDate.setMonth(newDate.getMonth() + 1 * increment);
            }
            return newDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
        };

        const duplicatedTasks = [];

        // Duplicate the task `count` number of times
        for (let i = 1; i <= count; i++) {
            const newDueDate = calculateNewDate(taskDueDate, frequency, i);

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
                    list_price, sale_price, state_id, date_id, transaction_date, delete_ind, 
                    created_date, created_by, updated_date, updated_by,
                    skip_reason, is_skipped, skipped_by, skipped_date
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8,
                    $9, $10, $11, $12, $13, $14,
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
                taskToDuplicate.task_status,
                newDueDate,
                taskToDuplicate.notes,
                taskToDuplicate.list_price,
                taskToDuplicate.sale_price,
                taskToDuplicate.state_id,
                taskToDuplicate.date_id,
                taskToDuplicate.transaction_date,
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

