const axios = require('axios');
const cron = require('node-cron');
const db = require('../config/db');
const dotenv = require('dotenv');
const { sendAlert } = require('../utils/alertService');
dotenv.config();

const API_KEY = process.env.OPENWEATHER_API_KEY;
const cities = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad'];

const fetchWeatherData = async () => {
  for (const city of cities) {
    console.log("API ABHI", API_KEY);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
    try {
      const response = await axios.get(url);
      const data = response.data;
      console.log("CITY DATA", data);

      const tempCelsius = data.main.temp - 273.15; // Kelvin to Celsius conversion
      const feelsLikeCelsius = data.main.feels_like - 273.15; // Convert feels_like
      const updateTime = new Date(data.dt * 1000).toISOString(); // Convert Unix timestamp to ISO string

      processWeatherData(city, tempCelsius, feelsLikeCelsius, data, updateTime);
    } catch (error) {
      console.error(`Error fetching weather data for ${city}:`, error);
    }
  }
};

const processWeatherData = (city, temp, feelsLike, data, updateTime) => {
  const currentDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  try {
    db.run(
      `INSERT INTO daily_summary (date, city, avg_temp, max_temp, min_temp, dominant_condition, feels_like, update_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [currentDate, city, temp, temp, temp, data.weather[0].main, feelsLike, updateTime],
      (err) => {
        if (err) console.error("Error storing daily summary:", err);
      }
    );
  } catch (error) {
    
  }

  
};

// cron.schedule('*/5 * * * *', fetchWeatherData); // Every 5 minutes

module.exports = { fetchWeatherData };
