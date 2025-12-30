
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Question, Difficulty, LeaderboardEntry } from './types';
import { LANGUAGES, PRIZE_LADDER, COINS_KEY, DAILY_CHALLENGE_KEY, DAILY_BONUS_AMOUNT, LEADERBOARD_KEY, INITIAL_MOCK_LEADERBOARD, FAKE_NAMES } from './constants';
import { generateProgrammingQuestion } from './services/geminiService';
import { AdService } from './services/adService';
import { 
  Terminal, Coins, Languages, 
  ShieldCheck, XCircle, CheckCircle2, 
  XCircle as XIcon, Loader2, Timer, Cpu, 
  Users, HelpCircle, PhoneCall, Trophy,
  ChevronRight, LogOut, ArrowRight, Sparkles,
  Zap, Calendar, BrainCircuit, ListOrdered, Menu, 
  Sword, User, Bot, AlertTriangle, Star, Languages as LangIcon, PlayCircle, Medal
} from 'lucide-react';

const QUESTION_TIME = 20; 
const ENTRY_FEE = 100;
const BATTLE_STAKE = 100;
const BATTLE_WIN_REWARD = 200;
const LOSS_PENALTY = 200;
const REVIVE_COST = 5000;
const DAILY_QUEST_REWARD = 50000;
const BATTLE_TARGET = 5; 
const PLAYER_NAME_KEY = 'code_quest_player_name';
const LAST_DAILY_COMPLETED_KEY = 'last_daily_completed_date_v1';
const UI_LANG_KEY = 'code_quest_ui_lang';

// Translations Dictionary
const translations = {
  ar: {
    loginTitle: "أدخل اسمك للمتابعة",
    saveName: "حفظ الاسم",
    wallet: "المحفظة",
    subtitle: "تحدي المبرمج العبقري",
    dailyChallenge: "التحدي اليومي",
    dailyCompleted: "تم إكمال التحدي اليومي",
    dailyReward: "+50,000 قطعة مكافأة",
    aiBattle: "AI Battle",
    stake: "الرهان",
    statusStarted: "تم تشغيل نظام كود كويست بنجاح",
    loggedInAs: "تسجيل الدخول باسم",
    stage: "المرحلة",
    difficulty: "الصعوبة",
    master: "محترف",
    mixed: "مختلط",
    you: "أنت",
    geminiBot: "جيمناي بوت",
    thinking: "يفكر...",
    gameOver: "انتهت المحاولة",
    aiWon: "انتصر الذكاء الاصطناعي!",
    score: "النتيجة",
    points: "النقاط",
    returnMenu: "العودة للقائمة",
    victory: "مبروك الفوز!",
    crushedAi: "لقد سحقت الذكاء الاصطناعي وحصلت على الضعف!",
    becameMaster: "لقد أصبحت مبرمجاً عبقرياً!",
    dailyRewardWon: "أنت حقاً محترف! تم إضافة جائزة التحدي اليومي.",
    winnings: "الأرباح",
    penalty: "خصم الخسارة",
    claimReward: "استلام الجائزة",
    insufficientBalance: "رصيدك غير كافٍ!",
    dailyLimit: "لقد أتممت تحدي اليوم بالفعل! عد غداً.",
    loadingAi: "الذكاء الاصطناعي يزامن المعرفة...",
    continueWithCoins: "أكمل بـ 5000 قطعة",
    continueWithAd: "شاهد إعلان للأكمال",
    reviveUsed: "تم استخدام المحاولة سابقاً",
    leaderboardTitle: "أفضل 20 عبقري",
    leaderboardEmpty: "لا يوجد متنافسون بعد!",
    rank: "المركز",
    player: "اللاعب",
    totalWinnings: "إجمالي الأرباح",
    prizePool: "جائزة السؤال"
  },
  en: {
    loginTitle: "Enter your name to continue",
    saveName: "Save Name",
    wallet: "Wallet",
    subtitle: "The Genius Programmer Challenge",
    dailyChallenge: "Daily Challenge",
    dailyCompleted: "Daily Challenge Completed",
    dailyReward: "+50,000 Coins Reward",
    aiBattle: "AI Battle",
    stake: "Stake",
    statusStarted: "Code Quest system started successfully",
    loggedInAs: "Logged in as",
    stage: "Stage",
    difficulty: "Difficulty",
    master: "Master",
    mixed: "Mixed",
    you: "You",
    geminiBot: "Gemini Bot",
    thinking: "Thinking...",
    gameOver: "Game Over",
    aiWon: "AI has triumphed!",
    score: "Score",
    points: "Points",
    returnMenu: "Back to Menu",
    victory: "Victory!",
    crushedAi: "You crushed the AI and doubled your stake!",
    becameMaster: "You've become a Master Programmer!",
    dailyRewardWon: "A true pro! Daily challenge reward added.",
    winnings: "Winnings",
    penalty: "Loss Penalty",
    claimReward: "Claim Reward",
    insufficientBalance: "Insufficient balance!",
    dailyLimit: "Daily challenge completed! Come back tomorrow.",
    loadingAi: "AI is syncing knowledge...",
    continueWithCoins: "Continue for 5,000 Coins",
    continueWithAd: "Watch Ad to Continue",
    reviveUsed: "Already used this game",
    leaderboardTitle: "Top 20 Geniuses",
    leaderboardEmpty: "No competitors yet!",
    rank: "Rank",
    player: "Player",
    totalWinnings: "Total Winnings",
    prizePool: "Question Prize"
  }
};

