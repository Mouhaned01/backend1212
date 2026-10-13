const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String, required: true },
  img: { type: String },
  images: [{ type: String }],
  gallery: [{ type: String }],
  features: [{ type: String }], // <-- Make sure this line exists!
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);