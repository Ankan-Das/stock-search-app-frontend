// src/components/LandingPage.js
import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [maxLoss, setMaxLoss] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [inputMaxLoss, setInputMaxLoss] = useState('');
  const [inputTotalAmount, setInputTotalAmount] = useState('');
  const navigate = useNavigate();

  // Fetch the current Maximum Loss and Total Amount from the backend
  useEffect(() => {
    const fetchValues = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/values/get-values`);
        const data = await response.json();
        setMaxLoss(data.maxLoss || 'No value set');
        setTotalAmount(data.totalAmount || 'No value set');
      } catch (error) {
        console.error('Error fetching values:', error);
        setMaxLoss('No value set');
        setTotalAmount('No value set');
      }
    };

    fetchValues();
  }, []);

  // Update Maximum Loss and Total Amount values in the backend
  const updateValues = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/values/set-values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxLoss: inputMaxLoss,
          totalAmount: inputTotalAmount,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMaxLoss(data.maxLoss);
        setTotalAmount(data.totalAmount);
      } else {
        alert('Failed to update values.');
      }
    } catch (error) {
      console.error('Error updating values:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Set Values
      </Typography>
      <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
        <Typography variant="h6">
          Current Maximum Loss: {maxLoss}
        </Typography>
        <TextField
          label="Set Maximum Loss"
          variant="outlined"
          value={inputMaxLoss}
          onChange={(e) => setInputMaxLoss(e.target.value)}
        />
        <Typography variant="h6">
          Current Total Amount: {totalAmount}
        </Typography>
        <TextField
          label="Set Total Amount"
          variant="outlined"
          value={inputTotalAmount}
          onChange={(e) => setInputTotalAmount(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={updateValues}>
          Save Values
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate('/stock-search')}
        >
          Go to Stock Search App
        </Button>
      </Box>
    </Container>
  );
};

export default LandingPage;
