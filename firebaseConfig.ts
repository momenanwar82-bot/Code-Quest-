
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * إعدادات Firebase الحقيقية لمشروع Code Quest
 */
const firebaseConfig = {
  apiKey: "AIzaSyDENsnhvPm9jZAM3BF13sFbtVVOG_csOuE",
  authDomain: "studio-4348673780-9ee55.firebaseapp.com",
  projectId: "studio-4348673780-9ee55",
  storageBucket: "studio-4348673780-9ee55.firebasestorage.app",
  messagingSenderId: "348459204596",
  appId: "1:348459204596:web:4cdb897361bdb9288c03a1"
};

// تهيئة تطبيق Firebase
const app = initializeApp(firebaseConfig);
// الحصول على نسخة Firestore
export const db = getFirestore(app);

/**
 * دالة لحفظ سكور اللاعب في مجموعة "leaderboard" على Firestore
 * @param name اسم اللاعب
 * @param score النقاط المحققة
 * @param language اللغة البرمجية المستخدمة
 */
export const saveScoreToFirestore = async (name: string, score: number, language: string) => {
  // التحقق من البيانات قبل الإرسال
  if (!name || name.trim() === "" || score <= 0) {
    console.warn("Attempted to save invalid score data.");
    return;
  }
  
  try {
    // إضافة وثيقة جديدة للمجموعة مع طابع زمني من السيرفر
    await addDoc(collection(db, "leaderboard"), {
      name: name,
      score: score,
      language: language,
      timestamp: serverTimestamp(),
      platform: "android",
      gameVersion: "1.0.0"
    });
    console.log("✅ تمت مزامنة النتيجة مع Firestore بنجاح!");
  } catch (e) {
    console.error("❌ فشل في حفظ البيانات في Firestore:", e);
  }
};
