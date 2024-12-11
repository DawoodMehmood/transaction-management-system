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
                t.task_days
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
            const { stage_id, task_id, task_name, task_status, task_days } = row;

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
                task_id, 
                task_name, 
                task_status, 
                task_days, 
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
    const { task_id } = req.params;
    const { transaction_id, stage_id, task_status } = req.body; // Include stage_id in the body

    try {
        // Update the task status for the given task_id, stage_id, and transaction_id
        const updateQuery = `
            UPDATE tkg.transaction_detail
            SET task_status = $1, updated_date = NOW()
            WHERE task_id = $2 AND transaction_id = $3 AND stage_id = $4
            RETURNING task_id, task_name, task_status, stage_id;
        `;

        const updateResult = await pool.query(updateQuery, [task_status, task_id, transaction_id, stage_id]);

        if (updateResult.rowCount === 0) {
            return res.status(404).json({
                message: 'Task not found for the given task_id, stage_id, and transaction_id.'
            });
        }

        const updatedTask = updateResult.rows[0];

        // Check if the updated task status is 'completed'
        const shouldRemoveFromFrontend = updatedTask.task_status.toLowerCase() === 'completed';

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
            task: updatedTask, // Includes updated task with stage_id
            remove: shouldRemoveFromFrontend, // Signal for frontend to remove the task if completed
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

    try {
        // Ensure the transaction exists and the current stage matches
        const checkQuery = `
            SELECT stage_id 
            FROM tkg.transaction 
            WHERE transaction_id = $1;
        `;
        const checkResult = await pool.query(checkQuery, [transaction_id]);

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                message: 'Transaction not found.'
            });
        }
        console.log(checkResult.rows[0]);

        const existingStage = checkResult.rows[0].stage_id;
        console.log(existingStage);

        if (existingStage != current_stage) {
            return res.status(400).json({
                message: `The current stage is not '${current_stage}', update aborted.`
            });
        }

        // Update the transaction stage
        const updateQuery = `
            UPDATE tkg.transaction
            SET stage_id = $1, updated_date = NOW()
            WHERE transaction_id = $2
            RETURNING transaction_id, stage_id;
        `;
        const updateResult = await pool.query(updateQuery, [new_stage, transaction_id]);

        res.status(200).json({
            message: 'Transaction stage updated successfully.',
            transaction: updateResult.rows[0]
        });
    } catch (error) {
        console.error('Error updating transaction stage:', error);
        res.status(500).json({
            message: 'Error updating transaction stage.',
            error: error.message
        });
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
