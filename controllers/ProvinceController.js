const Province = require('../models/Province');

const getProvinces = async (req, res) => {
  try {
    const provinces = await Province.find(); 
    res.status(200).json(provinces); 
  } catch (error) {
    res.status(500).json({ error: 'Error fetching provinces' }); 
  }
};

module.exports = { getProvinces };