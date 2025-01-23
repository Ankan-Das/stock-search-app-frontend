import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import { getUserRole } from '../utils';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';


const API_URL = process.env.REACT_APP_API_BASE_URL;

const Login = () => {
    const [formData, setFormData] = useState({ userId: '', password: ''});
    const [messageColor, setMessageColor] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // useEffect(() => {
    //     const initial_role = getUserRole(auth.currentUser.email);
    //     console.log("CURRENT ROLE: ", initial_role);

    //     if (initial_role === 'user') navigate('/user-home');
    //     else if (initial_role === 'admin') navigate('/admin-home');
    //     else if (initial_role === 'master') navigate('/master-home');
    // }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // try {
        //         await setPersistence(auth, browserLocalPersistence);
        //     } catch (error) {
        //         console.error("Error setting persistence: ", error);
        //         return;
        //     }
        try {
            const email = `${formData.userId}@stocksapp.com`;
            await setPersistence(auth, browserLocalPersistence);
            await signInWithEmailAndPassword(auth, email, formData.password);
            setMessageColor('green');
            setMessage("user logged in successfully");

            // Wait for `auth.currentUser` to populate and then fetch the role
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const role = await getUserRole(user.email);

                    // Navigate based on the role
                    if (role === 'user') navigate('/user-home');
                    else if (role === 'admin') navigate('/admin-home');
                    else if (role === 'master') navigate('/master-home');
                }
            });

            // const role = await getUserRole(auth.currentUser.email);
            // console.log("ROLE: " + role);
            // if (role === 'user') navigate('/user-home');
            // else if (role === 'admin') navigate('/admin-home');
            // else if (role === 'master') navigate('/master-home');

            // // console.log("JUST BEFORE LOGIN");
            // // console.log(formData);
            // // const response = await axios.post(`${API_URL}/api/auth/login`, formData, { withCredentials: true });
            // // setMessage(response.data.message);
            // // console.log(response.data);
            // // if (response.data.role === "admin") {
            // //     navigate('/admin-home')
            // // } else {
            // //     navigate('/home')
            // // }
        } catch (error) {
            console.error("Error during login: ", error)
            setMessageColor('red');
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
                    {message && <p style={{ color: messageColor }}>{message}</p>}
                    <button className='login-button' type='submit'>Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;

