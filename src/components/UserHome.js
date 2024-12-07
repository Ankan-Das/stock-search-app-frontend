import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LogoutUser } from './Logout';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

function UserHome() {
    const [userInfo, setUserInfo] = useState({ userId: '', role: '' });
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

    return (
        <div className="home-container">
            <h2>User Home</h2>
            <p>User ID: {userInfo.userId}</p>
            <p>Role: <b>{userInfo.role}</b></p>
            <button
                type="submit"
                className="user-portfolio-button"
                onClick={() => navigate('/user-portfolio', { state: { childId: userInfo.userId, userRole: userInfo.role } })}
            >
                Go to Portfolio
            </button>
            <button
                type="button"
                className="logout-button"
                onClick={() => {LogoutUser(navigate)}}
            >
                Logout
            </button>
        </div>
    );
}

export default UserHome;