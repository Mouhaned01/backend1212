const express = require('express');
const router = express.Router();
const carsController = require('../controllers/cars.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Routes
router.post('/', verifyToken, isAdmin, carsController.addCar);
router.get('/', carsController.getAllCars); 
router.get('/all', carsController.getAllCars); 
router.get('/stats/count', carsController.getCarCount); 
router.put('/:id', verifyToken, isAdmin, carsController.updateCar);
router.delete('/:id', verifyToken, isAdmin, carsController.deleteCar);

module.exports = router;