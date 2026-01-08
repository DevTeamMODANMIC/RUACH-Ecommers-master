import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "./firebase";

// Initialize the delivery authorized emails collection with default email
export const initializeDeliveryEmails = async () => {
  try {
    // Check if the collection already has documents
    const querySnapshot = await getDocs(collection(db, "deliveryAuthorizedEmails"));
    
    // If no documents exist, add the default email
    if (querySnapshot.empty) {
      const defaultEmail = "patrickonukwugha@gmail.com";
      await addDoc(collection(db, "deliveryAuthorizedEmails"), { 
        email: defaultEmail,
        createdAt: new Date()
      });
      console.log("Default delivery email added to authorized list");
    }
  } catch (error) {
    console.error("Error initializing delivery emails:", error);
  }
};

// Get all authorized emails
export const getAuthorizedDeliveryEmails = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "deliveryAuthorizedEmails"));
    return querySnapshot.docs.map(doc => doc.data().email);
  } catch (error) {
    console.error("Error fetching authorized emails:", error);
    return [];
  }
};

export default {
  initializeDeliveryEmails,
  getAuthorizedDeliveryEmails
};