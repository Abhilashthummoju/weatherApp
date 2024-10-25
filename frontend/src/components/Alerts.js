import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const response = await axios.get('http://localhost:5000/api/weather/alerts');
      setAlerts(response.data);
    };
    fetchAlerts();
  }, []);

  return (
    <div>
      <h2>Alerts</h2>
      <ul>
        {alerts.map(alert => (
          <li key={alert.id}>
            <strong>{alert.city}</strong>: {alert.condition} at {alert.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Alerts;
