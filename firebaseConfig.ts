
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// استبدل هذه البيانات ببيانات مشروعك من Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * دالة لحفظ سكور اللاعب في Firestore
 */
export const saveScoreToFirestore = async (name: string, score: number, language: string) => {
  if (!name || score <= 0) return;
  
  try {
    await addDoc(collection(db, "leaderboard"), {
      name: name,
      score: score,
      language: language,
      timestamp: serverTimestamp(),
      platform: "android"
    });
    console.log("Score saved to Firestore successfully!");
  } catch (e) {
    console.error("Error adding document to Firestore: ", e);
  }
};
