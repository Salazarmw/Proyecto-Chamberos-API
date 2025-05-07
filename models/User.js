const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const workGallerySchema = new mongoose.Schema({
  image_url: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  uploaded_at: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  user_type: { type: String, enum: ["client", "chambero"], required: true },
  profile_photo: { type: String, default: null },
  birth_date: { type: Date },
  address: { type: String },
  province: { type: String },
  canton: { type: String },
  phone: { type: String, default: "" },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  tokens: [{ token: { type: String, required: true } }], // Array to store multiple tokens
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  // Social authentication fields
  socialId: { type: String },
  socialProvider: { type: String, enum: ['google', 'facebook'] },
  isProfileComplete: { type: Boolean, default: false },
  work_gallery: [workGallerySchema]
}, {
  timestamps: true,
});

// Password hash middleware
userSchema.pre("save", async function (next) {
  try {
    // Skip if password is not modified or if it's a social login
    if (!this.isModified("password") || this.socialProvider) {
      return next();
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    // If it's a social login, return true
    if (this.socialProvider) {
      return true;
    }
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Generate a JWT token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, user_type: this.user_type }, // Payload
    process.env.JWT_SECRET || "defaultSecretKeyForDevelopment", // Secret key from .env
    { expiresIn: "1d" } // Token expiration time
  );
};

// Generate JWT token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  delete user.verificationToken;
  delete user.verificationTokenExpires;
  return user;
};

module.exports = mongoose.model("User", userSchema);
