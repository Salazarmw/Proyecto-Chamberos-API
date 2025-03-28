require('dotenv').config(); 
const mongoose = require('mongoose');
const Province = require('../models/Province');
const Canton = require('../models/Canton');

const seedProvinces = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing data
    await Province.deleteMany({});
    await Canton.deleteMany({});

    const provinces = [
      {
        name: 'San José',
        cantons: ['Central', 'Escazú', 'Desamparados', 'Puriscal', 'Tarrazú', 'Aserrí', 'Mora', 'Goicoechea', 'Santa Ana', 'Alajuelita', 'Vásquez de Coronado', 'Acosta', 'Tibás', 'Moravia', 'Montes de Oca', 'Turrubares', 'Dota', 'Curridabat', 'Pérez Zeledón', 'León Cortés']
      },
      {
        name: 'Alajuela',
        cantons: ['Central', 'San Ramón', 'Grecia', 'San Mateo', 'Atenas', 'Naranjo', 'Palmares', 'Poás', 'Orotina', 'San Carlos', 'Zarcero', 'Valverde Vega', 'Upala', 'Los Chiles', 'Guatuso', 'Río Cuarto']
      },
      {
        name: 'Cartago',
        cantons: ['Central', 'Paraíso', 'La Unión', 'Jiménez', 'Turrialba', 'Alvarado', 'Oreamuno', 'El Guarco']
      },
      {
        name: 'Heredia',
        cantons: ['Central', 'Barva', 'Santo Domingo', 'Santa Bárbara', 'San Rafael', 'San Isidro', 'Belén', 'Flores', 'San Pablo', 'Sarapiquí']
      },
      {
        name: 'Guanacaste',
        cantons: ['Liberia', 'Nicoya', 'Santa Cruz', 'Bagaces', 'Carrillo', 'Cañas', 'Abangares', 'Tilarán', 'Nandayure', 'La Cruz', 'Hojancha']
      },
      {
        name: 'Puntarenas',
        cantons: ['Central', 'Esparza', 'Buenos Aires', 'Montes de Oro', 'Osa', 'Quepos', 'Golfito', 'Coto Brus', 'Parrita', 'Corredores', 'Garabito']
      },
      {
        name: 'Limón',
        cantons: ['Central', 'Pococí', 'Siquirres', 'Talamanca', 'Matina', 'Guácimo']
      }
    ];

    // Insert provinces and cantons
    for (const provinceData of provinces) {
      const province = await Province.create({
        name: provinceData.name,
        code: provinceData.code
      });

      for (const cantonData of provinceData.cantons) {
        await Canton.create({
          name: cantonData.name,
          code: cantonData.code,
          province: province._id
        });
      }
    }

    console.log('Provinces and cantons seeded successfully');
  } catch (error) {
    console.error('Error al ejecutar el seeder:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedProvinces();