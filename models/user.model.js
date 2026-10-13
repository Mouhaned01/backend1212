const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // Changed to bcryptjs to perfectly match your controller package

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      trim: true,
    },
    lastname: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ],
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    age: {
      type: Number,
      min: [15, "L'âge minimum autorisé est 15 ans."],
      max: [80, "L'âge maximum autorisé est 80 ans."],
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// FIXED: Clean async/await pre-save hook. No 'next' parameter required.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error(error.message);
  }
});

// Virtual populate to dynamically see a user's bookings if needed
userSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "user",
});

// Permettre la population virtuelle lors de toJSON
userSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", userSchema);
module.exports = User;