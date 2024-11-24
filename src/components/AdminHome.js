import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHome.css';

const AdminHome = () => {
    const navigate = useNavigate();

    return (
        <div className="admin-home-container">
            <h2>Admin Home</h2>
            <button
                type="submit"
                className="new-user-button"
                onClick={() => navigate('/add-user')}
            >
                Generate new User Id
            </button>
            <button
                type="button"
                className="logout-button"
                onClick={() => navigate('/')}
            >
                Logout
            </button>
        </div>
    );
};

export default AdminHome;