const MascotIcon = ({ size = "w-32 h-32", mood = "normal" }) => (
  <div className={`${size} relative mx-auto mb-6 bg-[#1e293b] rounded-[2rem] border-4 border-[#2d3748] shadow-2xl flex flex-col items-center justify-center overflow-hidden`}>
    <div className="absolute top-2 left-0 right-0 flex justify-center gap-1">
      <div className="w-2 h-2 rounded-full bg-red-500"></div>
      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
      <div className="w-2 h-2 rounded-full bg-green-500"></div>
    </div>
    <div className="flex gap-6 mt-4">
      <div className={`w-4 h-4 rounded-full ${mood === 'angry' ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-yellow-400 shadow-[0_0_15px_#facc15]'}`}></div>
      <div className={`w-4 h-4 rounded-full ${mood === 'angry' ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-yellow-400 shadow-[0_0_15px_#facc15]'}`}></div>
    </div>
    <div className={`mt-4 ${mood === 'angry' ? 'text-red-500' : 'text-yellow-500'} font-black text-2xl flex items-center gap-1`}>
      <span className="animate-pulse">{'>'}</span>
      <span className="w-4 h-1 bg-current mt-2"></span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [uiLang, setUiLang] = useState<'ar' | 'en'>((localStorage.getItem(UI_LANG_KEY) as 'ar' | 'en') || 'ar');
  const t = translations[uiLang];
  
  const [gameMode, setGameMode] = useState<'classic' | 'battle' | 'daily' | null>(null);
  const [battleProgress, setBattleProgress] = useState({ user: 0, ai: 0 });
  const [aiStatus, setAiStatus] = useState<'thinking' | 'idle' | 'answered'>('idle');
  const [isDailyCompleted, setIsDailyCompleted] = useState(localStorage.getItem(LAST_DAILY_COMPLETED_KEY) === new Date().toDateString());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  
  const [gameState, setGameState] = useState<GameState>({
    currentLanguage: null,
    currentStage: 1,
    currentQuestionIndex: 0,
    score: '0',
    timeLeft: QUESTION_TIME,
    isGameOver: false,
    isGameWon: false,
    withdrawn: false,
    lifelines: { fiftyFifty: true, askAudience: true, expertCall: true },
    revivedWithCoins: false,
    revivedWithAd: false
  });
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playerName, setPlayerName] = useState<string>(localStorage.getItem(PLAYER_NAME_KEY) || '');
  const [totalCoins, setTotalCoins] = useState<number>(parseInt(localStorage.getItem(COINS_KEY) || '1000'));
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  
  const timerRef = useRef<number | null>(null);
  const aiTimerRef = useRef<number | null>(null);

  useEffect(() => {
    AdService.init();
    checkDailyBonus();
    loadLeaderboard();
  }, []);

  useEffect(() => {
    if (!gameMode && playerName) {
      const timer = setTimeout(() => {
        AdService.displayBanner('banner-dashboard');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameMode, playerName]);

  const loadLeaderboard = () => {
    const saved = localStorage.getItem(LEADERBOARD_KEY);
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    } else {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(INITIAL_MOCK_LEADERBOARD));
      setLeaderboard(INITIAL_MOCK_LEADERBOARD);
    }
  };

  const saveToLeaderboard = (score: number, lang: string) => {
    if (score <= 0) return;
    setLeaderboard(prev => {
      // Find and update if player already exists with lower score
      const existingIdx = prev.findIndex(e => e.name === playerName);
      let updated = [...prev];
      if (existingIdx !== -1) {
        if (updated[existingIdx].score < score) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            score,
            scoreFormatted: score.toLocaleString(),
            language: lang,
            date: new Date().toISOString().split('T')[0]
          };
        }
      } else {
        updated.push({
          name: playerName,
          score,
          scoreFormatted: score.toLocaleString(),
          language: lang,
          date: new Date().toISOString().split('T')[0]
        });
      }
      
      // Inject 1-2 fake players every time a game finishes to feel "live"
      for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
        const fakeScore = parseInt(PRIZE_LADDER[Math.floor(Math.random() * PRIZE_LADDER.length)].replace(/,/g, ''));
        updated.push({
          name: FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)],
          score: fakeScore,
          scoreFormatted: fakeScore.toLocaleString(),
          language: LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)].name,
          date: new Date().toISOString().split('T')[0]
        });
      }

      const sortedTop20 = updated
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
      
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(sortedTop20));
      return sortedTop20;
    });
  };

  const updateCoins = (amount: number) => {
    setTotalCoins(prev => {
      const newTotal = Math.max(0, prev + amount);
      localStorage.setItem(COINS_KEY, newTotal.toString());
      return newTotal;
    });
  };

  const toggleLanguage = () => {
    const newLang = uiLang === 'ar' ? 'en' : 'ar';
    setUiLang(newLang);
    localStorage.setItem(UI_LANG_KEY, newLang);
  };

  const checkDailyBonus = () => {
    const lastDate = localStorage.getItem(DAILY_CHALLENGE_KEY);
    const today = new Date().toDateString();
    if (lastDate !== today) {
      updateCoins(DAILY_BONUS_AMOUNT);
      localStorage.setItem(DAILY_CHALLENGE_KEY, today);
    }
    setIsDailyCompleted(localStorage.getItem(LAST_DAILY_COMPLETED_KEY) === today);
  };

  const startDailyQuest = async () => {
    if (isDailyCompleted) return alert(t.dailyLimit);
    setGameMode('daily');
    setGameState({ 
      currentLanguage: 'Daily Master Challenge', 
      currentStage: 1,
      currentQuestionIndex: 0, 
      score: '0',
      isGameOver: false,
      isGameWon: false,
      withdrawn: false,
      timeLeft: 45,
      lifelines: { fiftyFifty: true, askAudience: true, expertCall: true },
      revivedWithCoins: false,
      revivedWithAd: false
    });
    await fetchQuestion('random', 0, 5, Difficulty.Master);
  };

  const startAIBattle = async () => {
    if (totalCoins < BATTLE_STAKE) return alert(t.insufficientBalance);
    updateCoins(-BATTLE_STAKE);
    setGameMode('battle');
    setBattleProgress({ user: 0, ai: 0 });
    setGameState({ 
      currentLanguage: t.mixed, 
      currentStage: 1,
      currentQuestionIndex: 0, 
      score: '0',
      isGameOver: false,
      isGameWon: false,
      withdrawn: false,
      timeLeft: QUESTION_TIME,
      lifelines: { fiftyFifty: true, askAudience: true, expertCall: true },
      revivedWithCoins: false,
      revivedWithAd: false
    });
    await fetchQuestion('javascript', 0, 1);
  };

  const startNewGame = async (lang: string) => {
    if (totalCoins < ENTRY_FEE) return alert(t.insufficientBalance);
    updateCoins(-ENTRY_FEE);
    setGameMode('classic');
    setGameState({ 
      currentLanguage: lang, 
      currentStage: 1,
      currentQuestionIndex: 0, 
      score: '0',
      isGameOver: false, 
      isGameWon: false,
      withdrawn: false,
      timeLeft: QUESTION_TIME,
      lifelines: { fiftyFifty: true, askAudience: true, expertCall: true },
      revivedWithCoins: false,
      revivedWithAd: false
    });
    await fetchQuestion(lang, 0, 1);
  };

  const fetchQuestion = async (lang: string, qIdx: number, stage: number, difficulty?: Difficulty) => {
    setIsLoading(true);
    setSelectedOption(null);
    setDisabledOptions([]);
    try {
      const question = await generateProgrammingQuestion(lang, stage, qIdx, uiLang, difficulty);
      setCurrentQuestion(question);
      setGameState(prev => ({ ...prev, timeLeft: gameMode === 'daily' ? 45 : QUESTION_TIME }));
      
      startTimer();

      if (gameMode === 'battle') {
        // AI logic is now handled in an independent loop started once in startAIBattle
        // but we'll restart thinking here if needed
        simulateAiMove();
      }
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

  const handleGameOver = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
    updateCoins(-LOSS_PENALTY);
    // Save current session earnings to leaderboard
    const earned = parseInt(gameState.score.replace(/,/g, ''));
    if (earned > 0) saveToLeaderboard(earned, gameState.currentLanguage || 'mixed');
  };

  /**
   * AI Answering Logic
   * Dynamic timing: 4-10 seconds
   * Occasional mistakes based on progress
   */
  const simulateAiMove = () => {
    if (gameMode !== 'battle' || gameState.isGameOver || gameState.isGameWon) return;

    setAiStatus('thinking');
    if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
    
    // Answering time between 4s and 9s to make it feel more human/varying
    const thinkingTime = Math.floor(Math.random() * 5000) + 4000;
    
    aiTimerRef.current = window.setTimeout(() => {
      setAiStatus('idle');
      
      // Dynamic accuracy: starts high, might slip as it gets closer to goal
      const baseAccuracy = 0.88;
      const progressPenalty = battleProgress.ai * 0.04;
      const currentAccuracy = Math.max(0.65, baseAccuracy - progressPenalty);
      
      const isCorrect = Math.random() < currentAccuracy;
      
      if (isCorrect) {
        setBattleProgress(prev => {
          const newAiScore = prev.ai + 1;
          if (newAiScore >= BATTLE_TARGET) {
            setGameState(g => ({ ...g, isGameOver: true }));
            handleGameOver();
          } else {
            // Plan next move
            simulateAiMove();
          }
          return { ...prev, ai: newAiScore };
        });
      } else {
        // If wrong, AI "pauses" for a bit before trying the same question again or moving on
        const retryDelay = Math.floor(Math.random() * 3000) + 2000;
        aiTimerRef.current = window.setTimeout(simulateAiMove, retryDelay);
      }
    }, thinkingTime);
  };

  const handleOptionClick = (idx: number) => {
    if (selectedOption !== null || gameState.isGameOver) return;
    setSelectedOption(idx);
    if (timerRef.current) window.clearInterval(timerRef.current);

    const isCorrect = idx === currentQuestion?.correctAnswerIndex;
    setTimeout(async () => {
      if (isCorrect) {
        if (gameMode === 'battle') {
          setBattleProgress(prev => {
            const newScore = prev.user + 1;
            if (newScore >= BATTLE_TARGET) {
               if (aiTimerRef.current) window.clearTimeout(aiTimerRef.current);
               setGameState(prevGame => ({ ...prevGame, isGameWon: true }));
               updateCoins(BATTLE_WIN_REWARD);
               saveToLeaderboard(BATTLE_WIN_REWARD, 'AI Battle');
            } else {
               fetchQuestion('mixed', gameState.currentQuestionIndex + 1, 3);
            }
            return { ...prev, user: newScore };
          });
        } else if (gameMode === 'daily') {
          setGameState(prev => ({ ...prev, isGameWon: true }));
          updateCoins(DAILY_QUEST_REWARD);
          saveToLeaderboard(DAILY_QUEST_REWARD, 'Daily Quest');
          localStorage.setItem(LAST_DAILY_COMPLETED_KEY, new Date().toDateString());
          setIsDailyCompleted(true);
        } else {
          const nextIdx = gameState.currentQuestionIndex + 1;
          const earnedScore = PRIZE_LADDER[gameState.currentQuestionIndex];
          
          setGameState(prev => ({ ...prev, currentQuestionIndex: nextIdx, score: earnedScore }));
          
          if (nextIdx >= 15) {
            setGameState(prev => ({ ...prev, isGameWon: true }));
            updateCoins(1000000);
            saveToLeaderboard(1000000, gameState.currentLanguage || 'Master');
          } else {
            await fetchQuestion(gameState.currentLanguage!, nextIdx, Math.floor(nextIdx / 3) + 1);
          }
        }
      } else {
        handleGameOver();
        setGameState(prev => ({ ...prev, isGameOver: true }));
      }
    }, 1500);
  };

  const handleReviveWithCoins = () => {
    if (totalCoins < REVIVE_COST || gameState.revivedWithCoins || gameState.revivedWithAd) return;
    updateCoins(-REVIVE_COST);
    // Refund penalty since we are continuing
    updateCoins(LOSS_PENALTY);
    setGameState(prev => ({
      ...prev,
      isGameOver: false,
      timeLeft: QUESTION_TIME,
      revivedWithCoins: true
    }));
    startTimer();
    if (gameMode === 'battle') simulateAiMove();
  };

  const handleReviveWithAd = async () => {
    if (gameState.revivedWithAd || gameState.revivedWithCoins) return;

    const success = await AdService.showRewardedAd();
    if (success) {
      updateCoins(LOSS_PENALTY);
      setGameState(prev => ({
        ...prev,
        isGameOver: false,
        timeLeft: QUESTION_TIME,
        revivedWithAd: true
      }));
      startTimer();
      if (gameMode === 'battle') simulateAiMove();
    }
  };

  // Login View
  if (!playerName) {
    return (
      <div className={`min-h-screen bg-[#020617] flex items-center justify-center p-6 font-['Tajawal'] text-white`} dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-[#0a0f1e] border border-[#1e293b] rounded-[3rem] p-10 text-center shadow-2xl relative">
          <button 
            onClick={toggleLanguage}
            className="absolute top-8 left-8 p-3 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <LangIcon className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold uppercase">{uiLang === 'ar' ? 'EN' : 'AR'}</span>
          </button>
          <MascotIcon />
          <h1 className="text-3xl font-black mb-10">{t.loginTitle}</h1>
          <input 
            type="text" 
            placeholder=" "
            className="w-full bg-[#0f172a] border-2 border-[#1e293b] rounded-2xl px-6 py-5 mb-8 text-center text-xl focus:border-blue-500 outline-none transition-all font-bold"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                const val = (e.target as HTMLInputElement).value;
                setPlayerName(val);
                localStorage.setItem(PLAYER_NAME_KEY, val);
              }
            }}
          />
          <button 
            onClick={() => {
              const input = document.querySelector('input') as HTMLInputElement;
              if (input.value.trim()) {
                setPlayerName(input.value);
                localStorage.setItem(PLAYER_NAME_KEY, input.value);
              }
            }}
            className="w-full bg-[#2563eb] hover:bg-blue-500 py-5 rounded-[2rem] text-2xl font-black transition-all shadow-lg shadow-blue-900/20"
          >
            {t.saveName}
          </button>
        </div>
      </div>
    );
  }

  // Dashboard View
  if (!gameMode) {
    return (
      <div className={`min-h-screen bg-[#020617] text-white font-['Tajawal'] pb-32`} dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
        <header className="px-6 pt-8 flex items-center justify-between max-w-2xl mx-auto">
          <button 
            onClick={() => {
              loadLeaderboard();
              setShowLeaderboard(true);
            }}
            className="p-4 bg-[#0a0f1e] rounded-2xl border border-[#1e293b] text-yellow-500 hover:bg-white/5 transition-all"
          >
            <ListOrdered className="w-6 h-6" />
          </button>
          
          <div className="bg-[#0a0f1e] border border-[#1e293b] px-8 py-3 rounded-2xl flex flex-col items-center min-w-[140px] shadow-lg shadow-yellow-500/5">
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{t.wallet}</span>
             <span className="text-2xl font-black text-yellow-500 font-mono tracking-tight">{totalCoins.toLocaleString()}</span>
          </div>

          <button 
            onClick={toggleLanguage}
            className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500 flex items-center gap-2 hover:bg-blue-500/20 transition-all"
          >
            <LangIcon className="w-6 h-6" />
            <span className="font-black uppercase">{uiLang === 'ar' ? 'EN' : 'AR'}</span>
          </button>
        </header>

        <main className="max-w-2xl mx-auto px-6 mt-12 text-center">
          <MascotIcon size="w-40 h-40" />
          <h1 className="text-6xl font-black tracking-tighter mb-2 italic">CODE QUEST</h1>
          <p className="text-slate-500 font-bold mb-12 uppercase tracking-[0.2em]">{t.subtitle}</p>

          <div className="space-y-6">
            <div 
              onClick={startDailyQuest}
              className={`bg-[#0a0f1e] border-2 rounded-[2.5rem] p-10 flex flex-col items-center gap-4 group transition-all cursor-pointer active:scale-95 ${isDailyCompleted ? 'border-green-600/30 grayscale opacity-70' : 'border-blue-600/30 hover:border-blue-500'}`}
            >
              {isDailyCompleted ? <CheckCircle2 className="w-16 h-16 text-green-500" /> : <Calendar className="w-16 h-16 text-blue-500" />}
              <div className="text-center">
                <h2 className="text-3xl font-black">{isDailyCompleted ? t.dailyCompleted : t.dailyChallenge}</h2>
                {!isDailyCompleted && <p className="text-xs text-blue-400 font-bold mt-1 tracking-widest">{t.dailyReward}</p>}
              </div>
            </div>

            <div 
              onClick={startAIBattle}
              className="bg-[#0a0f1e] border-2 border-purple-600/30 rounded-[2.5rem] p-10 flex flex-col items-center gap-2 group hover:border-purple-500 transition-all cursor-pointer active:scale-95"
            >
              <BrainCircuit className="w-16 h-16 text-purple-500" />
              <h2 className="text-3xl font-black">{t.aiBattle}</h2>
              <span className="bg-purple-900/40 text-purple-400 px-4 py-1 rounded-full text-xs font-bold border border-purple-500/20 uppercase tracking-widest">{t.stake}: 100</span>
            </div>

            {LANGUAGES.map(lang => (
              <div 
                key={lang.id}
                onClick={() => startNewGame(lang.id)}
                className={`bg-[#0a0f1e] border-2 border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-end gap-1 group hover:border-blue-500 transition-all cursor-pointer relative overflow-hidden active:scale-95 ${uiLang === 'en' ? 'items-start text-left' : 'items-end text-right'}`}
              >
                <Terminal className="w-8 h-8 text-blue-500 mb-2" />
                <h2 className="text-2xl font-black tracking-widest">{lang.name}</h2>
                <p className="text-slate-500 text-sm font-bold">{lang.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-slate-600 font-mono text-sm flex items-center justify-center gap-2 flex-wrap pb-10">
             <span> {t.statusStarted}. {'>'} </span>
             <span className="text-blue-500 font-bold tracking-widest uppercase">{t.loggedInAs}: {playerName} {'<'}</span>
             <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
                <Terminal className="w-4 h-4 text-blue-500" />
             </div>
          </div>
        </main>

        {/* Leaderboard Modal (Top 20) */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-[#020617]/98 backdrop-blur-2xl z-[200] flex flex-col animate-in fade-in duration-300" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
             <header className="px-6 py-10 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-4">
                   <div className="bg-yellow-500/10 p-3 rounded-2xl border border-yellow-500/20">
                      <Medal className="w-8 h-8 text-yellow-500" />
                   </div>
                   <h2 className="text-3xl font-black tracking-tighter">{t.leaderboardTitle}</h2>
                </div>
                <button 
                  onClick={() => setShowLeaderboard(false)}
                  className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all"
                >
                   <XIcon className="w-7 h-7" />
                </button>
             </header>
             <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4">
                {leaderboard.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-30">
                    <Medal className="w-20 h-20 mb-4" />
                    <p className="text-xl font-bold">{t.leaderboardEmpty}</p>
                  </div>
                ) : (
                  leaderboard.map((entry, idx) => {
                    const isTop3 = idx < 3;
                    const isPlayer = entry.name === playerName;
                    const colors = ['#facc15', '#94a3b8', '#92400e'];
                    return (
                      <div key={idx} className={`relative bg-[#0a0f1e] border ${isPlayer ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-white/5'} p-6 rounded-[2rem] flex items-center justify-between animate-in slide-in-from-bottom duration-300`} style={{ animationDelay: `${idx * 40}ms` }}>
                         <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center font-black text-xl ${isTop3 ? '' : 'bg-white/5 text-slate-500 border border-white/5'}`} style={isTop3 ? { backgroundColor: `${colors[idx]}20`, color: colors[idx], border: `2px solid ${colors[idx]}40` } : {}}>
                               {idx + 1}
                            </div>
                            <div>
                               <h4 className={`font-black text-xl flex items-center gap-2 ${isPlayer ? 'text-blue-400' : ''}`}>
                                 {entry.name}
                                 {isPlayer && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
                               </h4>
                               <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">{entry.language}</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-2xl font-black text-yellow-500 font-mono tracking-tighter">{entry.scoreFormatted}</div>
                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">{t.totalWinnings}</span>
                         </div>
                         {isTop3 && (
                            <div className="absolute -top-2 -right-2 transform rotate-12">
                               <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                            </div>
                         )}
                      </div>
                    );
                  })
                )}
             </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-[#020617]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-center z-[60]">
           <div id="banner-dashboard" style={{width: '320px', height: '50px', background: 'transparent'}}></div>
        </div>
      </div>
    );
  }

  // Game View
  return (
    <div className={`min-h-screen bg-[#020617] text-white font-['Tajawal'] p-6`} dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
       <div className="max-w-2xl mx-auto space-y-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-blue-600 rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-lg shadow-blue-600/20">
                  {gameMode === 'battle' ? <Sword className="w-7 h-7" /> : gameMode === 'daily' ? <Star className="w-7 h-7 text-yellow-400" /> : gameState.currentQuestionIndex + 1}
               </div>
               <div>
                  <h3 className="font-black text-lg leading-none uppercase tracking-tight">{gameMode === 'battle' ? 'AI BATTLE ROYALE' : gameMode === 'daily' ? 'MASTER CHALLENGE' : gameState.currentLanguage}</h3>
                  <span className="text-xs text-slate-500 font-mono font-bold tracking-widest">
                    {gameMode === 'battle' ? `${t.points}: ${BATTLE_TARGET}` : gameMode === 'daily' ? `${t.difficulty}: ${t.master.toUpperCase()}` : `${t.stage.toUpperCase()} ${gameState.currentStage}`}
                  </span>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               {gameMode === 'classic' && (
                 <div className="bg-yellow-500/10 border-2 border-yellow-500/30 px-5 py-2 rounded-2xl flex flex-col items-center shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                    <span className="text-[9px] text-yellow-500 font-black uppercase tracking-[0.2em] mb-1">{t.prizePool}</span>
                    <span className="text-xl font-black text-yellow-400 font-mono tracking-tighter">
                      {PRIZE_LADDER[gameState.currentQuestionIndex]}
                    </span>
                 </div>
               )}
               <div className="bg-[#0a0f1e] border-2 border-white/5 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-lg">
                 <Timer className={`w-6 h-6 ${gameState.timeLeft < 7 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
                 <span className="text-3xl font-mono font-black">{gameState.timeLeft}</span>
               </div>
            </div>
          </header>

          {gameMode === 'battle' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a0f1e] p-6 rounded-[2rem] border-2 border-blue-500/20 flex flex-col items-center">
                 <User className="w-7 h-7 text-blue-400 mb-2" />
                 <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t.you}</span>
                 <div className="text-3xl font-black text-blue-500 font-mono mt-1">{battleProgress.user}/{BATTLE_TARGET}</div>
              </div>
              <div className="bg-[#0a0f1e] p-6 rounded-[2rem] border-2 border-purple-500/20 flex flex-col items-center">
                 <div className="relative">
                    <Bot className={`w-7 h-7 ${aiStatus === 'thinking' ? 'text-purple-400 animate-bounce' : 'text-purple-400'} mb-2`} />
                    {aiStatus === 'thinking' && <span className="absolute -top-1 -right-4 text-[10px] text-purple-400 font-black animate-pulse">{t.thinking}</span>}
                 </div>
                 <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t.geminiBot}</span>
                 <div className="text-3xl font-black text-purple-500 font-mono mt-1">{battleProgress.ai}/{BATTLE_TARGET}</div>
              </div>
            </div>
          )}

          <div className="bg-[#0a0f1e] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl min-h-[420px] flex flex-col justify-center relative overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-pulse" />
                </div>
                <p className="text-slate-500 font-mono italic text-lg">{t.loadingAi}</p>
              </div>
            ) : currentQuestion ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <h2 className={`text-2xl md:text-3xl font-black leading-tight ${uiLang === 'ar' ? 'text-right' : 'text-left'}`}>{currentQuestion.text}</h2>
                
                {currentQuestion.codeSnippet && (
                  <div className="bg-black/60 rounded-[1.5rem] p-8 border border-white/5 font-mono text-sm text-blue-400 overflow-x-auto shadow-inner" dir="ltr">
                    <pre><code>{currentQuestion.codeSnippet}</code></pre>
                  </div>
                )}

                <div className="grid gap-4">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQuestion.correctAnswerIndex;
                    const isDisabled = disabledOptions.includes(idx);

                    let btnClass = `w-full ${uiLang === 'ar' ? 'text-right' : 'text-left'} p-7 rounded-[2rem] border-2 transition-all font-bold flex items-center justify-between text-lg ${uiLang === 'ar' ? 'flex-row' : 'flex-row-reverse'}`;
                    if (isDisabled) btnClass += " opacity-0 pointer-events-none scale-95";
                    else if (selectedOption === null) btnClass += " bg-[#0f172a] border-white/5 hover:border-blue-500 hover:bg-blue-500/5";
                    else if (isSelected && isCorrect) btnClass += " bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_25px_rgba(34,197,94,0.3)]";
                    else if (isSelected && !isCorrect) btnClass += " bg-red-500/20 border-red-500 text-red-400";
                    else if (isCorrect) btnClass += " bg-green-500/10 border-green-500/40 text-green-400";
                    else btnClass += " bg-slate-800/20 border-transparent text-slate-600";

                    return (
                      <button key={idx} disabled={selectedOption !== null} onClick={() => handleOptionClick(idx)} className={btnClass}>
                         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sm text-slate-400 border border-white/10">{String.fromCharCode(65 + idx)}</div>
                         <span className="flex-1 px-6">{opt}</span>
                         {selectedOption !== null && isCorrect && <CheckCircle2 className="w-7 h-7 text-green-500 animate-in zoom-in" />}
                         {selectedOption !== null && isSelected && !isCorrect && <XIcon className="w-7 h-7 text-red-500 animate-in zoom-in" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-4 gap-4">
             <button className="bg-[#0a0f1e] border border-white/5 p-6 rounded-[1.5rem] text-yellow-500 flex items-center justify-center hover:bg-white/10 transition-all shadow-lg active:scale-95">
                <PhoneCall className="w-7 h-7" />
             </button>
             <button className="bg-[#0a0f1e] border border-white/5 p-6 rounded-[1.5rem] text-blue-500 flex items-center justify-center hover:bg-white/10 transition-all shadow-lg active:scale-95">
                <Users className="w-7 h-7" />
             </button>
             <button className="bg-[#0a0f1e] border border-white/5 p-6 rounded-[1.5rem] text-purple-500 flex items-center justify-center hover:bg-white/10 transition-all shadow-lg active:scale-95">
                <HelpCircle className="w-7 h-7" />
             </button>
             <button 
               onClick={() => {
                 handleGameOver();
                 setGameMode(null);
               }}
               className="bg-red-500/10 border border-red-500/20 p-6 rounded-[1.5rem] text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all shadow-lg active:scale-95"
             >
                <LogOut className="w-7 h-7" />
             </button>
          </div>
       </div>

       {/* Continue Game Modal */}
       {gameState.isGameOver && (
          <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl z-[300] flex items-center justify-center p-6" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
             <div className="bg-[#0a0f1e] border border-white/10 rounded-[4rem] p-10 text-center max-w-md w-full animate-in zoom-in-90 duration-300">
                <MascotIcon mood="angry" size="w-44 h-44" />
                <h2 className="text-4xl font-black mb-6 tracking-tight">{gameMode === 'battle' && battleProgress.ai >= BATTLE_TARGET ? t.aiWon : t.gameOver}</h2>
                
                <div className="bg-red-500/10 p-5 rounded-3xl mb-8 flex justify-between items-center border border-red-500/30">
                   <div className="flex items-center gap-3 text-red-400">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-black text-xs uppercase tracking-widest">{t.penalty}</span>
                   </div>
                   <span className="text-2xl font-mono font-black text-red-500">-{LOSS_PENALTY}</span>
                </div>

                <div className="space-y-4 mb-10">
                  <button 
                    disabled={gameState.revivedWithCoins || gameState.revivedWithAd || totalCoins < REVIVE_COST}
                    onClick={handleReviveWithCoins}
                    className={`w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all font-black text-lg ${(gameState.revivedWithCoins || gameState.revivedWithAd) ? 'bg-slate-800/20 border-slate-700 text-slate-700 grayscale' : 'bg-blue-600/10 border-blue-500/40 text-blue-400 hover:bg-blue-600/20 active:scale-95'}`}
                  >
                    <div className="flex items-center gap-4">
                      <Zap className="w-7 h-7" />
                      <span>{t.continueWithCoins}</span>
                    </div>
                    {(gameState.revivedWithCoins || gameState.revivedWithAd) && <span className="text-[10px] uppercase font-black bg-slate-800 px-3 py-1 rounded-full">{t.reviveUsed}</span>}
                  </button>

                  <button 
                    disabled={gameState.revivedWithAd || gameState.revivedWithCoins}
                    onClick={handleReviveWithAd}
                    className={`w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all font-black text-lg ${(gameState.revivedWithAd || gameState.revivedWithCoins) ? 'bg-slate-800/20 border-slate-700 text-slate-700 grayscale' : 'bg-purple-600/10 border-purple-500/40 text-purple-400 hover:bg-purple-600/20 active:scale-95'}`}
                  >
                    <div className="flex items-center gap-4">
                      <PlayCircle className="w-7 h-7" />
                      <span>{t.continueWithAd}</span>
                    </div>
                    {(gameState.revivedWithAd || gameState.revivedWithCoins) && <span className="text-[10px] uppercase font-black bg-slate-800 px-3 py-1 rounded-full">{t.reviveUsed}</span>}
                  </button>
                </div>

                <div className="bg-slate-800/20 p-6 rounded-[2rem] mb-10 flex justify-between items-center">
                   <span className="text-slate-500 uppercase font-black text-xs tracking-widest">{gameMode === 'battle' ? t.points : t.score}</span>
                   <span className="text-4xl font-mono font-black text-yellow-500 tracking-tighter">{gameMode === 'battle' ? battleProgress.user : gameState.score}</span>
                </div>
                
                <button 
                  onClick={() => {
                    setGameMode(null);
                    setGameState(prev => ({ ...prev, isGameOver: false }));
                  }}
                  className="w-full bg-slate-800 py-6 rounded-[2.5rem] font-black text-xl hover:bg-slate-700 transition-all text-white active:scale-95"
                >
                  {t.returnMenu}
                </button>
             </div>
          </div>
       )}

       {gameState.isGameWon && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[300] flex items-center justify-center p-6" dir={uiLang === 'ar' ? 'rtl' : 'ltr'}>
             <div className="bg-[#0a0f1e] border border-green-500/30 rounded-[4rem] p-12 text-center max-w-md w-full animate-in zoom-in-90 duration-300 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                <div className="relative inline-block mb-10">
                   <Trophy className="w-28 h-28 text-yellow-500 animate-bounce" />
                   <Sparkles className="absolute top-0 right-0 w-8 h-8 text-white animate-pulse" />
                </div>
                <h2 className="text-5xl font-black mb-6 text-green-500 tracking-tighter">{t.victory}</h2>
                <p className="text-slate-400 text-lg mb-10 leading-relaxed">{gameMode === 'battle' ? t.crushedAi : gameMode === 'daily' ? t.dailyRewardWon : t.becameMaster}</p>
                
                <div className="bg-green-500/10 p-8 rounded-[2.5rem] mb-12 flex justify-between items-center border border-green-500/20">
                   <div className="text-right">
                      <span className="text-slate-500 uppercase font-black text-xs tracking-[0.2em]">{t.winnings}</span>
                      <div className="text-4xl font-mono font-black text-yellow-500 tracking-tighter mt-1">
                        {gameMode === 'battle' ? BATTLE_WIN_REWARD : gameMode === 'daily' ? DAILY_QUEST_REWARD.toLocaleString() : '1,000,000'}
                      </div>
                   </div>
                   <Coins className="w-10 h-10 text-yellow-500" />
                </div>

                <button 
                  onClick={() => {
                    setGameMode(null);
                    setGameState(prev => ({ ...prev, isGameWon: false }));
                  }}
                  className="w-full bg-green-600 py-7 rounded-[3rem] font-black text-2xl hover:bg-green-500 transition-all shadow-xl shadow-green-900/20 active:scale-95"
                >
                  {t.claimReward}
                </button>
             </div>
          </div>
       )}
    </div>
  );
};

export default App;
