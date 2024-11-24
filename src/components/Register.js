import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect } from 'react';
import './Register.css';

const API_URL = process.env.REACT_APP_API_BASE_URL;

const Register = () => {
    const [formData, setFormData] = useState({ password: '', confirmPassword: '', role: '' });
    const [message, setMessage] = useState('');
    const [messageColor, setMessageColor] = useState('');
    const [userId, setUserId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkIfLoggedIn = async () => {
            try {
                // Check the session status by making a request to the backend
                const response = await axios.get(`${API_URL}/check_session`, { withCredentials: true });
                if (response.status === 200 && response.data.logged_in) {
                    navigate('/home');  // Redirect to /home if user is already logged in
                }
            } catch (error) {
                console.error('User not logged in:', error);
            }
        };
        checkIfLoggedIn();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(formData);
            const response = await axios.post(`${API_URL}/api/auth/register`, formData);
            if (response.status === 200) {
                setUserId(response.data.userId); // Assuming response contains userId
                setMessageColor('green');
                setMessage(response.data.message);
                setIsModalOpen(true); // Open the modal to display the userId
            }
        } catch (error) {
            setMessageColor('red');
            setMessage(error.response.data.message);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
                <select name="role" className="role-select" onChange={handleChange} required>
                    <option value="">Select Role</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                    <button type="submit">Generate User Id</button>
                {message && <p style={{ color: messageColor }}>{message}</p>}
                <button type="button" className="login-button" onClick={() => navigate('/admin-home')}>Go to Home Page</button>
            </form>

            {/* Modal for displaying the User ID */}
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-button" onClick={closeModal}>&times;</span>
                        <p><strong>Generated User ID: {userId}</strong></p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
