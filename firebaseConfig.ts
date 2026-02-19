import { initializeApp } from "firebase/app";
import { 
  getFirestore, doc, getDoc, setDoc, updateDoc, 
  collection, query, where, getDocs, serverTimestamp, 
  onSnapshot, addDoc 
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut 
} from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // تأكد من وضع الـ API Key الخاص بك هنا
  authDomain: "code-quest-a3f47.firebaseapp.com",
  projectId: "code-quest-a3f47",
  storageBucket: "code-quest-a3f47.appspot.com",
  messagingSenderId: "782025175628",
  appId: "1:782025175628:web:7f6d8921e512b918730da4",
  databaseURL: "https://code-quest-a3f47-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const database = getDatabase(app);

const LOCAL_COINS_KEY = 'code_quest_local_coins';

/**
 * دالة لتوليد كود عشوائي فريد من 6 أرقام
 */
const generateUniqueUserCode = async (): Promise<string> => {
  let isUnique = false;
  let code = "";
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const q = query(collection(db, "users"), where("userCode", "==", code));
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
export const searchUserByCode = async (code: string) => {
  try {
    const q = query(collection(db, "users"), where("userCode", "==", code));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return { name: userData.name, userCode: code };
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * دالة لجلب رصيد المستخدم وبياناته بناءً على اسم المستخدم
 */
export const getOrCreateUser = async (name: string) => {
  if (!name) return { coins: 5000, userCode: "" };

  const localKey = `${LOCAL_COINS_KEY}_${name.trim()}`;
  const localValue = localStorage.getItem(localKey);
  const localCoins = localValue ? parseInt(localValue) : 5000;

  try {
    const userRef = doc(db, "users", name.trim());
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const cloudCoins = data.coins ?? localCoins;
      const userCode = data.userCode ?? "000000";
      localStorage.setItem(localKey, cloudCoins.toString());
      return { coins: cloudCoins, userCode: userCode };
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
    console.warn("Firestore error, using local:", e);
    return { coins: localCoins, userCode: "000000" };
  }
};

export const syncCoinsToFirestore = async (name: string, amount: number) => {
  if (!name) return;
  localStorage.setItem(`${LOCAL_COINS_KEY}_${name.trim()}`, amount.toString());
  try {
    const userRef = doc(db, "users", name.trim());
    await setDoc(userRef, {
      coins: amount,
      lastActive: serverTimestamp()
    }, { merge: true });
  } catch (e: any) {}
};

export const subscribeToUserCoins = (name: string, callback: (coins: number) => void) => {
  if (!name) return () => {};
  const userRef = doc(db, "users", name.trim());
  return onSnapshot(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const cloudCoins = snapshot.data().coins;
      localStorage.setItem(`${LOCAL_COINS_KEY}_${name.trim()}`, cloudCoins.toString());
      callback(cloudCoins);
    }
  }, (error) => {});
};

export const saveScoreToFirestore = async (name: string, score: number, language: string = 'javascript') => {
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

// تصدير دوال المصادقة بناءً على الصورة الأخيرة
export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  onAuthStateChanged, 
  signOut 
};
