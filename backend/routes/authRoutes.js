// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/users', authController.getUsers);
router.delete('/user', authController.deleteUser);
router.put('/user', authController.editUser);

module.exports = router;