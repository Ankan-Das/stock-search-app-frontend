import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export async function LogoutUser(navigate) {
    try {
        await signOut(auth);
        navigate("/");
    } catch (error) {
        console.error("Error logging out user: ", error);
    }
}