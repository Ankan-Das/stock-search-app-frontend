import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';


const API_URL = process.env.REACT_APP_API_BASE_URL;

const Login = () => {
    const [formData, setFormData] = useState({ userId: '', password: ''});
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // useEffect(() => {
    //     const checkIfLoggedIn = async () => {
    //         try {
    //             const response = await axios.get(`${API_URL}/check_session`, { withCredentials: true });
    //             if (response.status === 200 && response.data.logged_in) {
    //                 navigate('/home');  // Redirect to /home if user is already logged in
    //             }
    //         } catch (error) {
    //             console.error('User not logged in:', error);
    //         }
    //     };
    //     checkIfLoggedIn();
    // }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("JUST BEFORE LOGIN");
            console.log(formData);
            const response = await axios.post(`${API_URL}/api/auth/login`, formData, { withCredentials: true });
            setMessage(response.data.message);
            console.log(response.data);
            if (response.data.role === "admin") {
                navigate('/admin-home')
            } else {
                navigate('/home')
            }
        } catch (error) {
            setMessage('Invalid credentials');
        };
    };

    return (
        <div className="login-container">
            <h2>Login Page</h2>
            <div className='form-container'>
                <form onSubmit={ handleSubmit }>
                    <input type='text' name='userId' placeholder='user-0000' onChange={handleChange} required />
                    <input type='password' name='password' placeholder='password' onChange={handleChange} required />
                    {message && <p>{message}</p>}
                    <button className='login-button' type='submit'>Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;

