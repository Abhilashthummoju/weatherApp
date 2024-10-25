// index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
// const WebSocket = require('ws');


const weatherRoutes = require('./routes/weatherRoutes');
const { fetchWeatherData } = require('./services/weatherService'); 

dotenv.config();

const app = express();

app.use(cors());
app.use(morgan('dev'));


  
// Routes
app.use('/api/weather', weatherRoutes);

fetchWeatherData();

// const cron = require('node-cron');
// cron.schedule('*/5 * * * *', fetchWeatherData);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// const wss = new WebSocket.Server({ server });

