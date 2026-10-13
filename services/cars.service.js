const Car = require('../models/car.model');

/**
 * Add a new car to the fleet inventory
 */
module.exports.createCar = async (carData) => {
  try {
    const car = new Car(carData);
    await car.save();
    return { status: 201, message: 'Car registered successfully', data: car };
  } catch (error) {
    console.error('Error creating car entry:', error);
    return { status: 400, message: error.message || 'Error saving vehicle record.', error };
  }
};

/**
 * Get all cars with dynamic search filters (e.g. ?type=SUV)
 */
module.exports.getAllCars = async (filter = {}) => {
  try {
    const cars = await Car.find(filter);
    return { status: 200, data: cars };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

/**
 * Get a specific vehicle record by ID
 */
module.exports.getCarById = async (carId) => {
  try {
    const car = await Car.findById(carId);
    if (!car) return { status: 404, message: 'Car record not found' };
    return { status: 200, data: car };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};

/**
 * Update vehicle details or operational status
 */
module.exports.updateCar = async (carId, updateData) => {
  try {
    const car = await Car.findByIdAndUpdate(
      carId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!car) return { status: 404, message: 'Car record not found' };
    return { status: 200, message: 'Vehicle data updated successfully', data: car };
  } catch (error) {
    return { status: 400, message: error.message };
  }
};

/**
 * Delete a vehicle entry from fleet database
 */
module.exports.deleteCar = async (carId) => {
  try {
    const car = await Car.findByIdAndDelete(carId);
    if (!car) return { status: 404, message: 'Car record not found' };
    return { status: 200, message: 'Vehicle deleted successfully' };
  } catch (error) {
    return { status: 500, message: error.message };
  }
};