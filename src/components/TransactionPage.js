import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TransactionPage.css';

const API_URL = process.env.REACT_APP_API_BASE_URL;

const TransactionPage = () => {
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = location.state || {};

    useEffect(() => {
        if (!userId) {
            navigate('/');
            return;
        }

        const fetchTransactions = async () => {
            try {
                const response = await fetch(`${API_URL}/api/stocks/get_transactions?user_id=${userId}`);
                if (!response.ok) throw new Error('Failed to fetch transactions');

                const data = await response.json();
                setTransactions(data.transactions);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        };

        fetchTransactions();
    }, [userId, navigate]);

    return (
        <div className="transaction-container">
            <h2>Transaction History</h2>
            <div className="transaction-table">
                <table>
                    <thead>
                        <tr>
                            {/* <th>Transaction ID</th> */}
                            <th>Stock</th>
                            <th>Type</th>
                            <th>Units</th>
                            <th>Price</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.transaction_id}>
                                {/* <td>{transaction.transaction_id}</td> */}
                                <td>{transaction.symbol}</td>
                                <td className={transaction.transaction_type === 'buy' ? 'buy' : 'sell'}>
                                    {transaction.transaction_type.toUpperCase()}
                                </td>
                                <td>{transaction.units}</td>
                                <td>{transaction.price.toFixed(2)}</td>
                                <td>{new Date(transaction.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button className="back-button" onClick={() => navigate('/user-home')}>Go Back</button>
        </div>
    );
};

export default TransactionPage;
