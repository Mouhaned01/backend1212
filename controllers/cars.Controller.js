const Car = require('../models/car.model');

// 1. ADD A NEW CAR
exports.addCar = async (req, res) => {
  try {
    const { name, type, price, image, img, images, gallery, features, isAvailable } = req.body;
    const imageUrl = image || img || (images && images[0]) || (gallery && gallery[0]);
    
    if (!name || !type || !price || !imageUrl) {
      return res.status(400).json({ success: false, error: 'Name, type, price, and image are required fields' });
    }

    // Ensure features is saved properly as an array
    const parsedFeatures = Array.isArray(features) 
      ? features 
      : (typeof features === 'string' ? features.split(',').map(f => f.trim()).filter(Boolean) : []);

    const newCar = await Car.create({ 
        name, 
        type, 
        price, 
        image: imageUrl, 
        img: imageUrl, 
        images: images || [imageUrl], 
        gallery: gallery || [], 
        features: parsedFeatures,
        isAvailable: isAvailable !== undefined ? isAvailable : true 
    });

    res.status(201).json({ success: true, message: 'Car added successfully!', data: newCar });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. GET ALL CARS - Sorted by newest first with total count for frontend
exports.getAllCars = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const totalCars = await Car.countDocuments();
    // Sorts by _id descending to guarantee newly added cars appear first
    const cars = await Car.find().sort({ _id: -1 }).skip(skip).limit(limit);

    res.status(200).json({ 
      success: true, 
      data: cars,
      totalCars: totalCars, // Sends the correct total count to update your UI badge
      currentPage: page,
      totalPages: Math.ceil(totalCars / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. GET TOTAL CAR COUNT
exports.getCarCount = async (req, res) => {
  try {
    const count = await Car.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. UPDATE CAR DETAILS
exports.updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.image && !updateData.img) updateData.img = updateData.image;
    if (updateData.img && !updateData.image) updateData.image = updateData.img;

    // Ensure features are correctly parsed if sent as strings or arrays during update
    if (updateData.features) {
      updateData.features = Array.isArray(updateData.features)
        ? updateData.features
        : updateData.features.split(',').map(f => f.trim()).filter(Boolean);
    }

    const updatedCar = await Car.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    
    if (!updatedCar) {
      return res.status(404).json({ success: false, error: 'Car not found' });
    }

    res.status(200).json({ success: true, data: updatedCar });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. DELETE A CAR
exports.deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    await Car.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};