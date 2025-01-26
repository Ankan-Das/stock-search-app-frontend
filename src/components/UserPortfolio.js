import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserPortfolio.css';

const UserPortfolio = () => {
    const [portfolio, setPortfolio] = useState([]);
    const [livePrices, setLivePrices] = useState({});
    const [totalProfit, setTotalProfit] = useState("Loading...");
    const navigate = useNavigate();
    const location = useLocation();
    const { childId, userRole } = location.state || {};
    const API_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchPortfolioFromBackend = async () => {
            try {
                if (!childId) {
                    navigate('/');
                    return;
                }

                const response = await fetch(`${API_URL}/api/stocks/get_portfolio?user_id=${childId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch portfolio');
                }

                const data = await response.json();
                console.log(data);
                setPortfolio(data.portfolio);
            } catch (error) {
                console.error("Error fetching portfolio from backend:", error);
            }
        };

        fetchPortfolioFromBackend();
    }, [navigate, childId, API_URL]);

    useEffect(() => {
        if (portfolio.length > 0) {
            fetch(API_URL + '/update-subscription', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbols: portfolio.map(stock => stock.stock_id) }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update subscription');
                }
                console.log('Subscription updated successfully');
            })
            .catch(error => console.error('Error updating subscription:', error));


            // ------- Establish SSE Connection --------------
            const eventSource = new EventSource(API_URL + '/stock-updates');

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);

                // Convert array to object with symbols as keys
                const updatedPrices = data.reduce((acc, stock) => {
                    acc[stock.symbol] = stock.price;
                    return acc;
                }, {});

                setLivePrices((prevPrices) => ({ ...prevPrices, ...updatedPrices }));
            };

            eventSource.onerror = () => {
                console.error('SSE connection failed');
                eventSource.close();
            };

            return () => eventSource.close();
        }
    }, [portfolio]);

    useEffect(() => {
        if (Object.keys(livePrices).length > 0) {
            const profit = portfolio.reduce((total, stock) => {
                const currentPrice = parseFloat(livePrices[stock.stock_id]);
                return total + ((currentPrice - stock.average_buy_price) * stock.units);
            }, 0);
            setTotalProfit(profit.toFixed(2));
        }
    }, [livePrices, portfolio]);

    const handleSell = (stockName) => {
        console.log(`Sell button clicked for stock: ${stockName}`);
        // Add functionality to sell the stock
    };

    return (
        <div className="portfolio-container">
            <h2>User Portfolio</h2>
            <h3>Total Profit: <span className={`flip ${totalProfit >= 0 ? 'profit-positive' : 'profit-negative'}`}><span className="number">{totalProfit}</span></span></h3>

            <div className="portfolio-table">
                <table>
                    <thead>
                        <tr>
                            <th>Stock Name</th>
                            <th>Buy Value</th>
                            <th>Current Value</th>
                            <th>Units Bought</th>
                            <th>Current Profit</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {portfolio.map((stock, index) => (
                            <tr key={index}>
                                <td>{stock.stock_id}</td>
                                <td>{stock.average_buy_price}</td>
                                <td className="flip"><span className="number">{livePrices[stock.stock_id] || "Loading..."}</span></td>
                                <td>{stock.units}</td>
                                <td>
                                    <span className={`flip ${livePrices[stock.stock_id] ? (((livePrices[stock.stock_id] - stock.average_buy_price) * stock.units) >= 0 ? 'profit-positive' : 'profit-negative') : ''}`}>
                                        <span className="number">{livePrices[stock.stock_id] ? (((livePrices[stock.stock_id] - stock.average_buy_price) * stock.units).toFixed(2)) : "Loading..."}</span>
                                    </span>
                                </td>
                                <td>
                                    <button className="sell-button" onClick={() => handleSell(stock.stock_id)}>Sell</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div>
                <button className="trade-more-button">Trade More</button>
            </div>
            <button
                className="trade-more-button"
                onClick={() => userRole === "user" ? navigate("/user-home") : navigate("/master-home")}
            >
                Go Back
            </button>
        </div>
    );
};

export default UserPortfolio;