const Province = require("../models/Province");

const getProvinces = async (req, res) => {
  try {
    const provinces = await Province.find();
    res.status(200).json(provinces);
  } catch (error) {
    res.status(500).json({ error: "Error fetching provinces" });
  }
};

const getProvinceById = async (req, res) => {
  try {
    const province = await Province.findById(req.params.id);
    if (!province) {
      return res.status(404).json({ error: "Province not found" });
    }
    res.status(200).json(province);
  } catch (error) {
    res.status(500).json({ error: "Error fetching province" });
  }
};

module.exports = { getProvinces, getProvinceById };
