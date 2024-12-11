// controllers/taskController.js
const pool = require('../models/db');

exports.getAllTasks = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tkg.tasks');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};