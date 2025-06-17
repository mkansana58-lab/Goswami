// firebase.ts

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Firebase configuration – तुम्हारे project की details
const firebaseConfig = {
  apiKey: "AIzaSyCVyBoofvGBEpI-HM5Z7iIXVwstOTKnHzQ",
    authDomain: "studio-6ppyt.firebaseapp.com",
      databaseURL: "https://studio-6ppyt-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "studio-6ppyt",
          storageBucket: "studio-6ppyt.appspot.com",
            messagingSenderId: "783387760146",
              appId: "1:783387760146:web:ef987dfc8af6a19354eacb",
                measurementId: "G-HL4DFRFFHV"
                };

                // Firebase app initialization
                const app = initializeApp(firebaseConfig);
                export const db = getFirestore(app);

                // Firestore से Live Classes लाने वाला function
                export async function getLiveClasses() {
                  try {
                      const querySnapshot = await getDocs(collection(db, "Live classes"));
                          return querySnapshot.docs.map((doc) => ({
                                id: doc.id,
                                      ...doc.data(),
                                          }));
                                            } catch (error) {
                                                console.error("Error fetching live classes:", error);
                                                    return [];
                                                      }
                                                      }
