import React from 'react';
import DailySummary from './components/DailySummary';
import Alerts from './components/Alerts';

function App() {
  return (
    <div className="App">
      <center><h1>Weather Monitoring Dashboard</h1></center>
      <DailySummary />
      <Alerts />
    </div>
  );
}

export default App;
