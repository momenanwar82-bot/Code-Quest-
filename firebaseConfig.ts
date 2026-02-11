
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  query,
  where,
  getDocs,
  limit
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDENsnhvPm9jZAM3BF13sFbtVVOG_csOuE",
  authDomain: "studio-4348673780-9ee55.firebaseapp.com",
  projectId: "studio-4348673780-9ee55",
  storageBucket: "studio-4348673780-9ee55.firebasestorage.app",
  messagingSenderId: "348459204596",
  appId: "1:348459204596:web:4cdb897361bdb9288c03a1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const LOCAL_COINS_KEY = 'code_quest_local_coins_fallback';

/**
 * دالة لتوليد كود عشوائي فريد من 6 أرقام
 */
const generateUniqueUserCode = async (): Promise<string> => {
  let isUnique = false;
  let code = "";
  
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const q = query(collection(db, "users"), where("userCode", "==", code), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      isUnique = true;
    }
  }
  return code;
};

/**
 * دالة للبحث عن مستخدم بواسطة الكود الخاص به
 */
export const searchUserByCode = async (code: string): Promise<{name: string, userCode: string} | null> => {
  try {
    const q = query(collection(db, "users"), where("userCode", "==", code), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return { name: userData.name, userCode: userData.userCode };
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * دالة لجلب رصيد المستخدم وبياناته بناءً على اسم المستخدم (playerName)
 */
export const getOrCreateUser = async (name: string): Promise<{ coins: number, userCode: string }> => {
  if (!name) return { coins: 5000, userCode: "000000" };
  
  const localKey = `${LOCAL_COINS_KEY}_${name.trim().toLowerCase()}`;
  const localValue = localStorage.getItem(localKey);
  const localCoins = localValue ? parseInt(localValue) : 5000;

  try {
    const userRef = doc(db, "users", name.trim().toLowerCase());
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      const cloudCoins = data.coins ?? localCoins;
      const userCode = data.userCode ?? "000000";
      localStorage.setItem(localKey, cloudCoins.toString());
      return { coins: cloudCoins, userCode };
    } else {
      const newUserCode = await generateUniqueUserCode();
      await setDoc(userRef, {
        name: name,
        coins: localCoins,
        userCode: newUserCode,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      }, { merge: true });
      return { coins: localCoins, userCode: newUserCode };
    }
  } catch (e: any) {
    console.warn("Firestore error, using local fallback:", e.message);
    return { coins: localCoins, userCode: "000000" };
  }
};

export const syncCoinsToFirestore = async (name: string, amount: number) => {
  if (!name) return;
  localStorage.setItem(`${LOCAL_COINS_KEY}_${name.trim().toLowerCase()}`, amount.toString());
  try {
    const userRef = doc(db, "users", name.trim().toLowerCase());
    await setDoc(userRef, {
      coins: amount,
      lastActive: serverTimestamp()
    }, { merge: true });
  } catch (e: any) {}
};

export const subscribeToUserCoins = (name: string, callback: (coins: number) => void) => {
  if (!name) return () => {};
  const userRef = doc(db, "users", name.trim().toLowerCase());
  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const cloudCoins = snapshot.data().coins ?? 0;
      localStorage.setItem(`${LOCAL_COINS_KEY}_${name.trim().toLowerCase()}`, cloudCoins.toString());
      callback(cloudCoins);
    }
  }, (error) => {});
};

export const saveScoreToFirestore = async (name: string, score: number, language: string) => {
  if (!name || score <= 0) return;
  try {
    await addDoc(collection(db, "leaderboard"), {
      name: name,
      score: score,
      language: language,
      timestamp: serverTimestamp()
    });
  } catch (e: any) {}
};

export { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut };
