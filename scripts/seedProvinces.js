require('dotenv').config(); 
const mongoose = require('mongoose');
const Province = require('../models/Province');

const seedProvinces = async () => {
  try {

    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a la base de datos');

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

    for (const province of provinces) {
      const createdProvince = await Province.create({ name: province.name });
      const cantons = province.cantons.map(canton => ({ name: canton, province_id: createdProvince._id }));
      await mongoose.connection.collection('cantons').insertMany(cantons);
    }

    console.log('Provinces and cantons seeded');
  } catch (error) {
    console.error('Error al ejecutar el seeder:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedProvinces();