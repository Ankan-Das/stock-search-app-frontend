import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import './BuyStocks.css';

const BuyStocks = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = location.state || {};
    const [stocks, setStocks] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [livePrices, setLivePrices] = useState({});
    const [units, setUnits] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const API_URL = process.env.REACT_APP_API_BASE_URL;

    // Fetch all available stocks
    useEffect(() => {
        console.log("USER ID");
        console.log(userId);
        const fetchStocks = async () => {
            try {
                const response = await fetch(`${API_URL}/api/stocks/get_stocks`);
                if (!response.ok) {
                    throw new Error('Failed to fetch stocks');
                }
                const data = await response.json();
                setStocks(data.stocks);

                // Subscribe to updates for all stocks
                const symbols = data.stocks.map((stock) => stock.symbol);
                await fetch(`${API_URL}/update-subscription`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ "symbols": symbols })
                });
            } catch (error) {
                console.error("Error fetching stocks:", error);
            }
        };

        fetchStocks();
    }, [API_URL]);

    useEffect(() => {
        // Establish SSE connection for live price updates
        const eventSource = new EventSource(`${API_URL}/stock-updates`);

        eventSource.onmessage = (event) => {
            const updates = JSON.parse(event.data);
            const updatedPrices = updates.reduce((acc, stock) => {
                acc[stock.symbol] = stock.price;
                return acc;
            }, {});

            setLivePrices((prevPrices) => ({ ...prevPrices, ...updatedPrices }));
        };

        eventSource.onerror = () => {
            console.error("SSE connection failed");
            eventSource.close();
        };

        return () => eventSource.close();
    }, [API_URL]);

    const handleBuy = async () => {
        if (!selectedStock || units <= 0) {
            alert("Please select a stock and enter a valid number of units.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/stocks/trade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    stock_id: selectedStock.symbol,
                    transaction_type: 'buy',
                    units: units,
                    price: livePrices[selectedStock.symbol] || selectedStock.price, // Use live price or fallback to static price
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to buy stock');
            }

            setSuccessMessage(`Successfully purchased ${units} units of ${selectedStock.name}`);
            setSelectedStock(null);
            setUnits(0);
        } catch (error) {
            console.error("Error buying stock:", error);
        }
    };

    return (
        <div className="buy-stocks-container">
            <h2>Buy Stocks</h2>

            {/* Display all stocks in a flexbox */}
            <div className="stocks-grid">
                {stocks.map((stock) => (
                    <div
                        key={stock.id}
                        className={`stock-item ${selectedStock?.id === stock.id ? 'selected' : ''}`}
                        onClick={() => setSelectedStock(stock)}
                    >
                        <p>{stock.name}</p>
                        <p>({stock.symbol})</p>
                        <p>Live Price: {livePrices[stock.symbol] || 'Loading...'}</p>
                    </div>
                ))}
            </div>

            {selectedStock && (
                <div className="buy-section">
                    <h3>Selected Stock: {selectedStock.name} ({selectedStock.symbol})</h3>
                    <label>
                        Units to Buy:
                        <input
                            type="number"
                            value={units}
                            onChange={(e) => setUnits(Number(e.target.value))}
                        />
                    </label>
                    <button onClick={handleBuy}>Buy</button>
                </div>
            )}

            {successMessage && <div className="success-message">{successMessage}</div>}
        <div>
            <button
                type="submit"
                className="user-portfolio-btn"
                onClick={() => navigate('/user-portfolio', { state: { childId: userId, userRole: "user" } })}
            >
                Go to Portfolio
            </button>
        </div>
        </div>
    );
};

export default BuyStocks;
