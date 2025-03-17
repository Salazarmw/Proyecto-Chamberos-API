require('dotenv').config();
const mongoose = require('mongoose');
const Tag = require('../models/Tag');

const seedTags = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a la base de datos');

    const tags = [
      { name: 'Plomería' },
      { name: 'Electricidad' },
      { name: 'Carpintería' },
      { name: 'Pintura' },
      { name: 'Jardinería' },
      { name: 'Cerrajería' },
      { name: 'Albañilería' },
      { name: 'Fontanería' },
      { name: 'Reparación de electrodomésticos' },
      { name: 'Limpieza' },
      { name: 'Mudanzas' },
      { name: 'Mantenimiento de piscinas' },
      { name: 'Instalación de aire acondicionado' },
      { name: 'Reparación de techos' },
      { name: 'Decoración de interiores' },
      { name: 'Reparación de vehículos' },
      { name: 'Corte de césped' },
      { name: 'Instalación de sistemas de seguridad' },
      { name: 'Reparación de computadoras' },
      { name: 'Pintura de fachadas' },
    ];

    await Tag.insertMany(tags);
    console.log('Tags seeded');
  } catch (error) {
    console.error('Error al ejecutar el seeder:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedTags();