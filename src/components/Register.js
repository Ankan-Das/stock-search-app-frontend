import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './Register.css';

import { db, auth, generateUserId, incrementUserId, addChild } from "../firebase";
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

const API_URL = process.env.REACT_APP_API_BASE_URL;

const Register = () => {
    const [userInfo, setUserInfo] = useState({ userId: '', role: '' });
    const [childRole, setChildRole] = useState('');
    const [formData, setFormData] = useState({ password: '', confirmPassword: '', role: 'user' });
    const [message, setMessage] = useState('');
    const [messageColor, setMessageColor] = useState('');
    const [generatedUserId, setGeneratedUserId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const user_id = user.email.replace("@stocksapp.com", "");
                const userDoc = await getDoc(doc(db, 'users', user_id));
                if (userDoc.exists()) {
                    setUserInfo({ userId: userDoc.data().user_id, role: userDoc.data().role });
                }
            } else {
                navigate("/");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    // New useEffect to react to `userInfo` updates
    useEffect(() => {
        if (userInfo.role) {
            console.log("User Role updated: ", userInfo.role);
            if (userInfo.role === "admin") {
                setChildRole("master");
            } else {
                setChildRole("user");
            }
        }
    }, [userInfo]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userId = await generateUserId();
            const email = `${userId}@stocksapp.com`;
            
            // Just register the user using backend API
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: formData.password,
                    role: childRole
                }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log("output from API: ", data);
                setGeneratedUserId(data.userId);
                await incrementUserId(); // Increment the user_id in metadata
                setIsModalOpen(true);

                // Add it to the list in relationships
                await addChild(userInfo.userId, data.userId)

            } else {
                setMessageColor('red');
                setMessage(data.error);
            }
        } catch (error) {
            setMessageColor('red');
            setMessage('An error occurred.');
            setMessage('Error createring user: ', error);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            <p>Current User Role: <b>{userInfo.role}</b></p>
            <form onSubmit={handleSubmit}>
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
                    <button type="submit">Generate User Id</button>
                {message && <p style={{ color: messageColor }}>{message}</p>}
                <button type="button" className="login-button" onClick={() => userInfo.role === "admin" ? navigate('/admin-home') : navigate('/master-home')}>Go to Home Page</button>
            </form>

            {/* Modal for displaying the User ID */}
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close-button" onClick={closeModal}>&times;</span>
                        <p><strong>Generated User ID: { generatedUserId || "Loading..." }</strong></p>
                    </div>
                </div>
            )}
        </div>
    );
};


export default Register;
