// src/components/StockDetails.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StockChart from './StockChart';
import { Card, CardContent, Typography, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const StockDetails = ({ symbol }) => {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [latestPrice, setLatestPrice] = useState(null);
  const [actionType, setActionType] = useState(''); // Track whether it's Buy or Sell
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Manage dialog box state

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${process.env.REACT_APP_TWELVE_DATA_API_KEY}`
        );
        setStockData(response.data);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchStockData();
    }
  }, [symbol]);

  const fetchLatestPrice = async () => {
    try {
        const response = await axios.get(
            `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${process.env.REACT_APP_TWELVE_DATA_API_KEY}`
        );
        const price = response.data.close;
        setLatestPrice(price);
        return price;
        } catch (error) {
        console.error('Error fetching latest price:', error);
        throw error;
        }
    };
    

    const handleAction = async () => {
        try {
            const updatedPrice = await fetchLatestPrice(); // Fetch and get the latest price
        
            if (!updatedPrice) {
                throw new Error('Latest price is not available.');
            }
        
            const apiUrl =
                actionType === 'Buy'
                ? `${process.env.REACT_APP_API_BASE_URL}/api/stocks/buy-stock`
                : `${process.env.REACT_APP_API_BASE_URL}/api/stocks/sell-stock`;
        
            const response = await axios.post(apiUrl, {
                symbol: symbol,
                price: updatedPrice,
                action: actionType,
            });
        
            if (response.data.success) {
                alert(`${actionType} successful at price ${updatedPrice}`);
            } else {
                alert(`${actionType} failed.`);
            }
            } catch (error) {
            console.error(`Error during ${actionType.toLowerCase()} action:`, error);
            alert(`An error occurred. Please try again.`);
            } finally {
            setIsDialogOpen(false); // Close the dialog
            }
        };
      
  
  

  const openDialog = (action) => {
    setActionType(action);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!stockData || stockData.status === 'error') {
    return <Typography variant="h6">No data available for the selected stock.</Typography>;
  }

  const { meta, values } = stockData;
  const latestData = values[0];

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">
          {meta.symbol} - {meta.name}
        </Typography>
        <Typography variant="subtitle1">Exchange: {meta.exchange}</Typography>
        <Typography variant="subtitle1">Currency: {meta.currency}</Typography>
        <Typography variant="h6">Latest Close: {latestData.close}</Typography>
        <StockChart data={values} />
        {latestPrice && (
          <Typography variant="h6" style={{ marginTop: '20px' }}>
            Current Price: {latestPrice}
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          style={{ marginTop: '20px' }}
          onClick={fetchLatestPrice}
        >
          Get Latest Price
        </Button>
        <Button
          variant="outlined"
          color="success"
          style={{ marginTop: '20px', marginLeft: '10px' }}
          onClick={() => openDialog('Buy')}
        >
          Buy
        </Button>
        <Button
          variant="outlined"
          color="error"
          style={{ marginTop: '20px', marginLeft: '10px' }}
          onClick={() => openDialog('Sell')}
        >
          Sell
        </Button>
        {/* Confirmation Dialog */}
        <Dialog open={isDialogOpen} onClose={closeDialog}>
          <DialogTitle>Confirm {actionType}</DialogTitle>
          <DialogContent>
            <Typography>
              Do you want to {actionType.toLowerCase()} at price {latestPrice}?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog} color="secondary">
              No
            </Button>
            <Button onClick={handleAction} color="primary">
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StockDetails;
