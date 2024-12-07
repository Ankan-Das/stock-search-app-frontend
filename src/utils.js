import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function getUserRole(email) {
    const userDocRef = doc(db, 'users', email.replace("@stocksapp.com", ""));
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        return userDoc.data().role; // Retrieve the role
    } else {
        console.error('No such user!');
    }
}

window.getUserRole = getUserRole;