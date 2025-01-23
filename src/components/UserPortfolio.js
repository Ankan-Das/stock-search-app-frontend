import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import './UserPortfolio.css';

const UserPortfolio = () => {
    const [portfolio, setPortfolio] = useState({ current_portfolio: [], total: 0 });
    const [livePrices, setLivePrices] = useState({});
    const [totalProfit, setTotalProfit] = useState("Loading...");
    const navigate = useNavigate();
    const location = useLocation();
    const { childId, userRole } = location.state || {};
    const WS_URL = "ws://localhost:5000/stock-data"; // Replace with your backend WebSocket URL

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                if (!childId) {
                    navigate('/');
                    return;
                }

                const portfolioDoc = await getDoc(doc(db, 'userPortfolio', childId));

                if (portfolioDoc.exists()) {
                    setPortfolio(portfolioDoc.data());
                } else {
                    console.error("Portfolio not found for user: ", childId);
                }
            } catch (error) {
                console.error("Error fetching portfolio: ", error);
            }
        };

        fetchPortfolio();
    }, [navigate, childId]);

    useEffect(() => {
        if (portfolio.current_portfolio.length > 0) {
            const symbols = portfolio.current_portfolio.map(stock => stock.stock_id);
            const socket = new WebSocket(WS_URL);

            socket.onopen = () => {
                // Subscribe to symbols
                socket.send(JSON.stringify({ action: "subscribe", symbols }));
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setLivePrices((prevPrices) => ({
                    ...prevPrices,
                    [data.symbol]: parseFloat(data.price).toFixed(2),
                }));
            };

            socket.onerror = (error) => {
                console.error("WebSocket error:", error);
            };

            socket.onclose = () => {
                console.log("WebSocket closed");
            };

            return () => {
                socket.close();
            };
        }
    }, [portfolio.current_portfolio]);

    useEffect(() => {
        if (Object.keys(livePrices).length > 0) {
            const profit = portfolio.current_portfolio.reduce((total, stock) => {
                const currentPrice = parseFloat(livePrices[stock.stock_id.split(":")[0]]);
                return total + ((currentPrice - stock.buy_value) * stock.units);
            }, 0);
            setTotalProfit(profit.toFixed(2));
        }
    }, [livePrices, portfolio.current_portfolio]);

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
                        {portfolio.current_portfolio.map((stock, index) => (
                            <tr key={index}>
                                <td>{stock.stock_id}</td>
                                <td>{stock.buy_value}</td>
                                <td className="flip"><span className="number">{livePrices[stock.stock_id.split(":")[0]] || "Loading..."}</span></td>
                                <td>{stock.units}</td>
                                <td>
                                    <span className={`flip ${livePrices[stock.stock_id.split(":")[0]] ? (((livePrices[stock.stock_id.split(":")[0]] - stock.buy_value) * stock.units) >= 0 ? 'profit-positive' : 'profit-negative') : ''}`}>
                                        <span className="number">{livePrices[stock.stock_id.split(":")[0]] ? (((livePrices[stock.stock_id.split(":")[0]] - stock.buy_value) * stock.units).toFixed(2)) : "Loading..."}</span>
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