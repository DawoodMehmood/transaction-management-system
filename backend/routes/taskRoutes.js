// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.getAllTasks);
router.post('/add', taskController.addTask);
router.put('/:task_id', taskController.updateTask);
router.delete('/:task_id', taskController.deleteTask);

module.exports = router;