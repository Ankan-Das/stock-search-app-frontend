// src/components/StockChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, Typography } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StockChart = ({ data }) => {
  // Reverse the data to ensure left-to-right rendering
  const reversedData = [...data].reverse();

  const chartData = {
    labels: reversedData.map((item) => item.datetime), // X-axis labels in left-to-right order
    datasets: [
      {
        label: 'Closing Price',
        data: reversedData.map((item) => parseFloat(item.close)), // Y-axis data in left-to-right order
        fill: false,
        borderColor: 'blue',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category', // Ensures the X-axis uses the "category" scale
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price',
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Price History</Typography>
        <div style={{ height: '400px' }}>
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChart;
