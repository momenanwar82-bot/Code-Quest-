
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Question, Difficulty, LeaderboardEntry } from './types';
import { LANGUAGES, PRIZE_LADDERS, COINS_KEY, DAILY_CHALLENGE_KEY, DAILY_BONUS_AMOUNT, LEADERBOARD_KEY, INITIAL_MOCK_LEADERBOARD } from './constants';
import { generateProgrammingQuestion } from './services/geminiService';
import { AdService } from './services/adService';
import { 
  db, 
  auth, 
  getOrCreateUser, 
  syncCoinsToFirestore, 
  subscribeToUserCoins, 
  saveScoreToFirestore,
  searchUserByCode,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut
} from './firebaseConfig';
import { 
  Terminal, Coins, ShieldCheck, CheckCircle2, 
  XCircle as XIcon, Loader2, Timer, Cpu, 
  LogOut, Sparkles, Zap, Calendar, BrainCircuit, 
  ListOrdered, User, Bot, AlertTriangle, Star, 
  Languages as LangIcon, PlayCircle, Medal, Crown,
  ChevronRight, Sword, Filter, RotateCcw, Mail, Lock, UserPlus, LogIn,
  UserCircle, ArrowLeft, Award, Code, Globe, Fingerprint, Copy, Search
} from 'lucide-react';

const QUESTION_TIME = 15; 
const ENTRY_FEE = 100;
const BATTLE_STAKE = 100;
const BATTLE_WIN_REWARD = 200;
const LOSS_PENALTY = 200;
const DAILY_LOSS_PENALTY = 20000;
const REVIVE_COST = 5000;
const SKIP_COST = 5000;
const DAILY_QUEST_REWARD = 50000;
const BATTLE_TARGET = 5; 
const PLAYER_NAME_KEY = 'code_quest_player_name';
const LAST_DAILY_COMPLETED_KEY = 'last_daily_completed_date_v1';
const UI_LANG_KEY = 'code_quest_ui_lang';

const translations = {
  ar: {
    loginTitle: "تسجيل الدخول",
    signupTitle: "إنشاء حساب جديد",
    emailPlaceholder: "البريد الإلكتروني",
    passwordPlaceholder: "كلمة المرور",
    usernamePlaceholder: "اسم المستخدم",
    saveName: "دخول",
    createAccount: "إنشاء الحساب",
    toggleSignup: "ليس لديك حساب؟ سجل الآن",
    toggleLogin: "لديك حساب بالفعل؟ سجل دخولك",
    wallet: "رصيدك في السحابة",
    subtitle: "تحدي المبرمج العبقري | المليونير",
    dailyChallenge: "التحدي اليومي",
    dailyCompleted: "تم إكمال التحدي اليومي",
    dailyReward: "+50,000 قطعة مكافأة",
    aiBattle: "مواجهة الذكاء الاصطناعي",
    stake: "الرهان",
    statusStarted: "تم الاتصال بنجاح",
    loggedInAs: "المبرمج",
    stage: "المرحلة",
    difficulty: "الصعوبة",
    master: "محترف",
    mixed: "مختلط",
    you: "أنت",
    geminiBot: "Ai",
    thinking: "يفكر...",
    gameOver: "انتهت المحاولة",
    aiWon: "انتصر الذكاء الاصطناعي!",
    score: "النتيجة",
    points: "النقاط",
    returnMenu: "العودة للقائمة",
    retry: "إعادة المحاولة",
    victory: "مبروك الفوز!",
    crushedAi: "لقد سحقت الذكاء الاصطناعي وحصلت على الضعف!",
    becameMaster: "لقد أصبحت مبرمجاً عبقرياً!",
    dailyRewardWon: "أنت حقاً محترف! تم إضافة جائزة التحدي اليومي.",
    winnings: "الأرباح",
    penalty: "خصم الخسارة",
    claimReward: "استلام الجائزة",
    insufficientBalance: "رصيدك غير كافٍ!",
    dailyLimit: "لقد أتممت تحدي اليوم بالفعل! عد غداً.",
    loadingAi: "جاري استدعاء الأسئلة من السيرفر...",
    continueWithCoins: "أكمل بـ 5000 قطعة",
    continueWithAd: "شاهد إعلان للأكمال",
    reviveUsed: "تم استخدام المحاولة سابقاً",
    leaderboardTitle: "أفضل 20 عبقري",
    leaderboardEmpty: "لا يوجد متنافسون بعد!",
    rank: "المركز",
    player: "اللاعب",
    totalWinnings: "إجمالي الأرباح",
    prizePool: "جائزة السؤال",
    skipAd: "شاهد إعلان للتخطي",
    skipPoints: "ادفع 5000 للتخطي",
    selectDifficulty: "اختر مستوى الصعوبة",
    beginner: "مبتدئ",
    intermediate: "متوسط",
    advanced: "متقدم",
    expert: "خبير",
    masterLevel: "أسطورة",
    syncing: "جاري المزامنة...",
    all: "الكل",
    filterBy: "تصفية حسب اللغة",
    logout: "تسجيل الخروج",
    profile: "الملف الشخصي",
    stats: "الإحصائيات",
    badges: "الأوسمة",
    joinedDate: "تاريخ الانضمام",
    rankGlobal: "الترتيب العالمي",
    userId: "معرف المبرمج",
    copyCode: "تم نسخ الكود!",
    searchFriend: "ابحث عن مبرمج",
    enterFriendCode: "أدخل كود الصديق (6 أرقام)",
    searching: "جاري البحث...",
    userNotFound: "هذا الكود غير صحيح!",
    langDesc: {
      javascript: "لغة الويب الأكثر شهرة وقوة",
      python: "لغة الذكاء الاصطناعي وعلم البيانات",
      java: "لغة تطبيقات الأندرويد والأنظمة",
      cpp: "لغة الأنظمة والألعاب عالية الأداء",
      typescript: "النسخة المطورة والآمنة من جافا سكريبت",
      php: "لغة تطوير المواقع وقواعد البيانات"
    }
  },
  en: {
    loginTitle: "Login",
    signupTitle: "Create Account",
    emailPlaceholder: "Email Address",
    passwordPlaceholder: "Password",
    usernamePlaceholder: "Username",
    saveName: "Sign In",
    createAccount: "Create Account",
    toggleSignup: "Don't have an account? Sign Up",
    toggleLogin: "Already have an account? Login",
    wallet: "Cloud Balance",
    subtitle: "The Genius Programmer Challenge",
    dailyChallenge: "Daily Challenge",
    dailyCompleted: "Daily Challenge Completed",
    dailyReward: "+50,000 Coins Reward",
    aiBattle: "AI Battle",
    stake: "Stake",
    statusStarted: "Successfully connected",
    loggedInAs: "Coder",
    stage: "Stage",
    difficulty: "Difficulty",
    master: "Master",
    mixed: "Mixed",
    you: "You",
    geminiBot: "AI",
    thinking: "Thinking...",
    gameOver: "Game Over",
    aiWon: "AI has triumphed!",
    score: "Score",
    points: "Points",
    returnMenu: "Back to Menu",
    retry: "Retry",
    victory: "Victory!",
    crushedAi: "You crushed the AI and doubled your stake!",
    becameMaster: "You've become a Master Programmer!",
    dailyRewardWon: "A true pro! Daily challenge reward added.",
    winnings: "Winnings",
    penalty: "Loss Penalty",
    claimReward: "Claim Reward",
    insufficientBalance: "Insufficient balance!",
    dailyLimit: "Daily challenge completed! Come back tomorrow.",
    loadingAi: "Fetching questions from server...",
    continueWithCoins: "Continue for 5,000 Coins",
    continueWithAd: "Watch Ad to Continue",
    reviveUsed: "Already used this game",
    leaderboardTitle: "Top 20 Geniuses",
    leaderboardEmpty: "No competitors yet!",
    rank: "Rank",
    player: "Player",
    totalWinnings: "Total Winnings",
    prizePool: "Question Prize",
    skipAd: "Watch Ad to Skip",
    skipPoints: "Pay 5000 to Skip",
    selectDifficulty: "Select Difficulty Level",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
    masterLevel: "Legendary",
    syncing: "Syncing...",
    all: "All",
    filterBy: "Filter by Language",
    logout: "Logout",
    profile: "Profile",
    stats: "Statistics",
    badges: "Badges",
    joinedDate: "Joined Date",
    rankGlobal: "Global Rank",
    userId: "Coder ID",
    copyCode: "Code Copied!",
    searchFriend: "Search Coder",
    enterFriendCode: "Enter Friend Code (6 digits)",
    searching: "Searching...",
    userNotFound: "Invalid Code!",
    langDesc: {
      javascript: "The most popular and powerful web language",
      python: "The language of AI and Data Science",
      java: "The language for Android and system apps",
      cpp: "High-performance language for systems and games",
      typescript: "Enhanced and secure version of JavaScript",
      php: "Language for website and database development"
    }
  }
};

