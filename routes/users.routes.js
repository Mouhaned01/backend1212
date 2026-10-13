const express = require('express');
const router = express.Router();
// Changed to match the exact filename: users.controller.js
const usersController = require('../controllers/users.controller'); 

// Now these will work correctly:
router.get('/', usersController.getAllUsers);
router.post('/register', usersController.registerUser);
router.post('/login', usersController.loginUser);
// Add this line to your routes file
router.delete('/:id', usersController.deleteUser);

module.exports = router;