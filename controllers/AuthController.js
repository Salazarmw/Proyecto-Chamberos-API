const User = require("../models/User");

exports.register = async (req, res) => {
  const {
    name,
    email,
    password,
    user_type,
    profile_photo,
    birth_date,
    address,
    province,
    canton,
    tags,
  } = req.body;

  try {
    // Verify if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create a new user
    const user = new User({
      name,
      email,
      password,
      user_type,
      profile_photo,
      birth_date,
      address,
      province,
      canton,
      tags,
    });

    // Save user in the database
    const newUser = await user.save();

    // Generate JWT token
    const token = newUser.generateToken();

    // Respond with the token and user data
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        user_type: newUser.user_type,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Verify if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Verify the password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT token
      const token = user.generateToken();
  
      // Respond with the token and user data
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          user_type: user.user_type
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