const MascotIcon = ({ size = "w-32 h-32", mood = "normal" }) => {
  let eyeColor = "bg-yellow-400 shadow-[0_0_15px_#facc15]";
  let mouthColor = "text-yellow-500";
  if (mood === 'angry') { eyeColor = "bg-red-500 shadow-[0_0_15px_#ef4444]"; mouthColor = "text-red-500"; }
  else if (mood === 'victory') { eyeColor = "bg-green-500 shadow-[0_0_15px_#22c55e]"; mouthColor = "text-green-500"; }
  return (
    <div className={`${size} relative mx-auto mb-4 bg-[#1e293b] rounded-[2rem] border-4 border-[#2d3748] shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-all duration-300`}>
      <div className="absolute top-2 left-0 right-0 flex justify-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
      </div>
      <div className="flex gap-4 mt-2">
        <div className={`w-3 h-3 rounded-full ${eyeColor}`}></div>
        <div className={`w-3 h-3 rounded-full ${eyeColor}`}></div>
      </div>
      <div className={`mt-2 ${mouthColor} font-black text-xl flex items-center gap-1`}>
        <span className="animate-pulse">{'>'}</span>
        <span className="w-3 h-1 bg-current mt-1"></span>
      </div>
    </div>
  );
};

const UserAvatar = ({ name, size = "w-14 h-14", textClassName = "text-xl" }: { name: string, size?: string, textClassName?: string }) => {
  const getInitials = (n: string) => {
    if (!n) return "??";
    const parts = n.split(/[_\s]/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`${size} rounded-2xl bg-[#0a0f1e] flex items-center justify-center border-2 border-blue-500/50 shadow-lg shadow-blue-500/10 overflow-hidden relative group transition-all duration-300 hover:border-blue-400 cursor-pointer`}>
      <span 
        className={`text-white font-black ${textClassName} tracking-tighter drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-transform group-hover:scale-110 duration-300`}
        style={{ WebkitTextStroke: '1px rgba(59,130,246,0.3)' }}
      >
        {getInitials(name)}
      </span>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
};

const App: React.FC = () => {
  const [uiLang, setUiLang] = useState<'ar' | 'en'>((localStorage.getItem(UI_LANG_KEY) as 'ar' | 'en') || 'ar');
  const t = translations[uiLang];
  
  const [gameMode, setGameMode] = useState<'classic' | 'battle' | 'daily' | null>(null);
  const [viewedProfile, setViewedProfile] = useState<string | null>(null);
  const [mascotMood, setMascotMood] = useState<'normal' | 'angry' | 'victory'>('normal');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [selectedLangForDifficulty, setSelectedLangForDifficulty] = useState<string | null>(null);
  const [battleProgress, setBattleProgress] = useState({ user: 0, ai: 0 });
  const [aiStatus, setAiStatus] = useState<'thinking' | 'idle' | 'answered'>('idle');
  const [isDailyCompleted, setIsDailyCompleted] = useState(localStorage.getItem(LAST_DAILY_COMPLETED_KEY) === new Date().toDateString());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState<string>('all');
  
  const [gameState, setGameState] = useState<GameState>({
    currentLanguage: null,
    currentStage: 1,
    currentQuestionIndex: 0,
    score: '0',
    timeLeft: QUESTION_TIME,
    isGameOver: false,
    isGameWon: false,
    withdrawn: false,
    revivedWithCoins: false,
    revivedWithAd: false
  });
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Authenticated State
  const [playerName, setPlayerName] = useState<string>('');
  const [playerCode, setPlayerCode] = useState<string>('000000');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  
  // Auth Form State
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState('');
  
  const [totalCoins, setTotalCoins] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  
  const timerRef = useRef<number | null>(null);
  const aiTimerRef = useRef<number | null>(null);

  // Monitor Auth State
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.displayName || "Genius Coder";
        setPlayerName(name);
        localStorage.setItem(PLAYER_NAME_KEY, name);
      } else {
        setPlayerName('');
        setPlayerCode('000000');
        localStorage.removeItem(PLAYER_NAME_KEY);
      }
      setIsAuthChecking(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    AdService.init();
    loadLeaderboard();
  }, []);

  useEffect(() => {
    if (playerName) {
      setIsSyncing(true);
      getOrCreateUser(playerName).then(data => {
        setTotalCoins(data.coins);
        setPlayerCode(data.userCode);
        setIsSyncing(false);
      });
      const unsubscribe = subscribeToUserCoins(playerName, (newCoins) => {
        setTotalCoins(newCoins);
      });
      return () => unsubscribe();
    }
  }, [playerName]);

  const loadLeaderboard = () => {
    const saved = localStorage.getItem(LEADERBOARD_KEY);
    if (saved) setLeaderboard(JSON.parse(saved));
    else {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(INITIAL_MOCK_LEADERBOARD));
      setLeaderboard(INITIAL_MOCK_LEADERBOARD);
    }
  };

  const getFilteredLeaderboard = () => {
    if (leaderboardFilter === 'all') return leaderboard;
    return leaderboard.filter(entry => 
      entry.language.toLowerCase() === leaderboardFilter.toLowerCase()
    );
  };

  const handleAuth = async () => {
    setAuthError('');
    setIsLoading(true);
    try {
      if (authMode === 'signup') {
        if (!formUsername.trim()) throw new Error(uiLang === 'ar' ? "يرجى إدخال اسم مستخدم" : "Please enter a username");
        const cred = await createUserWithEmailAndPassword(auth, formEmail, formPassword);
        await updateProfile(cred.user, { displayName: formUsername.trim() });
      } else {
        await signInWithEmailAndPassword(auth, formEmail, formPassword);
      }
    } catch (e: any) {
      setAuthError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setPlayerName('');
    setPlayerCode('000000');
    setGameMode(null);
  };

  const handleSearchFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length < 6) return;
    setIsSearching(true);
    const result = await searchUserByCode(searchQuery);
    setIsSearching(false);
    if (result) {
      setViewedProfile(result.name);
      setIsSearchOpen(false);
      setSearchQuery('');
    } else {
      setMascotMood('angry');
      alert(t.userNotFound);
      setTimeout(() => setMascotMood('normal'), 2000);
    }
  };

  const toggleLanguage = () => {
    const newLang = uiLang === 'ar' ? 'en' : 'ar';
    setUiLang(newLang);
    localStorage.setItem(UI_LANG_KEY, newLang);
  };

  const updateCoins = async (amount: number) => {
    const newTotal = Math.max(0, totalCoins + amount);
    setTotalCoins(newTotal);
    await syncCoinsToFirestore(playerName, newTotal);
  };

  const fetchQuestion = async (lang: string, qIdx: number, stage: number, difficulty?: Difficulty) => {
    setIsLoading(true);
    setCurrentQuestion(null);
    setSelectedOption(null);
    setDisabledOptions([]);
    try {
      const activeDifficulty = difficulty || gameState.difficulty || Difficulty.Intermediate;
      const question = await generateProgrammingQuestion(lang, stage, qIdx, uiLang, activeDifficulty);
      setCurrentQuestion(question);
      setGameState(prev => ({ ...prev, timeLeft: QUESTION_TIME }));
      startTimer();
      if (gameMode === 'battle') simulateAiMove();
    } catch (error) {
      setTimeout(() => fetchQuestion(lang, qIdx, stage, difficulty), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 0) {
          window.clearInterval(timerRef.current!);
          handleGameOver();
          return { ...prev, isGameOver: true };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  };

  const handleGameOver = async () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
    setMascotMood('angry');
    const penalty = gameMode === 'daily' ? DAILY_LOSS_PENALTY : LOSS_PENALTY;
    await updateCoins(-penalty);
    const earned = parseInt(gameState.score.replace(/,/g, ''));
    if (earned > 0) saveScoreToFirestore(playerName, earned, gameState.currentLanguage || 'mixed');
  };

  const simulateAiMove = () => {
    if (gameMode !== 'battle' || gameState.isGameOver || gameState.isGameWon) return;
    setAiStatus('thinking');
    if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
    aiTimerRef.current = window.setTimeout(() => {
      setAiStatus('idle');
      const isCorrect = Math.random() < 0.75;
      if (isCorrect) {
        setBattleProgress(prev => {
          const newAiScore = prev.ai + 1;
          if (newAiScore >= BATTLE_TARGET) { setGameState(g => ({ ...g, isGameOver: true })); handleGameOver(); }
          else simulateAiMove();
          return { ...prev, ai: newAiScore };
        });
      } else setTimeout(simulateAiMove, 2000);
    }, 4000);
  };

  const proceedToNextStage = async () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
    setSelectedOption(null);
    setIsLoading(true);
    if (gameMode === 'battle') {
      const newScore = battleProgress.user + 1;
      setBattleProgress(prev => ({ ...prev, user: newScore }));
      if (newScore >= BATTLE_TARGET) {
        setGameState(prev => ({ ...prev, isGameWon: true }));
        setMascotMood('victory');
        await updateCoins(BATTLE_WIN_REWARD);
      } else fetchQuestion('mixed', gameState.currentQuestionIndex + 1, 3);
    } else if (gameMode === 'daily') {
      setGameState(prev => ({ ...prev, isGameWon: true }));
      setMascotMood('victory');
      await updateCoins(DAILY_QUEST_REWARD);
      setIsDailyCompleted(true);
      localStorage.setItem(LAST_DAILY_COMPLETED_KEY, new Date().toDateString());
    } else {
      const ladder = PRIZE_LADDERS[gameState.difficulty || Difficulty.Intermediate];
      const nextIdx = gameState.currentQuestionIndex + 1;
      if (nextIdx >= 15) {
        setGameState(prev => ({ ...prev, isGameWon: true }));
        setMascotMood('victory');
        await updateCoins(parseInt(ladder[14].replace(/,/g, '')));
      } else {
        setGameState(prev => ({ ...prev, currentQuestionIndex: nextIdx, score: ladder[gameState.currentQuestionIndex] }));
        await fetchQuestion(gameState.currentLanguage!, nextIdx, Math.floor(nextIdx / 3) + 1, gameState.difficulty);
      }
    }
  };

  const handleOptionClick = (idx: number) => {
    if (selectedOption !== null || gameState.isGameOver || isLoading) return;
    setSelectedOption(idx);
    if (timerRef.current) window.clearInterval(timerRef.current);
    const isCorrect = idx === currentQuestion?.correctAnswerIndex;
    setTimeout(() => { if (isCorrect) proceedToNextStage(); else { setGameState(prev => ({ ...prev, isGameOver: true })); handleGameOver(); } }, 1000);
  };

  const handleRetry = async () => {
    setGameState(prev => ({ ...prev, isGameOver: false }));
    if (gameMode === 'classic') await startNewGame(gameState.currentLanguage!, gameState.difficulty!);
    else if (gameMode === 'battle') await startAIBattle();
    else if (gameMode === 'daily') await startDailyQuest(Difficulty.Master);
  };

  const handleLanguageClick = (langId: string) => {
    setSelectedLangForDifficulty(langId);
  };

  const startDailyQuest = async (difficulty: Difficulty) => {
    if (isDailyCompleted) return alert(t.dailyLimit);
    setGameMode('daily');
    setMascotMood('normal');
    setGameState({ currentLanguage: 'Daily Master Challenge', currentStage: 1, currentQuestionIndex: 0, score: '0', isGameOver: false, isGameWon: false, withdrawn: false, timeLeft: QUESTION_TIME, revivedWithCoins: false, revivedWithAd: false, difficulty });
    await fetchQuestion('random', 0, 5, difficulty);
  };

  const startAIBattle = async () => {
    if (totalCoins < BATTLE_STAKE) return alert(t.insufficientBalance);
    await updateCoins(-BATTLE_STAKE);
    setGameMode('battle');
    setMascotMood('normal');
    setBattleProgress({ user: 0, ai: 0 });
    setGameState({ currentLanguage: t.mixed, currentStage: 1, currentQuestionIndex: 0, score: '0', isGameOver: false, isGameWon: false, withdrawn: false, timeLeft: QUESTION_TIME, revivedWithCoins: false, revivedWithAd: false, difficulty: Difficulty.Advanced });
    await fetchQuestion('javascript', 0, 1, Difficulty.Advanced);
  };

  const startNewGame = async (lang: string, difficulty: Difficulty) => {
    if (totalCoins < ENTRY_FEE) return alert(t.insufficientBalance);
    await updateCoins(-ENTRY_FEE);
    setSelectedLangForDifficulty(null);
    setGameMode('classic');
    setMascotMood('normal');
    setGameState({ currentLanguage: lang, currentStage: 1, currentQuestionIndex: 0, score: '0', isGameOver: false, isGameWon: false, withdrawn: false, timeLeft: QUESTION_TIME, revivedWithCoins: false, revivedWithAd: false, difficulty });
    await fetchQuestion(lang, 0, 1, difficulty);
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Auth Screen
  if (!playerName) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-['Tajawal'] text-white" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-[#0a0f1e] border border-[#1e293b] rounded-[3rem] p-8 text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-500">
          <button 
            onClick={toggleLanguage} 
            className="absolute top-8 left-8 p-3 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <LangIcon className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold uppercase">{uiLang === 'ar' ? 'EN' : 'AR'}</span>
          </button>
          
          <MascotIcon size="w-32 h-32" />
          <h1 className="text-2xl font-black mb-6">{authMode === 'login' ? t.loginTitle : t.signupTitle}</h1>
          
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAuth(); }}>
            {authMode === 'signup' && (
              <div className="relative">
                <User className={`absolute ${uiLang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500`} />
                <input 
                  type="text" 
                  autoComplete="username"
                  placeholder={t.usernamePlaceholder} 
                  value={formUsername} 
                  onChange={(e) => setFormUsername(e.target.value)} 
                  className={`w-full bg-[#0f172a] border border-[#1e293b] rounded-2xl ${uiLang === 'ar' ? 'pr-12' : 'pl-12'} py-4 text-center focus:border-blue-500 outline-none`} 
                />
              </div>
            )}
            <div className="relative">
              <Mail className={`absolute ${uiLang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500`} />
              <input 
                type="email" 
                autoComplete="email"
                placeholder={t.emailPlaceholder} 
                value={formEmail} 
                onChange={(e) => setFormEmail(e.target.value)} 
                className={`w-full bg-[#0f172a] border border-[#1e293b] rounded-2xl ${uiLang === 'ar' ? 'pr-12' : 'pl-12'} py-4 text-center focus:border-blue-500 outline-none`} 
              />
            </div>
            <div className="relative">
              <Lock className={`absolute ${uiLang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500`} />
              <input 
                type="password" 
                autoComplete="current-password"
                placeholder={t.passwordPlaceholder} 
                value={formPassword} 
                onChange={(e) => setFormPassword(e.target.value)} 
                className={`w-full bg-[#0f172a] border border-[#1e293b] rounded-2xl ${uiLang === 'ar' ? 'pr-12' : 'pl-12'} py-4 text-center focus:border-blue-500 outline-none`} 
              />
            </div>
            {authError && <p className="text-red-500 text-[10px] font-bold mt-2">{authError}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 py-5 rounded-[2rem] text-xl font-black transition-all hover:bg-blue-500 flex items-center justify-center gap-2 mt-4 active:scale-95">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (authMode === 'login' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />)}
              {authMode === 'login' ? t.saveName : t.createAccount}
            </button>
            <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }} className="text-sm text-blue-400 font-bold hover:underline block w-full mt-2">
              {authMode === 'login' ? t.toggleSignup : t.toggleLogin}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Profile View Component (Internal)
  const ProfilePage = ({ name }: { name: string }) => {
    const isMe = name === playerName;
    const userStats = leaderboard.find(e => e.name === name) || { score: 0, scoreFormatted: '0', language: 'N/A' };
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(playerCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    
    return (
      <div className="min-h-screen bg-[#020617] text-white p-6 animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar">
        <header className="flex items-center justify-between mb-10 max-w-2xl mx-auto">
          <button onClick={() => setViewedProfile(null)} className="p-4 bg-[#0a0f1e] rounded-2xl border border-[#1e293b] active:scale-95"><ArrowLeft className="w-6 h-6" /></button>
          <h2 className="text-2xl font-black italic">{t.profile}</h2>
          <div className="w-14"></div>
        </header>

        <div className="max-w-2xl mx-auto space-y-8">
           <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-[3rem] p-10 text-center relative overflow-hidden group shadow-2xl shadow-blue-500/5">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              <div className="mb-6 relative inline-block">
                <UserAvatar name={name} size="w-32 h-32" textClassName="text-5xl" />
                <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2 border-4 border-[#0a0f1e]">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-black mb-2 tracking-tight">{name}</h1>
              <p className="text-blue-400 font-bold uppercase text-[10px] tracking-[0.3em]">{userStats.language} SPECIALIST</p>
              
              {isMe && (
                <div className="mt-6 inline-flex items-center gap-2 bg-[#0f172a] border border-white/5 px-4 py-2 rounded-2xl">
                   <Fingerprint className="w-4 h-4 text-blue-500" />
                   <span className="text-slate-400 font-bold text-xs">{t.userId}:</span>
                   <span className="text-white font-black font-mono tracking-widest">{playerCode}</span>
                   <button onClick={handleCopy} className="ml-2 hover:text-blue-400 transition-colors relative">
                      {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copied && <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">{t.copyCode}</span>}
                   </button>
                </div>
              )}
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a0f1e] border border-[#1e293b] p-6 rounded-[2rem] flex flex-col items-center gap-2 shadow-lg">
                 <Coins className="w-8 h-8 text-yellow-500" />
                 <span className="text-[10px] text-slate-500 font-black uppercase">{t.winnings}</span>
                 <span className="text-xl font-mono font-black text-yellow-500">{isMe ? totalCoins.toLocaleString() : userStats.scoreFormatted}</span>
              </div>
              <div className="bg-[#0a0f1e] border border-[#1e293b] p-6 rounded-[2rem] flex flex-col items-center gap-2 shadow-lg">
                 <Medal className="w-8 h-8 text-blue-500" />
                 <span className="text-[10px] text-slate-500 font-black uppercase">{t.rankGlobal}</span>
                 <span className="text-xl font-mono font-black text-blue-400">#{leaderboard.findIndex(e => e.name === name) + 1 || '??'}</span>
              </div>
           </div>

           <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-xl font-black flex items-center gap-3"><Award className="w-6 h-6 text-yellow-500" /> {t.badges}</h3>
              <div className="flex flex-wrap gap-4">
                 {[
                   { icon: <Zap className="w-5 h-5" />, color: 'bg-yellow-500/10 text-yellow-500', label: 'Fast Learner' },
                   { icon: <Code className="w-5 h-5" />, color: 'bg-blue-500/10 text-blue-500', label: 'Syntax Pro' },
                   { icon: <Globe className="w-5 h-5" />, color: 'bg-purple-500/10 text-purple-500', label: 'Cloud Coder' },
                 ].map((badge, i) => (
                   <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs ${badge.color} border border-white/5`}>
                      {badge.icon}
                      {badge.label}
                   </div>
                 ))}
              </div>
           </div>

           {isMe && (
              <button onClick={handleLogout} className="w-full bg-red-500/10 border border-red-500/20 py-6 rounded-[2.5rem] text-red-500 font-black text-xl flex items-center justify-center gap-3 hover:bg-red-500/20 active:scale-95 transition-all">
                 <LogOut className="w-6 h-6" />
                 {t.logout}
              </button>
           )}
        </div>
      </div>
    );
  };

  // Dashboard
  if (!gameMode && !viewedProfile) {
    return (
      <div className="min-h-screen bg-[#020617] text-white font-['Tajawal'] pb-32 overflow-x-hidden" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
        <header className="px-6 pt-10 flex flex-col gap-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setViewedProfile(playerName)}>
              <UserAvatar name={playerName} />
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">{t.loggedInAs}</span>
                <span className="text-xl font-black text-white group-hover:text-blue-400 transition-colors leading-none">{playerName}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} className={`p-4 rounded-2xl border active:scale-95 transition-all shadow-lg ${isSearchOpen ? 'bg-blue-500 border-blue-400 text-white' : 'bg-[#0a0f1e] border-[#1e293b] text-blue-500 hover:border-blue-500/50'}`}>
                <Search className="w-6 h-6" />
              </button>
              <button onClick={() => { loadLeaderboard(); setShowLeaderboard(true); }} className="p-4 bg-[#0a0f1e] rounded-2xl border border-[#1e293b] text-yellow-500 active:scale-95 transition-all shadow-lg hover:border-yellow-500/50">
                <ListOrdered className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* حقل البحث الانزلاقي */}
          <div className={`overflow-hidden transition-all duration-300 ${isSearchOpen ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
             <form onSubmit={handleSearchFriend} className="flex gap-2 bg-[#0a0f1e] border border-blue-500/30 p-2 rounded-2xl shadow-xl shadow-blue-500/5">
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder={t.enterFriendCode}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 bg-transparent border-none outline-none px-4 font-mono font-black tracking-widest text-blue-400 placeholder:text-slate-600 placeholder:font-sans placeholder:tracking-normal"
                />
                <button type="submit" disabled={isSearching || searchQuery.length < 6} className="bg-blue-600 p-3 rounded-xl disabled:opacity-50 active:scale-95 transition-transform">
                   {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className={`w-5 h-5 ${uiLang === 'ar' ? 'rotate-180' : ''}`} />}
                </button>
             </form>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#0a0f1e] border border-[#1e293b] px-6 py-4 rounded-3xl flex items-center justify-between flex-1 shadow-2xl shadow-yellow-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-xl">
                  <Coins className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">{t.wallet}</span>
                  <span className="text-2xl font-black text-yellow-500 font-mono leading-none">{totalCoins.toLocaleString()}</span>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-yellow-500/50 animate-pulse" />
            </div>
            <button onClick={toggleLanguage} className="p-4 h-[68px] bg-blue-500/10 rounded-3xl border border-blue-500/20 text-blue-400 active:scale-95 flex items-center gap-2 shadow-lg hover:border-blue-400">
              <LangIcon className="w-6 h-6" />
              <span className="font-black text-sm uppercase">{uiLang === 'ar' ? 'EN' : 'AR'}</span>
            </button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 mt-6 text-center">
          <MascotIcon size="w-32 h-32" mood={mascotMood} />
          <h1 className="text-4xl font-black italic mb-1 tracking-tighter">CODE QUEST</h1>
          <p className="text-slate-500 font-bold mb-8 uppercase text-xs tracking-widest opacity-80">{t.subtitle}</p>
          
          <div className="space-y-4">
            <div onClick={() => startDailyQuest(Difficulty.Master)} className={`bg-[#0a0f1e] border-2 rounded-[2.5rem] p-6 flex flex-col items-center gap-2 transition-all cursor-pointer relative overflow-hidden group ${isDailyCompleted ? 'border-green-600/30 opacity-60' : 'border-blue-600/30 hover:border-blue-500 active:scale-95 shadow-xl shadow-blue-500/5'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-20 h-20 text-blue-500" />
              </div>
              <Calendar className="w-10 h-10 text-blue-500 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-black">{isDailyCompleted ? t.dailyCompleted : t.dailyChallenge}</h2>
            </div>

            <div onClick={startAIBattle} className="bg-[#0a0f1e] border-2 border-purple-600/30 rounded-[2.5rem] p-6 flex flex-col items-center gap-2 hover:border-purple-500 active:scale-95 transition-all cursor-pointer relative overflow-hidden group shadow-xl shadow-purple-500/5">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Cpu className="w-20 h-20 text-purple-500" />
              </div>
              <BrainCircuit className="w-10 h-10 text-purple-500 group-hover:scale-110 transition-transform" />
              <h2 className="text-xl font-black">{t.aiBattle}</h2>
              <span className="text-[10px] bg-purple-900/40 text-purple-400 px-3 py-1 rounded-full font-black uppercase tracking-wider">{t.stake}: 100</span>
            </div>

            <div className="pt-4 pb-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-4 justify-center">
              <div className="h-[1px] bg-slate-800 flex-1"></div>
              <span>{uiLang === 'ar' ? 'اختر تخصصك' : 'Choose Your Spec'}</span>
              <div className="h-[1px] bg-slate-800 flex-1"></div>
            </div>

            <div className="grid gap-3">
              {LANGUAGES.map(lang => (
                <div key={lang.id} onClick={() => handleLanguageClick(lang.id)} className="bg-[#0a0f1e] border border-slate-800 rounded-[2rem] p-6 flex items-center justify-between hover:border-blue-500 hover:bg-blue-500/5 active:scale-98 transition-all cursor-pointer group">
                  <div className={`flex flex-col items-start gap-1`}>
                    <h2 className="text-lg font-black group-hover:text-blue-400 transition-colors">{lang.name}</h2>
                    <p className="text-[10px] text-slate-500 font-bold">{t.langDesc[lang.id as keyof typeof t.langDesc]}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-blue-500/50 group-hover:bg-blue-500/10">
                    <ChevronRight className={`w-6 h-6 text-slate-700 group-hover:text-blue-500 ${uiLang === 'ar' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 text-[10px] text-slate-700 font-mono flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="uppercase tracking-widest">{t.statusStarted}</span>
          </div>
        </main>

        {selectedLangForDifficulty && (
          <div className="fixed inset-0 bg-black/95 z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300 backdrop-blur-sm">
            <div className="bg-[#0a0f1e] border border-white/10 rounded-[3rem] p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button onClick={() => setSelectedLangForDifficulty(null)} className="absolute top-6 left-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><XIcon className="w-5 h-5" /></button>
              <h2 className="text-2xl font-black mb-6 italic text-blue-400">{t.selectDifficulty}</h2>
              <div className="grid gap-3">
                {[
                  { id: Difficulty.Beginner, label: t.beginner, color: 'text-green-500', bg: 'hover:bg-green-500/5' },
                  { id: Difficulty.Intermediate, label: t.intermediate, color: 'text-blue-500', bg: 'hover:bg-blue-500/5' },
                  { id: Difficulty.Advanced, label: t.advanced, color: 'text-purple-500', bg: 'hover:bg-purple-500/5' },
                  { id: Difficulty.Expert, label: t.expert, color: 'text-red-500', bg: 'hover:bg-red-500/5' },
                  { id: Difficulty.Master, label: t.masterLevel, color: 'text-yellow-500', bg: 'hover:bg-yellow-500/5' }
                ].map(diff => (
                  <button key={diff.id} onClick={() => startNewGame(selectedLangForDifficulty, diff.id)} className={`flex items-center justify-between p-5 bg-[#0f172a] border border-white/5 rounded-3xl active:scale-95 transition-all ${diff.bg} group`}>
                    <span className={`text-lg font-black ${diff.color}`}>{diff.label}</span>
                    <ChevronRight className={`w-5 h-5 text-slate-600 group-hover:text-white ${uiLang === 'ar' ? 'rotate-180' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* لوحة الصدارة المحسنة */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-black/98 z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
             <div className="bg-[#0a0f1e] border border-white/10 rounded-[3rem] p-8 w-full max-w-lg h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-2xl font-black flex items-center gap-3">
                     <Medal className="w-8 h-8 text-yellow-500" />
                     {t.leaderboardTitle}
                   </h2>
                   <button onClick={() => setShowLeaderboard(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10"><XIcon className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                   {getFilteredLeaderboard().map((entry, idx) => (
                     <div 
                       key={idx} 
                       className="bg-[#0f172a] border border-white/5 p-4 rounded-3xl flex items-center justify-between hover:border-blue-500/30 transition-all cursor-pointer active:scale-[0.98]"
                       onClick={() => { setShowLeaderboard(false); setViewedProfile(entry.name); }}
                     >
                       <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-slate-300 text-black' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-white/5 text-slate-500'}`}>
                           {idx + 1}
                         </div>
                         <div className="flex flex-col">
                           <span className="font-black text-white">{entry.name}</span>
                           <span className="text-[10px] text-slate-500 font-bold uppercase">{entry.language}</span>
                         </div>
                       </div>
                       <div className="text-right">
                         <span className="text-yellow-500 font-mono font-black">{entry.scoreFormatted}</span>
                       </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  // Profile View Screen
  if (viewedProfile) {
    return <ProfilePage name={viewedProfile} />;
  }

  // Game UI
  return (
    <div className={`min-h-screen bg-[#020617] text-white font-['Tajawal'] p-6 overflow-x-hidden`} dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
       <div className="max-w-2xl mx-auto space-y-4">
          <header className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-blue-600/20">{gameState.currentQuestionIndex + 1}</div>
               <div className={uiLang === 'ar' ? 'text-right' : 'text-left'}>
                  <h3 className="font-black text-md leading-none uppercase tracking-tight">{gameMode === 'battle' ? (uiLang === 'ar' ? 'مواجهة Ai' : 'AI BATTLE') : gameMode === 'daily' ? (uiLang === 'ar' ? 'تحدي' : 'MASTER') : gameState.currentLanguage}</h3>
                  <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">{t.stage} {gameState.currentStage}</span>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="bg-[#0a0f1e] border-2 border-white/5 px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
                  <Timer className={`w-5 h-5 ${gameState.timeLeft < 7 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
                  <span className="text-2xl font-mono font-black">{gameState.timeLeft}</span>
               </div>
            </div>
          </header>

          <div className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-2xl min-h-[360px] flex flex-col justify-center relative overflow-hidden transition-all duration-300">
            {isLoading ? (
              <div className="flex flex-col items-center gap-5">
                <Loader2 className="w-14 h-14 text-blue-500 animate-spin" />
                <p className="text-slate-500 font-mono italic text-md">{t.loadingAi}</p>
              </div>
            ) : currentQuestion ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                <h2 className={`text-xl md:text-2xl font-black leading-tight ${uiLang === 'ar' ? 'text-right' : 'text-left'}`}>{currentQuestion.text}</h2>
                {currentQuestion.codeSnippet && (
                  <div className="bg-black/40 rounded-[1.2rem] p-6 border border-white/5 font-mono text-xs text-blue-400 overflow-x-auto shadow-inner" dir="ltr">
                    <pre><code>{currentQuestion.codeSnippet}</code></pre>
                  </div>
                )}
                <div className="grid gap-3">
                  {currentQuestion.options.map((opt, idx) => { 
                    const isSelected = selectedOption === idx; 
                    const isCorrect = idx === currentQuestion.correctAnswerIndex; 
                    let btnClass = `w-full ${uiLang === 'ar' ? 'text-right' : 'text-left'} p-5 rounded-3xl border-2 transition-all font-bold flex items-center justify-between text-md ${uiLang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`; 
                    if (selectedOption === null) btnClass += " bg-[#0f172a] border-white/5 hover:border-blue-500 active:scale-95";
                    else if (isSelected && isCorrect) btnClass += " bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]"; 
                    else if (isSelected && !isCorrect) btnClass += " bg-red-500/20 border-red-500 text-red-400"; 
                    else if (isCorrect) btnClass += " bg-green-500/10 border-green-500/40 text-green-400"; 
                    else btnClass += " bg-slate-800/20 border-transparent text-slate-600 opacity-40"; 
                    return (
                      <button key={idx} disabled={selectedOption !== null} onClick={() => handleOptionClick(idx)} className={btnClass}>
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs border border-white/10">{String.fromCharCode(65 + idx)}</div>
                        <span className="flex-1 px-4">{opt}</span>
                        {selectedOption !== null && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                        {selectedOption !== null && isSelected && !isCorrect && <XIcon className="w-6 h-6 text-red-500" />}
                      </button>
                    ); 
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
             <button onClick={() => { handleGameOver(); setGameMode(null); }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-500 flex items-center justify-center active:scale-95 transition-all shadow-lg hover:bg-red-500/20"><LogOut className="w-6 h-6" /></button>
          </div>
       </div>

       {gameState.isGameOver && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[600] flex justify-center p-4 py-10 overflow-y-auto animate-in fade-in duration-500" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
             <div className="bg-[#0a0f1e] border border-white/10 rounded-[3rem] p-8 text-center max-w-md w-full h-fit my-auto shadow-2xl relative animate-in zoom-in-95 duration-300">
                <MascotIcon mood="angry" size="w-32 h-32" />
                <h2 className="text-3xl font-black mb-4">{t.gameOver}</h2>
                <div className="bg-red-500/10 p-4 rounded-2xl mb-6 flex justify-between items-center border border-red-500/20">
                  <div className="flex items-center gap-2 text-red-400"><AlertTriangle className="w-4 h-4" /><span className="font-black text-[10px] uppercase tracking-widest">{t.penalty}</span></div>
                  <span className="text-xl font-mono font-black text-red-500">-{gameMode === 'daily' ? DAILY_LOSS_PENALTY : LOSS_PENALTY}</span>
                </div>
                <div className="grid gap-3">
                  <button onClick={handleRetry} className="w-full bg-blue-600 py-5 rounded-[2rem] font-black text-lg transition-all text-white flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-blue-900/20">
                    <RotateCcw className="w-5 h-5" />
                    {t.retry}
                  </button>
                  <button onClick={() => { setGameMode(null); setGameState(prev => ({ ...prev, isGameOver: false })); }} className="w-full bg-slate-800 py-5 rounded-[2rem] font-black text-lg text-white active:scale-95 transition-all hover:bg-slate-700">
                    {t.returnMenu}
                  </button>
                </div>
             </div>
          </div>
       )}

       {gameState.isGameWon && (
          <div className="fixed inset-0 bg-black/95 z-[600] flex justify-center p-4 py-10 overflow-y-auto animate-in fade-in duration-300" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
             <div className="bg-[#0a0f1e] border border-green-500/30 rounded-[3rem] p-8 text-center max-w-md w-full h-fit my-auto shadow-2xl animate-in zoom-in-95 duration-300">
                <MascotIcon mood="victory" size="w-32 h-32" />
                <h2 className="text-4xl font-black mb-4 text-green-500">{t.victory}</h2>
                <div className="bg-green-500/10 p-6 rounded-[2rem] mb-8 flex justify-between items-center border border-green-500/20">
                   <div className={uiLang === 'ar' ? 'text-right' : 'text-left'}>
                      <span className="text-slate-500 uppercase font-black text-[10px] tracking-widest">{t.winnings}</span>
                      <div className="text-3xl font-mono font-black text-yellow-500 mt-1">{gameState.score}</div>
                   </div>
                   <Coins className="w-8 h-8 text-yellow-500" />
                </div>
                <button onClick={() => { setGameMode(null); setGameState(prev => ({ ...prev, isGameWon: false })); }} className="w-full bg-green-600 py-6 rounded-[2.5rem] font-black text-xl active:scale-95 transition-all shadow-lg shadow-green-900/20">
                  {t.claimReward}
                </button>
             </div>
          </div>
       )}
    </div>
  );
};

export default App;
