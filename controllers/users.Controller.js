const userService = require('../services/users.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

// 1. REGISTER
module.exports.registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password, age, phone, address, city, country, role } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    const userData = {
      firstname, lastname, email, password, age, phone, address, city, country,
      profileImage: req.file ? `/images/${req.file.filename}` : req.body.profileImage,
      role: role ? role.toLowerCase() : 'customer',
      isActive: true
    };

    const result = await userService.createUser(userData);
    return res.status(result.status).json({ success: result.status === 201, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports.createUser = module.exports.registerUser;

// 2. LOGIN
module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback', { expiresIn: '1d' });
    res.status(200).json({ success: true, token, user: { id: user._id, firstname: user.firstname, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. GET ALL (Standardized for Admin Dashboard)
module.exports.getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsers(req.query);
    // Explicitly return { success: true, data: [...] } for the frontend
    res.status(200).json({ 
      success: true, 
      data: Array.isArray(result.data) ? result.data : [] 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. GET BY ID
module.exports.getUserById = async (req, res) => {
  try {
    const result = await userService.getUserById(req.params.id);
    res.status(result.status).json({ success: result.status === 200, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. UPDATE
module.exports.updateUser = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.profileImage = `/images/${req.file.filename}`;
    
    const result = await userService.updateUser(req.params.id, updateData);
    res.status(result.status).json({ success: result.status === 200, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 6. DELETE
// Add this function to your existing controller file
module.exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};