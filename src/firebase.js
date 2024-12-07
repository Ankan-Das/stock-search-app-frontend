import { initializeApp } from "firebase/app";
import { getFirestore, increment, runTransaction } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence, getUser, deleteUser } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, arrayUnion, deleteDoc, arrayRemove } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyCwOwoZyxhX6zS-kYOHJSonfLwDnac90Rc",
    authDomain: "mystocksfirebaseapp.firebaseapp.com",
    projectId: "mystocksfirebaseapp",
    storageBucket: "mystocksfirebaseapp.firebasestorage.app",
    messagingSenderId: "188669253077",
    appId: "1:188669253077:web:dd772c5bd5a9ae85e6595c",
    measurementId: "G-HCWCGN6C64"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// // Set persistence to local to maintain auth state across page reloads
// setPersistence(auth, browserLocalPersistence).catch((error) => {
//         console.error("Error setting persistence: ", error);
//     });

// Utility function to generate user_id
export async function generateUserId() {
    const counterRef = doc(db, "metadata", "user_counter");
    try {
        const newId = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            if (!counterDoc.exists()) {
                transaction.set(counterRef, { last_id: 1 });
                return 1;
            }
            const newId = counterDoc.data().last_id + 1;
            return newId;
        });
        return `user-${newId.toString().padStart(5, "0")}`;
    } catch (e) {
        console.error("Transaction failed: ", e);
        throw e;
    }
}

// Increment user_id in metadata
export async function incrementUserId() {
    const counterRef = doc(db, "metadata", "user_counter");
    try {
        const newId = await runTransaction(db, async (transaction) => {
            transaction.update(counterRef, { last_id: increment(1) });
        });
    } catch (e) {
        console.error("Transaction Failed: ", e);
        throw e;
    }
}

// Add generated User in the relationship table
export async function addChild(user_id, child_id) {
    console.log('inside addChild: ', user_id, child_id);
    try {
        const relationshipsRef = doc(db, "relationships", user_id);
        const docSnapshot = await getDoc(relationshipsRef);

        if (docSnapshot.exists()) {
            // Document exists, update the child list
            await updateDoc(relationshipsRef, {
                children: arrayUnion(child_id)
            });
        } else {
            // Document does not exist, create it with the new child
            await setDoc(relationshipsRef, {
                children: [child_id]
            });
        }
        console.log(`Successfully updated relationships for user_id: ${user_id}`)
    } catch (error) {
        console.error("Error updating relationships: ", error);
        throw error;
    }
}


export async function deleteChildFromSystem(userId, userRole, childId) {
    try {
        // Delete the child from the users collection
        await deleteDoc(doc(db, 'users', childId));

        // If the current user is an admin, delete all children of the master ID
        if (userRole === "admin") {
            const relationshipsDoc = await getDoc(doc(db, 'relationships', childId));
            if (relationshipsDoc.exists()) {
                const children = relationshipsDoc.data().children || [];
                for (const subChild of children) {
                    // Recursive call to delete each child
                    await deleteChildFromSystem(childId, "master", subChild);
                }
                // Remove the master ID from relationships
                await deleteDoc(doc(db, 'relationships', childId));
            }
        }
        

        // Remove the child from the relationships collection
        const relationshipsRef = doc(db, 'relationships', userId);
        await updateDoc(relationshipsRef, {
            children: arrayRemove(childId),
        });

        // Delete the user from Firebase Authentication
        const authUserDoc = await getDoc(doc(db, 'auth_users', childId));
        if (authUserDoc.exists()) {
            const authUser = authUserDoc.data();
            console.warn('Firebase client SDK cannot directly fetch auth user details. Skipping auth deletion step for:', authUser.uid);
        }

        console.log(`Child ${childId} successfully deleted from system.`);
    } catch (error) {
        console.error("Error deleting child: ", error);
        throw error;
    }
}

window.generateUserId = generateUserId;
window.currentUser = auth.currentUser;