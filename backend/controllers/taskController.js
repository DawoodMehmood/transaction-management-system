// controllers/taskController.js
const pool = require('../models/db');

exports.getAllTasks = async (req, res) => {
    try {
      const { state, transaction_type } = req.query;
      
      if (!state || !transaction_type) {
        return res.status(400).json({ error: 'State and transaction type are required.' });
      }
        const result = await pool.query('SELECT * FROM tkg.tasks WHERE state = $1 AND transaction_type = $2', [state, transaction_type]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteTask = async (req, res) => {
    const { taskId, state, stageId, transaction_type } = req.body;
  
    try {
      // Delete the task from 'tkg.tasks'
      const deleteTaskQuery = `
        DELETE FROM tkg.tasks
        WHERE task_id = $1 AND state = $2 AND stage_id = $3 AND transaction_type = $4;
      `;
      await pool.query(deleteTaskQuery, [taskId, state, stageId, transaction_type]);
  
      res.status(200).json({ message: 'Task deleted successfully.' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: 'Error deleting task.', error: error.message });
    }
  };
  
exports.addTask = async (req, res) => {
    const {
      task_name,
      date_id,
      task_days,
      state,
      stage_id,
      created_by,
      is_repeatable = false,
      frequency = null,
      interval = null,
      interval_type = null,
      transaction_type
    } = req.body;
  
    try {
      // Validate required fields
      if (!task_name || !date_id || task_days === undefined || !state || !stage_id || !created_by || !transaction_type) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Step 1: Find the next task_id for the given stage_id
      const nextTaskIdQuery = `
        SELECT COALESCE(MAX(task_id), 0) + 1 AS next_task_id
        FROM tkg.tasks
        WHERE stage_id = $1 AND state = $2 AND transaction_type = $3;
      `;
  
      const nextTaskIdResult = await pool.query(nextTaskIdQuery, [stage_id, state, transaction_type]);
      const nextTaskId = nextTaskIdResult.rows[0].next_task_id;
  
      // Step 2: Insert the new task with the calculated task_id
      const insertQuery = `
        INSERT INTO tkg.tasks 
        (task_id, task_name, date_id, task_days, state, stage_id, created_by, is_repeatable, frequency, interval, interval_type, created_date, transaction_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12)
        RETURNING task_id
      `;
  
      const values = [
        nextTaskId,
        task_name,
        date_id,
        task_days,
        state,
        stage_id,
        created_by,
        is_repeatable,
        frequency,
        interval,
        interval_type,
        transaction_type
      ];
  
      const result = await pool.query(insertQuery, values);
  
      const insertedTaskId = result.rows[0].task_id;
  
      res.status(201).json({ message: 'Task added successfully', task_id: insertedTaskId });
    } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).json({ message: 'Error adding task.', error: error.message });
    }
  };
  
  exports.updateTask = async (req, res) => {
    const {
      task_id,
      state,
      stage_id,
      task_name,
      date_id,
      task_days,
      is_repeatable = false,
      frequency = null,
      interval = null,
      interval_type = null,
      transaction_type
    } = req.body;
  
    try {
      // Validate required fields
      if (!task_id || !task_name || !date_id || task_days === undefined || !transaction_type) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Update the task
      const updateQuery = `
        UPDATE tkg.tasks
        SET 
          task_name = $1,
          date_id = $2,
          task_days = $3,
          is_repeatable = $4,
          frequency = $5,
          interval = $6,
          interval_type = $7,
          updated_date = NOW()
        WHERE task_id = $8 AND stage_id = $9 AND state = $10 AND transaction_type = $11
        RETURNING *
      `;
  
      const values = [
        task_name,
        date_id,
        task_days,
        is_repeatable,
        frequency,
        interval,
        interval_type,
        task_id,
        stage_id,
        state,
        transaction_type
      ];
  
      const result = await pool.query(updateQuery, values);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      res.status(200).json({ message: 'Task updated successfully', task: result.rows[0] });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ message: 'Error updating task.', error: error.message });
    }
  };
  