import React, { useEffect, useState } from 'react';
import { auth, db, deleteChildFromSystem } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { LogoutUser } from './Logout';
import { onAuthStateChanged } from 'firebase/auth';

import './Home.css';

function MasterHome() {
    const [userInfo, setUserInfo] = useState({ userId: '', role: '' });
    const [children, setChildren] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const user_id = user.email.replace("@stocksapp.com", "");
                const userDoc = await getDoc(doc(db, 'users', user_id));
                if (userDoc.exists()) {
                    setUserInfo({ userId: userDoc.data().user_id, role: userDoc.data().role });

                    // Fetch children from relationships collection
                    const relationshipsDoc = await getDoc(doc(db, 'relationships', userDoc.data().user_id));
                    if (relationshipsDoc.exists()) {
                        setChildren(relationshipsDoc.data().children || []);
                    }
                }
            } else {
                navigate("/");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleDeleteChild = async (childId) => {
        try {
            await deleteChildFromSystem(userInfo.userId, userInfo.role, childId);
            setChildren((prevChildren) => prevChildren.filter((id) => id !== childId));
        } catch (error) {
            console.error("Error deleting child: ", error);
        }
    };

    return (
      <div className="home-container">
            <h2>Master Home</h2>
            <p>User ID: {userInfo.userId}</p>
            <p>Role: <b>{userInfo.role}</b></p>
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
                onClick={() => {LogoutUser(navigate)}}
            >
                Logout
            </button>

            <h3>User Ids Created: </h3>
            <div className="children-container" style={{ maxHeight: '200px', overflowY: 'scroll', marginTop: '20px' }}>
                {children.map((childId, index) => (
                    <div key={childId}>
                        <button
                            key={index}
                            className="child-button"
                            onClick={() => navigate('/user-portfolio', { state: { childId: childId, userRole: userInfo.role } })}
                            // style={{ display: 'block', margin: '5px' }}
                        >
                            {childId}
                        </button>
                        <button
                            className="delete-button"
                            onClick={() => handleDeleteChild(childId)}
                            // style={{ width: '20%', height: '25px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px' }}
                        >
                            X
                        </button>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default MasterHome;