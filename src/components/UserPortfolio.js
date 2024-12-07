import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { getDoc, doc } from 'firebase/firestore';
import './UserPortfolio.css';

const UserPortfolio = () => {
    const [portfolio, setPortfolio] = useState({ current_portfolio: [], total: 0 });
    const navigate = useNavigate();
    const location = useLocation();
    const { childId, userRole } = location.state || {};

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

    const handleSell = (stockName) => {
        console.log(`Sell button clicked for stock: ${stockName}`);
        // Add functionality to sell the stock
    };

    return (
        <div className="portfolio-container">
            <h2>User Portfolio</h2>
            <h3>Total Profit: <span className={portfolio.total >= 0 ? 'profit-positive' : 'profit-negative'}>{portfolio.total}</span></h3>

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
                                <td>{stock.current_value}</td>
                                <td>{stock.units}</td>
                                <td>
                                    <span className={ stock.diff >= 0 ? 'profit-positive' : 'profit-negative' }>
                                    {stock.diff}
                                    </span>
                                </td>
                                <td>
                                    <button className="sell-button" onClick={() => handleSell(stock.stockName)}>Sell</button>
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