const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  user_type: { type: String, enum: ["client", "chambero"], required: true },
  profile_photo: { type: String },
  birth_date: { type: Date },
  address: { type: String },
  province: { type: String },
  canton: { type: String },
  phone: { type: String, default: "" },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  tokens: [{ token: { type: String, required: true } }], // Array to store multiple tokens
});

// Password hash
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate a JWT token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, user_type: this.user_type }, // Payload
    process.env.JWT_SECRET || "defaultSecretKeyForDevelopment", // Secret key from .env
    { expiresIn: "1d" } // Token expiration time
  );
};

module.exports = mongoose.model("User", userSchema);
