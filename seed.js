// seed.js (in your root MOUHANED-MAIN folder)
require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('./models/car.model'); // Ensure this matches your file path
const { mockCars } = require('./data/cars'); // Ensure this matches your file path

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        // 1. Clear existing cars
        await Car.deleteMany({});
        console.log("Existing cars cleared.");

        // 2. Map mockCars to match your Mongoose schema exactly
        // Adjust these field names if your car.model.js uses different ones
        const carsToSave = mockCars.map(car => ({
            name: car.name,
            type: car.type,
            price: car.price,
            features: car.features,
            gallery: car.gallery,
            isAvailable: car.isAvailable !== undefined ? car.isAvailable : true,
            plateNumber: car.plateNumber // This is the field that was causing the error
        }));

        // 3. Insert the mapped data
        await Car.insertMany(carsToSave);
        console.log(`Database seeded successfully with ${carsToSave.length} cars!`);

        process.exit();
    } catch (err) {
        console.error("Error seeding database:", err);
        process.exit(1);
    }
};

seedDatabase();