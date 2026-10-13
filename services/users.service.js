const User = require('../models/user.model');

/**
 * Create a new user
 */
module.exports.createUser = async (userData) => {
    try {
        const secureUserData = {
            ...userData,
            role: userData.role === 'admin' ? 'customer' : (userData.role || 'customer')
        };

        const user = new User(secureUserData);
        await user.save();
        
        const userResponse = user.toJSON();
        delete userResponse.password;

        return {
            status: 201,
            message: 'User created successfully',
            data: userResponse
        };
    } catch (error) {
        return {
            status: 400,
            message: error.message || 'Error creating user',
            error: error
        };
    }
};

/**
 * Get all users
 */
module.exports.getAllUsers = async (filter = {}) => {
    try {
        // Query database with the filter, excluding password field
        const users = await User.find(filter).select('-password');
        
        return {
            status: 200,
            message: 'Users retrieved successfully',
            data: users // This is what your controller and frontend expect
        };
    } catch (error) {
        return {
            status: 500,
            message: 'Error retrieving users',
            error: error.message
        };
    }
};

/**
 * Get user by ID
 */
module.exports.getUserById = async (userId) => {
    try {
        const user = await User.findById(userId)
            .select('-password')
            .populate('bookings'); 

        if (!user) {
            return { status: 404, message: 'User not found' };
        }
        return {
            status: 200,
            message: 'User retrieved successfully',
            data: user
        };
    } catch (error) {
        return {
            status: 500,
            message: 'Error retrieving user',
            error: error.message
        };
    }
};

/**
 * Update user by ID
 */
module.exports.updateUser = async (userId, updateData) => {
    try {
        // Ensure critical fields aren't overwritten
        delete updateData.password;
        delete updateData.role; 
        
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return { status: 404, message: 'User not found' };
        }
        return {
            status: 200,
            message: 'User updated successfully',
            data: user
        };
    } catch (error) {
        return {
            status: 400,
            message: error.message || 'Error updating user',
            error: error
        };
    }
};