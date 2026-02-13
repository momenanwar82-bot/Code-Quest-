
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Question, Difficulty, LeaderboardEntry } from './types';
import { LANGUAGES, PRIZE_LADDERS, COINS_KEY, DAILY_CHALLENGE_KEY, DAILY_BONUS_AMOUNT, LEADERBOARD_KEY, INITIAL_MOCK_LEADERBOARD } from './constants';
import { generateProgrammingQuestion } from './services/geminiService';
import { AdService } from './services/adService';
import { 
  db, 
  auth, 
  database,
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
import { ref, update, set, onValue, remove, off } from "firebase/database";
import { 
  Terminal, Coins, ShieldCheck, CheckCircle2, 
  XCircle as XIcon, Loader2, Timer, Cpu, 
  LogOut, Sparkles, Zap, Calendar, BrainCircuit, 
  ListOrdered, User, Bot, AlertTriangle, Star, 
  Languages as LangIcon, PlayCircle, Medal, Crown,
  ChevronRight, Sword, Filter, RotateCcw, Mail, Lock, UserPlus, LogIn,
  UserCircle, ArrowLeft, Award, Code, Globe, Fingerprint, Copy, Search,
  ArrowRight, Play, HeartPulse, UserSearch, Users, Dices, Send,
  Check, X, Hourglass, Trophy, PartyPopper
} from 'lucide-react';

const QUESTION_TIME = 15; 
const ENTRY_FEE = 100;
const BATTLE_STAKE = 100;
const BATTLE_WIN_REWARD = 200;
const LOSS_PENALTY = 200;
const DAILY_LOSS_PENALTY = 20000;
const REVIVE_COST = 5000;
const DAILY_QUEST_REWARD = 50000;
const BATTLE_TARGET = 5; 
const MAX_TURNS = 10;
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
    playWithFriend: "العب مع صديقك",
    friendChallengeTitle: "تحدي صديق",
    searchFriendToStart: "ابحث عن صديقك بالكود للبدء",
    selectFriendLanguage: "اختر لغة التحدي",
    selectStakes: "حدد مبلغ الرهان",
    minStakesNote: "الحد الأدنى 200 قطعة",
    startFriendChallenge: "بدء وإرسال دعوة",
    waitingForFriend: "في انتظار انضمام الصديق...",
    preparingMatch: "جاري تجهيز 10 أسئلة موحدة للتحدي...",
    shareCodeNote: "شارك الكود الخاص بك مع صديقك للدخول",
    comingSoon: "نظام الربط قيد التطوير!",
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
    reviveTitle: "فرصة أخيرة!",
    reviveSub: "لا تستسلم الآن! يمكنك الإكمال من حيث وقفت.",
    continueWithCoins: "أكمل بـ 5000 قطعة",
    continueWithAd: "شاهد إعلان للإكمال مجاناً",
    reviveUsed: "تم استخدام هذه المحاولة سابقاً",
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
    searchFriend: "البحث عن صديق",
    enterFriendCode: "أدخل كود الصديق",
    searching: "جاري البحث...",
    userNotFound: "الكود غير صحيح!",
    viewProfile: "عرض الملف الكامل",
    foundUser: "تم العثور على المبرمج",
    challenging: "أنت تتحدى الآن:",
    newChallenge: "تحدي جديد وارد!",
    wantsToChallenge: "يريد مبرمج تحديك في",
    accept: "قبول",
    decline: "رفض",
    battleArena: "ساحة التحدي المباشر",
    opponent: "الخصم",
    waitingTurn: "الخصم يجيب الآن...",
    yourTurn: "دورك الآن!",
    turnCount: "الضربة",
    draw: "تعادل!",
    drawSub: "لقد كنتما متساويين في القوة واستعدتما الرهان!",
    wonAgainstFriend: "لقد هزمت صديقك وسحبت الرهان!",
    lostAgainstFriend: "لقد فاز صديقك هذه المرة، حظاً أوفر!",
    payoutWinner: "مبروك! ربحت {amount} كوينز",
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
    playWithFriend: "Play with a Friend",
    friendChallengeTitle: "Friend Challenge",
    searchFriendToStart: "Search friend by code to start",
    selectFriendLanguage: "Select Challenge Language",
    selectStakes: "Select Stakes Amount",
    minStakesNote: "Minimum 200 coins",
    startFriendChallenge: "Start & Send Invite",
    waitingForFriend: "Waiting for friend to join...",
    preparingMatch: "Preparing 10 unified questions for battle...",
    shareCodeNote: "Share your code with your friend to enter",
    comingSoon: "Networking system under development!",
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
    reviveTitle: "Second Chance!",
    reviveSub: "Don't give up! Continue from where you left off.",
    continueWithCoins: "Continue for 5,000 Coins",
    continueWithAd: "Watch Ad to Continue Free",
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
    searchFriend: "Search Friend",
    enterFriendCode: "Enter Friend Code",
    searching: "Searching...",
    userNotFound: "Code is incorrect!",
    viewProfile: "View Full Profile",
    foundUser: "Coder Found",
    challenging: "You are challenging:",
    newChallenge: "New Challenge Received!",
    wantsToChallenge: "A coder wants to challenge you in",
    accept: "Accept",
    decline: "Decline",
    battleArena: "Live Battle Arena",
    opponent: "Opponent",
    waitingTurn: "Opponent is answering...",
    yourTurn: "It's your turn!",
    turnCount: "Strike",
    draw: "Draw!",
    drawSub: "You both are equally strong! Stakes returned.",
    wonAgainstFriend: "You defeated your friend and took the prize!",
    lostAgainstFriend: "Your friend won this time, better luck next!",
    payoutWinner: "Congrats! You won {amount} Coins",
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
  let eyes = (
    <div className="flex gap-4 mt-2">
      <div className={`w-3 h-3 rounded-full ${eyeColor}`}></div>
      <div className={`w-3 h-3 rounded-full ${eyeColor}`}></div>
    </div>
  );

  if (mood === 'angry') { 
    eyeColor = "bg-red-500 shadow-[0_0_15px_#ef4444]"; 
    mouthColor = "text-red-500"; 
  } else if (mood === 'victory') { 
    eyeColor = "bg-green-500 shadow-[0_0_15px_#22c55e]"; 
    mouthColor = "text-green-500"; 
  } else if (mood === 'upset') {
    eyeColor = "bg-orange-500 shadow-[0_0_15px_#f97316]";
    mouthColor = "text-orange-500";
    eyes = (
      <div className="flex gap-6 mt-4 font-black text-2xl text-orange-500 italic">
        <span>{">"}</span>
        <span>{"<"}</span>
      </div>
    );
  }

  return (
    <div className={`${size} relative mx-auto mb-4 bg-[#1e293b] rounded-[2rem] border-4 border-[#2d3748] shadow-2xl flex flex-col items-center justify-center overflow-hidden transition-all duration-300`}>
      <div className="absolute top-2 left-0 right-0 flex justify-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
      </div>
      {eyes}
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

// Profile Page Component
const ProfilePage = ({ name, playerName, leaderboard, playerCode, totalCoins, t, logout, setViewedProfile }: any) => {
  const isMe = name === playerName;
  const userStats = leaderboard.find((e: any) => e.name === name) || { score: 0, scoreFormatted: '0', language: 'N/A' };
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(playerCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 animate-in slide-in-from-right duration-500 overflow-y-auto no-scrollbar">
      <header className="flex items-center justify-between mb-10 max-w-2xl mx-auto">
        <button onClick={() => setViewedProfile(null)} className="p-4 bg-[#0a0f1e] rounded-2xl border border-[#1e293b] active:scale-95"><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="text-2xl font-black italic">{t.profile}</h2>
        <div className="w-14"></div>
      </header>
      <div className="max-w-2xl mx-auto space-y-8">
         <div className="bg-[#0a0f1e] border border-[#1e293b] rounded-[3rem] p-10 text-center relative overflow-hidden group shadow-2xl shadow-blue-500/5">
            <div className="mb-6 relative inline-block">
              <UserAvatar name={name} size="w-32 h-32" textClassName="text-5xl" />
              <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2 border-4 border-[#0a0f1e]"><ShieldCheck className="w-6 h-6 text-white" /></div>
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
               <span className="text-xl font-mono font-black text-blue-400">#{leaderboard.findIndex((e: any) => e.name === name) + 1 || '??'}</span>
            </div>
         </div>
         {isMe && (
            <button onClick={logout} className="w-full bg-red-500/10 border border-red-500/20 py-6 rounded-[2.5rem] text-red-500 font-black text-xl flex items-center justify-center gap-3 hover:bg-red-500/20 active:scale-95 transition-all"><LogOut className="w-6 h-6" /> {t.logout}</button>
         )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [uiLang, setUiLang] = useState<'ar' | 'en'>((localStorage.getItem(UI_LANG_KEY) as 'ar' | 'en') || 'ar');
  const t = translations[uiLang];
  
  const [gameMode, setGameMode] = useState<'classic' | 'battle' | 'daily' | 'friend' | null>(null);
  const [viewedProfile, setViewedProfile] = useState<string | null>(null);
  const [mascotMood, setMascotMood] = useState<'normal' | 'angry' | 'victory' | 'upset'>('normal');

  // Friend Challenge State
  const [activeChallengePath, setActiveChallengePath] = useState<string | null>(null);
  const [showFriendSetup, setShowFriendSetup] = useState(false);
  const [friendLang, setFriendLang] = useState<string>(LANGUAGES[0].id);
  const [friendStakes, setFriendStakes] = useState<number>(200);
  const [incomingChallenge, setIncomingChallenge] = useState<any>(null);
  const [multiplayerData, setMultiplayerData] = useState<any>(null);
  const [friendProgress, setFriendProgress] = useState({ me: 0, him: 0 });
  const [isMatchFinished, setIsMatchFinished] = useState(false);
  const [matchResultState, setMatchResultState] = useState<'win' | 'loss' | 'draw' | null>(null);
  const [isPreparingQuestions, setIsPreparingQuestions] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{name: string, userCode: string} | null>(null);
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
  const [showRevive, setShowRevive] = useState(false);
  
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
  
  const timerRef = useRef<number | null>(null);
  const aiTimerRef = useRef<number | null>(null);

  // Constants for turns
  const isMultiplayer = !!(gameMode === 'friend' && multiplayerData);
  const isMyTurn = isMultiplayer ? (multiplayerData.currentTurn === playerCode) : true;

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

  // Realtime Listener for receiving challenges & handling Live Turn status
  useEffect(() => {
    if (playerCode !== '000000' && playerName) {
      const myChallengeRef = ref(database, `challenges/${playerCode}`);
      const unsub = onValue(myChallengeRef, async (snapshot) => {
        const data = snapshot.val();
        
        // CASE 1: Incoming Challenge Notification
        if (data && (data.status === 'setup' || data.status === 'lobby') && data.hostCode !== playerCode) {
          setIncomingChallenge(data);
        } else {
          setIncomingChallenge(null);
        }

        // CASE 2: Multiplayer Sync
        if (data && data.status === 'active' && !isMatchFinished) {
           setMultiplayerData(data);
           setActiveChallengePath(playerCode);
           
           if (gameMode !== 'friend') {
             setGameMode('friend');
             initFriendGameState(data);
           }
           
           const myRole = data.hostCode === playerCode ? 'host' : 'opponent';
           setFriendProgress({
             me: myRole === 'host' ? (data.hostProgress || 0) : (data.opponentProgress || 0),
             him: myRole === 'host' ? (data.opponentProgress || 0) : (data.hostProgress || 0)
           });

           // Question Sync: Both read from the 'questions' array stored in RTDB
           if (data.questions && data.totalTurns <= MAX_TURNS) {
             const turnIdx = data.totalTurns - 1;
             const q = data.questions[turnIdx];
             if (q) {
               setCurrentQuestion(q);
               setIsLoading(false);
               const itsMyTurn = data.currentTurn === playerCode;
               if (itsMyTurn && selectedOption === null) {
                 startTimer();
               } else if (!itsMyTurn) {
                 if (timerRef.current) window.clearInterval(timerRef.current);
               }
             }
           }

           if (data.totalTurns > MAX_TURNS) {
             handleMultiplayerEnd(data);
           }

           // Host logic: Pre-generate questions if missing
           if (myRole === 'host' && !data.questions && !isPreparingQuestions) {
             prepareMatchQuestions(data);
           }
        }
      });
      return () => unsub();
    }
  }, [playerCode, playerName, gameMode, selectedOption, isMatchFinished, isPreparingQuestions]);

  const prepareMatchQuestions = async (data: any) => {
    setIsPreparingQuestions(true);
    setIsLoading(true);
    try {
      const qs: Question[] = [];
      // Generate 10 questions in parallel for speed
      const promises = Array.from({ length: 10 }).map((_, i) => 
        generateProgrammingQuestion(data.selectedLanguage, Math.ceil((i+1)/2), i, uiLang, Difficulty.Intermediate)
      );
      const results = await Promise.all(promises);
      await update(ref(database, `challenges/${playerCode}`), {
        questions: results
      });
    } catch (e) {
      console.error("Match preparation failed", e);
    } finally {
      setIsPreparingQuestions(false);
      setIsLoading(false);
    }
  };

  const initFriendGameState = (data: any) => {
    setIsMatchFinished(false);
    setMatchResultState(null);
    setGameState(prev => ({
      ...prev,
      currentLanguage: data.selectedLanguage,
      currentQuestionIndex: 0,
      score: '0',
      isGameOver: false,
      isGameWon: false,
      timeLeft: QUESTION_TIME,
    }));
  };

  const handleMultiplayerEnd = async (data: any) => {
    if (isMatchFinished) return;
    setIsMatchFinished(true);
    if (timerRef.current) window.clearInterval(timerRef.current);
    
    const myRole = data.hostCode === playerCode ? 'host' : 'opponent';
    const myScore = myRole === 'host' ? (data.hostProgress || 0) : (data.opponentProgress || 0);
    const opponentScore = myRole === 'host' ? (data.opponentProgress || 0) : (data.hostProgress || 0);

    if (myScore > opponentScore) {
       setMatchResultState('win');
       setMascotMood('victory');
       setGameState(prev => ({ ...prev, isGameWon: true, score: (data.betAmount * 2).toLocaleString() }));
       await updateCoins(data.betAmount * 2);
    } else if (myScore < opponentScore) {
       setMatchResultState('loss');
       setMascotMood('angry');
       setGameState(prev => ({ ...prev, isGameOver: true }));
    } else {
       setMatchResultState('draw');
       setMascotMood('normal');
       await updateCoins(data.betAmount);
    }
    
    setTimeout(() => {
      if (playerCode !== '000000') remove(ref(database, `challenges/${playerCode}`));
    }, 5000);
  };

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
    return leaderboard.filter(entry => entry.language.toLowerCase() === leaderboardFilter.toLowerCase());
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
    setSearchResult(null);
    const result = await searchUserByCode(searchQuery);
    setIsSearching(false);
    if (result) {
      setMascotMood('normal');
      setSearchResult(result);
    } else {
      setMascotMood('upset');
      setTimeout(() => setMascotMood('normal'), 3000);
      alert(t.userNotFound);
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
          triggerGameOverOrRevive();
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  };

  const triggerGameOverOrRevive = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
    
    if (gameMode === 'friend') {
      handleMultiplayerTurnResult(false);
    } else if (!gameState.revivedWithCoins && !gameState.revivedWithAd && gameMode !== 'battle') {
      setMascotMood('upset');
      setShowRevive(true);
    } else {
      handleGameOver();
    }
  };

  const handleGameOver = async () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
    setMascotMood('angry');
    setShowRevive(false);
    const penalty = gameMode === 'daily' ? DAILY_LOSS_PENALTY : LOSS_PENALTY;
    await updateCoins(-penalty);
    const earned = parseInt(gameState.score.replace(/,/g, ''));
    if (earned > 0) saveScoreToFirestore(playerName, earned, gameState.currentLanguage || 'mixed');
    setGameState(prev => ({ ...prev, isGameOver: true }));
  };

  const handleReviveWithCoins = async () => {
    if (totalCoins < REVIVE_COST) return alert(t.insufficientBalance);
    await updateCoins(-REVIVE_COST);
    setGameState(prev => ({ ...prev, revivedWithCoins: true }));
    continueGame();
  };

  const handleReviveWithAd = async () => {
    const success = await AdService.showRewardedAd();
    if (success) {
      setGameState(prev => ({ ...prev, revivedWithAd: true }));
      continueGame();
    }
  };

  const continueGame = () => {
    setShowRevive(false);
    setMascotMood('normal');
    fetchQuestion(gameState.currentLanguage!, gameState.currentQuestionIndex, Math.floor(gameState.currentQuestionIndex / 3) + 1, gameState.difficulty);
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

  const handleMultiplayerTurnResult = async (isCorrect: boolean) => {
    if (!activeChallengePath || !multiplayerData) return;
    
    const isHost = multiplayerData.hostCode === playerCode;
    const opponentCode = isHost ? multiplayerData.opponentCode : multiplayerData.hostCode;
    const currentTurnCount = multiplayerData.totalTurns;

    const updates: any = {
      currentTurn: opponentCode,
      totalTurns: currentTurnCount + 1
    };

    if (isCorrect) {
      if (isHost) updates.hostProgress = (multiplayerData.hostProgress || 0) + 1;
      else updates.opponentProgress = (multiplayerData.opponentProgress || 0) + 1;
    }

    await update(ref(database, `challenges/${activeChallengePath}`), updates);
    setSelectedOption(null);
    setCurrentQuestion(null);
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
    
    setTimeout(() => { 
      if (gameMode === 'friend') {
        handleMultiplayerTurnResult(isCorrect);
      } else {
        if (isCorrect) proceedToNextStage(); 
        else triggerGameOverOrRevive(); 
      }
    }, 1500);
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

  const handleStartFriendChallenge = async () => {
    if (totalCoins < friendStakes) return alert(t.insufficientBalance);
    await updateCoins(-friendStakes);
    
    if (searchResult) {
      const challengeRef = ref(database, `challenges/${searchResult.userCode}`);
      update(challengeRef, { 
        hostName: playerName,
        hostCode: playerCode,
        opponentName: searchResult.name,
        opponentCode: searchResult.userCode,
        selectedLanguage: friendLang,
        betAmount: friendStakes,
        status: 'lobby',
        updatedAt: Date.now()
      });
      setActiveChallengePath(searchResult.userCode);
    }

    setShowFriendSetup(false);
    setGameMode('friend');
    setMascotMood('normal');
  };

  const handleAcceptChallenge = async () => {
    if (!incomingChallenge) return;
    if (totalCoins < incomingChallenge.betAmount) return alert(t.insufficientBalance);
    
    await updateCoins(-incomingChallenge.betAmount);
    
    const challengeRef = ref(database, `challenges/${playerCode}`);
    await update(challengeRef, { 
      status: 'active', 
      hostProgress: 0, 
      opponentProgress: 0,
      totalTurns: 1,
      currentTurn: incomingChallenge.hostCode 
    });
    
    setIncomingChallenge(null);
    setGameMode('friend');
    setActiveChallengePath(playerCode);
    setMascotMood('normal');
  };

  const handleDeclineChallenge = async () => {
    if (!incomingChallenge) return;
    const challengeRef = ref(database, `challenges/${playerCode}`);
    await remove(challengeRef);
    setIncomingChallenge(null);
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

  if (!playerName) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-['Tajawal'] text-white" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-[#0a0f1e] border border-[#1e293b] rounded-[3rem] p-8 text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-500">
          <button onClick={toggleLanguage} className="absolute top-8 left-8 p-3 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"><LangIcon className="w-5 h-5 text-blue-400" /><span className="text-xs font-bold uppercase">{uiLang === 'ar' ? 'EN' : 'AR'}</span></button>
          <MascotIcon size="w-32 h-32" />
          <h1 className="text-2xl font-black mb-6">{authMode === 'login' ? t.loginTitle : t.signupTitle}</h1>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAuth(); }}>
            {authMode === 'signup' && (
              <div className="relative">
                <User className={`absolute ${uiLang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500`} />
                <input type="text" placeholder={t.usernamePlaceholder} value={formUsername} onChange={(e) => setFormUsername(e.target.value)} className={`w-full bg-[#0f172a] border border-[#1e293b] rounded-2xl ${uiLang === 'ar' ? 'pr-12' : 'pl-12'} py-4 text-center focus:border-blue-500 outline-none`} />
              </div>
            )}
            <div className="relative">
              <Mail className={`absolute ${uiLang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500`} />
              <input type="email" placeholder={t.emailPlaceholder} value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className={`w-full bg-[#0f172a] border border-[#1e293b] rounded-2xl ${uiLang === 'ar' ? 'pr-12' : 'pl-12'} py-4 text-center focus:border-blue-500 outline-none`} />
            </div>
            <div className="relative">
              <Lock className={`absolute ${uiLang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500`} />
              <input type="password" placeholder={t.passwordPlaceholder} value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className={`w-full bg-[#0f172a] border border-[#1e293b] rounded-2xl ${uiLang === 'ar' ? 'pr-12' : 'pl-12'} py-4 text-center focus:border-blue-500 outline-none`} />
            </div>
            {authError && <p className="text-red-500 text-[10px] font-bold mt-2">{authError}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 py-5 rounded-[2rem] text-xl font-black transition-all hover:bg-blue-500 flex items-center justify-center gap-2 mt-4 active:scale-95">{isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (authMode === 'login' ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />)}{authMode === 'login' ? t.saveName : t.createAccount}</button>
            <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }} className="text-sm text-blue-400 font-bold hover:underline block w-full mt-2">{authMode === 'login' ? t.toggleSignup : t.toggleLogin}</button>
          </form>
        </div>
      </div>
    );
  }

  if (viewedProfile) {
    return <ProfilePage name={viewedProfile} playerName={playerName} leaderboard={leaderboard} playerCode={playerCode} totalCoins={totalCoins} t={t} logout={handleLogout} setViewedProfile={setViewedProfile} />;
  }

  if (!gameMode) {
    return (
      <div className="min-h-screen bg-[#020617] text-white font-['Tajawal'] pb-32 overflow-x-hidden relative" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
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
                  <button key={diff.id} onClick={() => startNewGame(selectedLangForDifficulty!, diff.id)} className={`flex items-center justify-between p-5 bg-[#0f172a] border border-white/5 rounded-3xl active:scale-95 transition-all ${diff.bg} group`}>
                    <span className={`text-lg font-black ${diff.color}`}>{diff.label}</span>
                    <ChevronRight className={`w-5 h-5 text-slate-600 group-hover:text-white ${uiLang === 'ar' ? 'rotate-180' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <header className="px-6 pt-10 flex flex-col gap-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setViewedProfile(playerName)}>
              <UserAvatar name={playerName} />
              <div className="flex flex-col"><span className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">{t.loggedInAs}</span><span className="text-xl font-black text-white group-hover:text-blue-400 transition-colors leading-none">{playerName}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { loadLeaderboard(); setShowLeaderboard(true); }} className={`p-4 bg-[#0a0f1e] rounded-2xl border border-[#1e293b] text-yellow-500 active:scale-95 transition-all shadow-lg hover:border-yellow-500/50`}><ListOrdered className="w-6 h-6" /></button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#0a0f1e] border border-[#1e293b] px-6 py-4 rounded-3xl flex items-center justify-between flex-1 shadow-2xl shadow-yellow-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-xl"><Coins className="w-6 h-6 text-yellow-500" /></div>
                <div className="flex flex-col"><span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">{t.wallet}</span><span className="text-2xl font-black text-yellow-500 font-mono leading-none">{totalCoins.toLocaleString()}</span></div>
              </div>
              <Sparkles className="w-5 h-5 text-yellow-500/50 animate-pulse" />
            </div>
            <button onClick={toggleLanguage} className="p-4 h-[68px] bg-blue-500/10 rounded-3xl border border-blue-500/20 text-blue-400 active:scale-95 flex items-center gap-2 shadow-lg hover:border-blue-400"><LangIcon className="w-6 h-6" /><span className="font-black text-sm uppercase">{uiLang === 'ar' ? 'EN' : 'AR'}</span></button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 mt-6 text-center">
          <MascotIcon size="w-32 h-32" mood={mascotMood} />
          <h1 className="text-4xl font-black italic mb-1 tracking-tighter text-white">CODE QUEST</h1>
          <p className="text-slate-500 font-bold mb-8 uppercase text-xs tracking-widest opacity-80">{t.subtitle}</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div onClick={() => startDailyQuest(Difficulty.Master)} className={`bg-[#0a0f1e] border-2 rounded-[2.5rem] p-6 flex flex-col items-center gap-2 transition-all cursor-pointer relative overflow-hidden group ${isDailyCompleted ? 'border-green-600/30 opacity-60' : 'border-blue-600/30 hover:border-blue-500 active:scale-95 shadow-xl shadow-blue-500/5'}`}><Calendar className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" /><h2 className="text-lg font-black">{isDailyCompleted ? t.dailyCompleted : t.dailyChallenge}</h2></div>
              <div onClick={startAIBattle} className="bg-[#0a0f1e] border-2 border-purple-600/30 rounded-[2.5rem] p-6 flex flex-col items-center gap-2 hover:border-purple-500 active:scale-95 transition-all cursor-pointer relative overflow-hidden group shadow-xl shadow-purple-500/5"><BrainCircuit className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" /><h2 className="text-lg font-black">{t.aiBattle}</h2><span className="text-[10px] bg-purple-900/40 text-purple-400 px-3 py-1 rounded-full font-black uppercase tracking-wider">{t.stake}: 100</span></div>
            </div>
            <div onClick={() => { setShowFriendSetup(true); setSearchResult(null); setSearchQuery(''); }} className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-2 border-indigo-600/30 rounded-[2.5rem] p-8 flex flex-col items-center gap-2 hover:border-indigo-400 active:scale-95 transition-all cursor-pointer relative overflow-hidden group shadow-2xl shadow-indigo-500/10">
              <div className="p-4 bg-indigo-500/10 rounded-full border border-indigo-500/30 group-hover:scale-110 transition-transform"><Users className="w-10 h-10 text-indigo-400" /></div>
              <div className="flex flex-col items-center"><h2 className="text-2xl font-black tracking-tight text-white">{t.playWithFriend}</h2><div className="flex items-center gap-2 mt-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div><span className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em]">P2P MODE</span></div></div>
            </div>
            <div className="grid gap-3">
              {LANGUAGES.map(lang => (
                <div key={lang.id} onClick={() => handleLanguageClick(lang.id)} className="bg-[#0a0f1e] border border-slate-800 rounded-[2rem] p-6 flex items-center justify-between hover:border-blue-500 hover:bg-blue-500/5 active:scale-98 transition-all cursor-pointer group">
                  <div className={`flex flex-col items-start gap-1`}>
                    <h2 className="text-lg font-black group-hover:text-blue-400 transition-colors" dir="ltr">{lang.name}</h2>
                    <p className="text-[10px] text-slate-500 font-bold">{t.langDesc[lang.id as keyof typeof t.langDesc]}</p>
                  </div>
                  <ChevronRight className={`w-6 h-6 text-slate-700 group-hover:text-blue-500 ${uiLang === 'ar' ? 'rotate-180' : ''}`} />
                </div>
              ))}
            </div>
          </div>
        </header>
        {incomingChallenge && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[5000] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#0a0f1e] border border-indigo-500/30 rounded-[3rem] p-8 w-full max-sm shadow-[0_0_80px_rgba(99,102,241,0.2)] text-center animate-in zoom-in-95 duration-300">
               <UserAvatar name={incomingChallenge.hostName} size="w-24 h-24" textClassName="text-4xl" /><h2 className="text-2xl font-black mb-2">{t.newChallenge}</h2><p className="text-slate-400 text-sm mb-6">{t.wantsToChallenge} <span className="text-indigo-400 font-black">{incomingChallenge.selectedLanguage.toUpperCase()}</span></p>
               <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-8 flex items-center justify-between"><div className="text-right"><span className="text-[10px] text-slate-500 font-black uppercase block">{t.stake}</span><span className="text-xl font-mono font-black text-yellow-500">{incomingChallenge.betAmount}</span></div><Coins className="w-6 h-6 text-yellow-500" /></div>
               <div className="grid grid-cols-2 gap-3"><button onClick={handleAcceptChallenge} className="bg-green-600 hover:bg-green-500 py-4 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-green-900/20"><Check className="w-5 h-5" /> {t.accept}</button><button onClick={handleDeclineChallenge} className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 py-4 rounded-2xl font-black text-red-500 flex items-center justify-center gap-2 active:scale-95 transition-all"><X className="w-5 h-5" /> {t.decline}</button></div>
            </div>
          </div>
        )}
        {showFriendSetup && (
          <div className="fixed inset-0 bg-black/95 z-[1500] flex items-center justify-center p-4 animate-in fade-in duration-300 backdrop-blur-md">
             <div className="bg-[#0a0f1e] border border-indigo-500/30 rounded-[3rem] p-8 w-full max-w-lg shadow-[0_0_80px_rgba(99,102,241,0.15)] relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
                <button onClick={() => setShowFriendSetup(false)} className="absolute top-6 left-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><XIcon className="w-5 h-5" /></button>
                <h2 className="text-3xl font-black text-center mb-8">{t.friendChallengeTitle}</h2>
                <form onSubmit={handleSearchFriend} className="flex items-center gap-2 mb-6">
                   <div className="relative flex-1"><Search className={`absolute ${uiLang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500`} /><input type="text" maxLength={6} placeholder={t.enterFriendCode} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value.replace(/\D/g, ''))} className={`w-full bg-[#0f172a] border border-indigo-500/30 rounded-2xl ${uiLang === 'ar' ? 'pr-12' : 'pl-12'} py-4 font-mono font-black text-blue-400 text-lg tracking-[0.2em] outline-none`} /></div>
                   <button type="submit" disabled={isSearching || searchQuery.length < 6} className="bg-indigo-600 p-4 rounded-2xl disabled:opacity-30 active:scale-95 shadow-lg"><ArrowRight className={`w-6 h-6 ${uiLang === 'ar' ? 'rotate-180' : ''}`} /></button>
                </form>
                {searchResult && (
                  <div className="space-y-8"><div className="bg-indigo-600/5 border border-indigo-500/20 rounded-[2rem] p-6 flex flex-col items-center gap-4 text-center"><UserAvatar name={searchResult.name} size="w-20 h-20" textClassName="text-3xl" /><h3 className="text-xl font-black">{searchResult.name}</h3></div><section><h3 className="text-indigo-400 font-black text-sm uppercase mb-4">{t.selectFriendLanguage}</h3><div className="grid grid-cols-2 gap-3">{LANGUAGES.map(lang => (<button key={lang.id} onClick={() => setFriendLang(lang.id)} className={`p-4 rounded-2xl border-2 font-black transition-all ${friendLang === lang.id ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-[#0f172a] border-white/5 text-slate-500'}`}>{lang.name}</button>))}</div></section><section><h3 className="text-indigo-400 font-black text-sm uppercase mb-4">{t.selectStakes}</h3><div className="bg-[#0f172a] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between"><button onClick={() => setFriendStakes(Math.max(200, friendStakes - 100))} className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-black text-xl">-</button><span className="text-3xl font-mono font-black text-yellow-500">{friendStakes}</span><button onClick={() => setFriendStakes(friendStakes + 100)} className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-black text-xl">+</button></div></section><button onClick={handleStartFriendChallenge} className="w-full bg-indigo-600 py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 active:scale-95 shadow-lg"><Send className="w-6 h-6" /> {t.startFriendChallenge}</button></div>
                )}
             </div>
          </div>
        )}
        {gameMode === 'friend' && !multiplayerData && (
          <div className="fixed inset-0 bg-[#020617] z-[2000] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
             <header className="absolute top-10 left-0 right-0 px-8 flex justify-between items-center"><button onClick={() => setGameMode(null)} className="p-4 bg-[#0a0f1e] rounded-2xl border border-white/5"><ArrowLeft className="w-6 h-6" /></button></header>
             <Loader2 className="w-32 h-32 text-indigo-500 animate-spin mb-10" /><h2 className="text-3xl font-black mb-4">{t.waitingForFriend}</h2><p className="text-slate-500 font-bold mb-8">{t.shareCodeNote}</p><div className="bg-[#0a0f1e] border border-white/5 p-8 rounded-[3rem] space-y-4"><div className="text-5xl font-mono font-black text-indigo-400">{playerCode}</div></div>
          </div>
        )}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-black/98 z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
             <div className="bg-[#0a0f1e] border border-white/10 rounded-[3rem] p-8 w-full max-w-lg h-[80vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between mb-8"><h2 className="text-2xl font-black flex items-center gap-3"><Medal className="w-8 h-8 text-yellow-500" /> {t.leaderboardTitle}</h2><button onClick={() => setShowLeaderboard(false)} className="p-3 bg-white/5 rounded-full"><XIcon className="w-5 h-5" /></button></div>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">{getFilteredLeaderboard().map((entry, idx) => (<div key={idx} className="bg-[#0f172a] border border-white/5 p-4 rounded-3xl flex items-center justify-between" onClick={() => { setShowLeaderboard(false); setViewedProfile(entry.name); }}><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${idx === 0 ? 'bg-yellow-500 text-black' : 'bg-white/5 text-slate-500'}`}>{idx + 1}</div><div className="flex flex-col"><span className="font-black text-white">{entry.name}</span><span className="text-[10px] text-slate-500 uppercase">{entry.language}</span></div></div><span className="text-yellow-500 font-mono font-black">{entry.scoreFormatted}</span></div>))}</div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#020617] text-white font-['Tajawal'] p-6 overflow-x-hidden relative`} dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
       <div className="max-w-2xl mx-auto space-y-4">
          <header className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">{isMultiplayer ? multiplayerData.totalTurns : gameState.currentQuestionIndex + 1}</div>
               <div className={uiLang === 'ar' ? 'text-right' : 'text-left'}>
                  <h3 className="font-black text-md leading-none uppercase tracking-tight">{gameMode === 'battle' ? 'AI BATTLE' : gameMode === 'friend' ? 'BATTLE ARENA' : gameState.currentLanguage}</h3>
                  <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">{isMultiplayer ? `${t.turnCount} ${multiplayerData.totalTurns}/${MAX_TURNS}` : `${t.stage} ${gameState.currentStage}`}</span>
               </div>
            </div>
            {(gameMode === 'battle' || gameMode === 'friend') && (
               <div className="flex flex-col items-center gap-1 flex-1 px-8">
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(gameMode === 'battle' ? battleProgress.user : friendProgress.me) / (gameMode === 'battle' ? BATTLE_TARGET : (MAX_TURNS/2)) * 100}%` }}></div>
                    <div className="h-full bg-red-500 transition-all duration-500 ml-auto" style={{ width: `${(gameMode === 'battle' ? battleProgress.ai : friendProgress.him) / (gameMode === 'battle' ? BATTLE_TARGET : (MAX_TURNS/2)) * 100}%` }}></div>
                  </div>
               </div>
            )}
            <div className="bg-[#0a0f1e] border-2 border-white/5 px-4 py-3 rounded-xl flex items-center gap-2"><Timer className={`w-5 h-5 ${gameState.timeLeft < 7 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} /><span className="text-2xl font-mono font-black">{gameState.timeLeft}</span></div>
          </header>
          <div className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-2xl min-h-[420px] flex flex-col justify-center relative overflow-hidden">
            {isLoading || isPreparingQuestions ? (
               <div className="text-center space-y-4">
                  <Loader2 className="w-14 h-14 text-blue-500 animate-spin mx-auto" />
                  {isPreparingQuestions && <p className="text-blue-400 font-black animate-pulse">{t.preparingMatch}</p>}
               </div>
            ) : !isMyTurn ? (
              <div className="flex flex-col items-center gap-8 py-10">
                <Hourglass className="w-24 h-24 text-blue-500 animate-bounce" />
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-blue-400">{t.waitingTurn}</h2>
                  <p className="text-slate-500 font-bold">{t.turnCount}: {multiplayerData.totalTurns} / {MAX_TURNS}</p>
                </div>
              </div>
            ) : currentQuestion ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                <h2 className={`text-xl md:text-2xl font-black leading-tight ${uiLang === 'ar' ? 'text-right' : 'text-left'}`}>{currentQuestion.text}</h2>
                {currentQuestion.codeSnippet && (<div className="bg-black/40 rounded-[1.2rem] p-6 border border-white/5 font-mono text-xs text-blue-400 overflow-x-auto shadow-inner" dir="ltr"><pre><code>{currentQuestion.codeSnippet}</code></pre></div>)}
                <div className="grid gap-3">
                  {currentQuestion.options.map((opt, idx) => { 
                    const isSelected = selectedOption === idx; const isCorrect = idx === currentQuestion.correctAnswerIndex; 
                    let btnClass = `w-full ${uiLang === 'ar' ? 'text-right' : 'text-left'} p-5 rounded-3xl border-2 transition-all font-bold flex items-center justify-between text-md ${uiLang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`; 
                    if (selectedOption === null) btnClass += " bg-[#0f172a] border-white/5 hover:border-blue-500 active:scale-95";
                    else if (isSelected && isCorrect) btnClass += " bg-green-500/20 border-green-500 text-green-400"; else if (isSelected && !isCorrect) btnClass += " bg-red-500/20 border-red-500 text-red-400"; 
                    else if (isCorrect) btnClass += " bg-green-500/10 border-green-500/40 text-green-400"; else btnClass += " bg-slate-800/20 border-transparent text-slate-600 opacity-40"; 
                    return (<button key={idx} disabled={selectedOption !== null || !isMyTurn} onClick={() => handleOptionClick(idx)} className={btnClass}><div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs border border-white/10">{String.fromCharCode(65 + idx)}</div><span className="flex-1 px-4">{opt}</span></button>); 
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <button onClick={() => { if(isMultiplayer) remove(ref(database, `challenges/${playerCode}`)); setGameMode(null); }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-500 flex items-center justify-center active:scale-95"><LogOut className="w-6 h-6" /></button>
       </div>
       {showRevive && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[2000] flex items-center justify-center p-6" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
             <div className="bg-[#0a0f1e] border border-yellow-500/30 rounded-[3.5rem] p-8 text-center max-w-md w-full"><MascotIcon mood="upset" /><h2 className="text-3xl font-black mb-2 text-yellow-500">{t.reviveTitle}</h2><p className="text-slate-400 font-bold text-sm mb-8">{t.reviveSub}</p>
                <div className="space-y-4">
                   <button onClick={handleReviveWithCoins} disabled={totalCoins < REVIVE_COST} className="w-full bg-[#0f172a] border-2 border-blue-600/30 p-6 rounded-[2rem] flex flex-col items-center gap-2"><div className="flex items-center gap-3"><Coins className="w-6 h-6 text-yellow-500" /><span className="text-lg font-black text-white">{t.continueWithCoins}</span></div><span className="text-[10px] text-slate-500 font-black">{totalCoins.toLocaleString()} / {REVIVE_COST.toLocaleString()}</span></button>
                   <button onClick={handleReviveWithAd} className="w-full bg-blue-600 p-6 rounded-[2rem] flex items-center justify-center gap-3 font-black text-lg"><PlayCircle className="w-6 h-6" /> {t.continueWithAd}</button>
                   <button onClick={handleGameOver} className="w-full text-slate-500 font-bold py-2">{t.returnMenu}</button>
                </div>
             </div>
          </div>
       )}
       {gameState.isGameOver && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[600] flex justify-center p-4 py-10 overflow-y-auto" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
             <div className="bg-[#0a0f1e] border border-white/10 rounded-[3rem] p-8 text-center max-w-md w-full h-fit my-auto">
                <MascotIcon mood="angry" /><h2 className="text-3xl font-black mb-4">{matchResultState === 'loss' ? t.lostAgainstFriend : t.gameOver}</h2>
                <div className="bg-red-500/10 p-4 rounded-2xl mb-6 flex justify-between items-center border border-red-500/20"><span className="font-black text-[10px] uppercase tracking-widest">{t.penalty}</span><span className="text-xl font-mono font-black text-red-500">-{matchResultState === 'loss' ? 0 : (gameMode === 'daily' ? DAILY_LOSS_PENALTY : LOSS_PENALTY)}</span></div>
                <button onClick={() => { setGameMode(null); setGameState(prev => ({ ...prev, isGameOver: false })); }} className="w-full bg-slate-800 py-5 rounded-[2rem] font-black text-lg">{t.returnMenu}</button>
             </div>
          </div>
       )}
       {gameState.isGameWon && (
          <div className="fixed inset-0 bg-black/95 z-[600] flex justify-center p-4 py-10 overflow-y-auto" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
             <div className="bg-[#0a0f1e] border border-green-500/30 rounded-[3rem] p-8 text-center max-w-md w-full h-fit my-auto">
                <PartyPopper className="w-20 h-20 text-yellow-500 mx-auto mb-4 animate-bounce" />
                <h2 className="text-4xl font-black mb-4 text-green-500">{matchResultState === 'win' ? t.wonAgainstFriend : t.victory}</h2>
                <p className="text-slate-400 font-bold mb-6">{matchResultState === 'win' ? t.payoutWinner.replace('{amount}', gameState.score) : ""}</p>
                <div className="bg-green-500/10 p-6 rounded-[2rem] mb-8 flex justify-between items-center border border-green-500/20"><div className={uiLang === 'ar' ? 'text-right' : 'text-left'}><span className="text-slate-500 uppercase font-black text-[10px]">{t.winnings}</span><div className="text-3xl font-mono font-black text-yellow-500 mt-1">{gameState.score}</div></div><Trophy className="w-10 h-10 text-yellow-500" /></div>
                <button onClick={() => { setGameMode(null); setGameState(prev => ({ ...prev, isGameWon: false })); }} className="w-full bg-green-600 py-6 rounded-[2.5rem] font-black text-xl active:scale-95">{t.claimReward}</button>
             </div>
          </div>
       )}
       {matchResultState === 'draw' && (
          <div className="fixed inset-0 bg-black/95 z-[600] flex justify-center p-4 py-10 overflow-y-auto" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
             <div className="bg-[#0a0f1e] border border-blue-500/30 rounded-[3rem] p-8 text-center max-w-md w-full h-fit my-auto">
                <Users className="w-20 h-20 text-blue-500 mx-auto mb-4" />
                <h2 className="text-4xl font-black mb-4 text-blue-500">{t.draw}</h2>
                <p className="text-slate-400 font-bold mb-8">{t.drawSub}</p>
                <button onClick={() => { setGameMode(null); setMatchResultState(null); }} className="w-full bg-blue-600 py-6 rounded-[2.5rem] font-black text-xl active:scale-95">{t.returnMenu}</button>
             </div>
          </div>
       )}
    </div>
  );
};

export default App;
