import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import styled from 'styled-components';

Chart.register(...registerables, ChartDataLabels);

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #f5f7fa;
`;

const ChartContainer = styled.div`
  border-radius: 10px;
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 95%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 10px;
  marginLeft: -20px;
`;

const RefreshButton = styled.button`
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #218838;
  }
`;

const Heading = styled.h2`
  color: #2c3e50;
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
`;

const LastFetchTime = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  color: black;
  font-size: 14px;
`;

const SubHeading = styled.h3`
  color: #34495e;
  font-size: 20px;
`;

const WeatherDetails = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ThresholdInputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;

  label {
    margin-right: 10px;
    font-weight: bold;
    color: #34495e;
    font-size: 18px;
  }

  input {
    width: 80px;
    padding: 8px;
    border-radius: 6px;
    border: 2px solid #28a745;
    font-size: 16px;
    text-align: center;
    color: #34495e;
    outline: none;
    transition: border-color 0.3s ease;

    &:focus {
      border-color: #218838;
    }
  }
`;


const DailySummary = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(new Date());

  // User-configurable thresholds
  const [tempThreshold, setTempThreshold] = useState(35); // Default: 35°C
  const [consecutiveUpdates, setConsecutiveUpdates] = useState(2); // Default: 2 consecutive updates

  // Track temperature alerts for cities
  const [temperatureAlerts, setTemperatureAlerts] = useState({});

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/weather/daily-summary');
      setData(response.data);
      console.log("DATA", response.data);
      setLastFetchTime(new Date()); // Update last fetch time

      // Check for consecutive temperature conditions
      const newAlerts = { ...temperatureAlerts };
      response.data.forEach((cityData) => {
        const city = cityData.city;
        const currentMaxTemp = cityData.max_temp;

        // Initialize tracking if it doesn't exist
        if (!newAlerts[city]) {
          newAlerts[city] = { count: 0, lastTempExceeded: false };
        }

        // Update count if the temperature exceeds the threshold
        if (currentMaxTemp > tempThreshold) {
          if (newAlerts[city].lastTempExceeded) {
            newAlerts[city].count += 1;
          } else {
            newAlerts[city].count = 1;
          }
          newAlerts[city].lastTempExceeded = true;
        } else {
          newAlerts[city].count = 0; // Reset if temperature is below the threshold
          newAlerts[city].lastTempExceeded = false;
        }

        // Trigger alert if the count reaches the consecutive updates threshold
        if (newAlerts[city].count >= consecutiveUpdates) {
          console.log(`Alert: The maximum temperature in ${city} exceeded ${tempThreshold}°C for ${consecutiveUpdates} consecutive updates.`);
          window.alert(`The maximum temperature in ${city} has exceeded ${tempThreshold}°C for ${consecutiveUpdates} consecutive updates.`);
          // Reset alert count after alerting
          newAlerts[city].count = 0;
        }
      });

      setTemperatureAlerts(newAlerts);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data immediately on mount

    const interval = setInterval(fetchData, 300000); // Set interval to 5 minutes (300000 ms)

    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMs = now - timestamp;
    const diffInMinutes = Math.floor(diffInMs / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 minute ago';
    return `${diffInMinutes} minutes ago`;
  };

  // Update "time ago" display every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setLastFetchTime(new Date(lastFetchTime));
    }, 60000); // Update every minute

    return () => clearInterval(timer); // Cleanup on unmount
  }, [lastFetchTime]);

  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.city]) {
      acc[item.city] = [];
    }
    acc[item.city].push(item);
    return acc;
  }, {});

  const createChartData = (cityData) => ({
    labels: ["Min Temp", "Avg Temp", "Max Temp"],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: [
          cityData.map(item => item.min_temp).reduce((a, b) => a + b, 0) / cityData.length,
          cityData.map(item => item.avg_temp).reduce((a, b) => a + b, 0) / cityData.length,
          cityData.map(item => item.max_temp).reduce((a, b) => a + b, 0) / cityData.length
        ],
        backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderRadius: 6,
        borderWidth: 1.5,
        barThickness: 30,
        datalabels: {
          anchor: 'end',
          align: 'top',
          color: 'white',
          font: {
            weight: 'bold',
            size: 12,
          },
        },
      },
    ],
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Container>
      <LastFetchTime>Last updated: {formatTimeAgo(lastFetchTime)}</LastFetchTime>

      <Heading>Daily Weather Summary</Heading>
      <ThresholdInputContainer>
        <label>
          Temperature Threshold (°C):
          <input
            type="number"
            value={tempThreshold}
            onChange={(e) => setTempThreshold(Number(e.target.value))}
          />
        </label>
      </ThresholdInputContainer>
      {Object.keys(groupedData).map((city) => {
        const cityData = groupedData[city][0];
        return (
          <ChartContainer key={city}>
            <SubHeading>{city}</SubHeading>
            <WeatherDetails>
              <p><strong>Main Condition:</strong> {cityData.dominant_condition}</p>
              <p><strong>Current Temperature:</strong> {cityData.avg_temp.toFixed(2)} °C</p>
              <p><strong>Feels Like:</strong> {cityData.feels_like.toFixed(2)} °C</p>
              <p><strong>Average Temperature:</strong> {cityData.avg_temp.toFixed(2)} °C</p>
              <p><strong>Min Temperature:</strong> {cityData.min_temp.toFixed(2)} °C</p>
              <p><strong>Max Temperature:</strong> {cityData.max_temp.toFixed(2)} °C</p>
              <p><strong>Last Updated:</strong> {new Date(cityData.update_time).toLocaleString()}</p>
            </WeatherDetails>
            <Bar
              data={createChartData(groupedData[city])}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                    labels: {
                      font: {
                        size: 12,
                        weight: 'bold',
                      },
                    },
                  },
                  datalabels: {
                    color: 'white',
                    font: {
                      size: 12,
                      weight: 'bold',
                    },
                  },
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Temperature Types',
                      color: '#333',
                      font: {
                        size: 14,
                        weight: 'bold',
                      },
                    },
                    grid: {
                      display: false,
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Temperature (°C)',
                      color: '#333',
                      font: {
                        size: 14,
                        weight: 'bold',
                      },
                    },
                    grid: {
                      color: 'rgba(200, 200, 200, 0.2)',
                    },
                  },
                },
              }}
              width={400}
              height={200}
            />
          </ChartContainer>
        );
      })}
    </Container>
  );
};

export default DailySummary;
