import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function getUserRole(email) {
    const userId = email.replace("@stocksapp.com", "");
    const userDocRef = doc(db, 'users', userId);
    console.log("Fetching user role for:", email);
    console.log("User document reference:", userDocRef);

    try {
        const userDoc = await getDoc(userDocRef, { source: "server" });

        if (userDoc.exists()) {
            console.log("User data:", userDoc.data());
            return userDoc.data().role; // Retrieve the role
        } else {
            console.error('No such user!');
            throw new Error("User not found");
        }
    } catch (error) {
        console.error("Error fetching user role:", error);
        throw error;
    }
}
