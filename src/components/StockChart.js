// src/components/StockChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, Typography } from '@mui/material';

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
