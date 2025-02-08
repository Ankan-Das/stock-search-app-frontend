import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserPortfolio.css';

const UserPortfolio = () => {
    const [portfolio, setPortfolio] = useState([]);
    const [livePrices, setLivePrices] = useState({});
    const [totalProfit, setTotalProfit] = useState("Loading...");
    const [showSellModal, setShowSellModal] = useState(false);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [tradeUnits, setTradeUnits] = useState(0);
    const [tradeType, setTradeType] = useState("");
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

            const eventSource = new EventSource(API_URL + '/stock-updates');

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
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

    const handleTradeClick = (stock, type) => {
        setSelectedStock(stock);
        setTradeType(type);
        type === "sell" ? setShowSellModal(true) : setShowBuyModal(true);
    };

    const handleTrade = async () => {
        setShowConfirmModal(true);
    };

    const handleConfirmTrade = async (confirmed) => {
        if (!confirmed) {
            setShowSellModal(false);
            setShowBuyModal(false);
            setShowConfirmModal(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/stocks/trade`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: childId,
                    stock_id: selectedStock.stock_id,
                    transaction_type: tradeType,
                    units: tradeUnits,
                    price: livePrices[selectedStock.stock_id]
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${tradeType} stock`);
            }

            setShowSellModal(false);
            setShowBuyModal(false);
            setShowConfirmModal(false);
            window.location.reload();
        } catch (error) {
            console.error(`Error ${tradeType}ing stock:`, error);
            setShowSellModal(false);
            setShowBuyModal(false);
            setShowConfirmModal(false);
        }
    };

    return (
        <div className="portfolio-container">
            <h2>User Portfolio</h2>
            <h3>Total Profit: <span className={`flip ${totalProfit >= 0 ? 'profit-positive' : 'profit-negative'}`}><span className="number">{totalProfit}</span></span></h3>
            <div>
                <button 
                    className="trade-more-button"
                    onClick={() => navigate('/transaction', { state: { userId: childId } })}
                >Transactions</button>
            </div>
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
                                <td>{livePrices[stock.stock_id] || "Loading..."}</td>
                                <td>{stock.units}</td>
                                <td>{((livePrices[stock.stock_id] - stock.average_buy_price) * stock.units).toFixed(2)}</td>
                                <td>
                                    <div className="button-container">
                                        <button className="sell-button" onClick={() => handleTradeClick(stock, "sell")}>Sell</button>
                                        <button className="buy-button" onClick={() => handleTradeClick(stock, "buy")}>Buy</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                <button 
                    className="trade-more-button"
                    onClick={() => navigate('/buy-stocks', { state: { userId: childId } })}
                >Trade More</button>
            </div>
            <button
                className="trade-more-button"
                onClick={() => userRole === "user" ? navigate("/user-home") : navigate("/master-home")}
            >
                Go Back
            </button>

            {(showSellModal || showBuyModal) && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{tradeType === "sell" ? "Sell Stock" : "Buy Stock"}</h3>
                        <p>Stock: {selectedStock.stock_id}</p>
                        <p>Current Value: {livePrices[selectedStock.stock_id]}</p>
                        <label>
                            Units to {tradeType}: 
                            <input
                                type="number"
                                value={tradeUnits}
                                onChange={(e) => setTradeUnits(Number(e.target.value))}
                                min={1}
                            />
                        </label>
                        <button onClick={handleTrade}>{tradeType}</button>
                        <button onClick={() => tradeType === "sell" ? setShowSellModal(false) : setShowBuyModal(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Confirm Sell</h3>
                        <p>Are you sure you want to sell {tradeUnits} units of {selectedStock.stock_id}?</p>
                        <button onClick={() => handleConfirmTrade(true)}>Yes</button>
                        <button onClick={() => handleConfirmTrade(false)}>No</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default UserPortfolio;