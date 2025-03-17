const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/Jobs');
const quotationRoutes = require('./routes/quotations');
const reviewRoutes = require('./routes/reviews');
const tagRoutes = require('./routes/tags');
const provinceRoutes = require('./routes/provinces');
const authRoutes = require('./routes/auth')

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/provinces', provinceRoutes);
app.use('/api/auth', authRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Default route
app.get('/', (req, res) => {
  res.send('Backend Chamberos API'); //Para probar que el servidor está corriendo
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});