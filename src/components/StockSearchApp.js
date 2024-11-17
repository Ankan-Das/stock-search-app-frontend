// src/components/StockSearchApp.js
import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import StockDetails from './StockDetails';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const StockSearchApp = () => {
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [maxLoss, setMaxLoss] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch `maxLoss` and `totalAmount` when the page loads
  useEffect(() => {
    const fetchValues = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/values/get-values`);
        const data = await response.json();
        setMaxLoss(data.maxLoss || 'No value set');
        setTotalAmount(data.totalAmount || 'No value set');
      } catch (error) {
        console.error('Error fetching values:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchValues();
  }, []);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Stock Search App
      </Typography>
      {/* Display Maximum Loss and Total Amount at the Page Level */}
      <Box display="flex" justifyContent="space-between" marginBottom={3}>
        <Typography variant="h6">Maximum Loss: {maxLoss}</Typography>
        <Typography variant="h6">Total Amount: {totalAmount}</Typography>
      </Box>
      {/* Back Button */}
      <Box marginBottom={2}>
        <button onClick={() => navigate('/')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Back to Landing Page
        </button>
      </Box>
      {/* Search Bar */}
      <SearchBar onSelect={setSelectedSymbol} />
      {/* Display Stock Details if a symbol is selected */}
      {selectedSymbol ? (
        <StockDetails symbol={selectedSymbol} />
      ) : (
        <Typography variant="h6" align="center" color="textSecondary" style={{ marginTop: '20px' }}>
          Search for a stock to see details and a price chart.
        </Typography>
      )}
    </Container>
  );
};

export default StockSearchApp;
