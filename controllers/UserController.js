const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate('tags');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('tags');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, user_type, profile_photo, birth_date, address, province, canton, tags } = req.body;

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

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, password, user_type, profile_photo, birth_date, address, province, canton, tags } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; //Should hash the password in the future
    if (user_type) user.user_type = user_type;
    if (profile_photo) user.profile_photo = profile_photo;
    if (birth_date) user.birth_date = birth_date;
    if (address) user.address = address;
    if (province) user.province = province;
    if (canton) user.canton = canton;
    if (tags) user.tags = tags;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};