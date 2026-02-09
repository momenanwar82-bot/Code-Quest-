
import { LanguageOption, LeaderboardEntry, Difficulty } from './types';

export const COINS_KEY = 'code_quest_total_coins_v1';
export const LEADERBOARD_KEY = 'code_quest_leaderboard_v5';
export const DAILY_CHALLENGE_KEY = 'code_quest_daily_challenge_date';
export const DAILY_BONUS_AMOUNT = 25000;

export const LANGUAGES: {id: string, name: string}[] = [
  { id: 'javascript', name: 'JAVASCRIPT' },
  { id: 'python', name: 'PYTHON' },
  { id: 'java', name: 'JAVA' },
  { id: 'cpp', name: 'C++' },
  { id: 'typescript', name: 'TYPESCRIPT' },
  { id: 'php', name: 'PHP' },
];

export const PRIZE_LADDERS: Record<Difficulty, string[]> = {
  [Difficulty.Beginner]: [
    '10', '20', '30', '50', '80', '120', '180', '250', '350', '450', '600', '700', '800', '900', '1,000'
  ],
  [Difficulty.Intermediate]: [
    '50', '100', '200', '400', '800', '1,500', '3,000', '5,000', '8,000', '12,000', '18,000', '25,000', '35,000', '45,000', '50,000'
  ],
  [Difficulty.Advanced]: [
    '100', '200', '500', '1,000', '2,000', '5,000', '10,000', '20,000', '35,000', '50,000', '75,000', '100,000', '150,000', '200,000', '250,000'
  ],
  [Difficulty.Expert]: [
    '200', '500', '1,000', '2,500', '5,000', '10,000', '25,000', '50,000', '75,000', '100,000', '150,000', '200,000', '300,000', '400,000', '500,000'
  ],
  [Difficulty.Master]: [
    '100', '200', '300', '500', '1,000', '2,000', '4,000', '8,000', '16,000', '32,000', '64,000', '125,000', '250,000', '500,000', '1,000,000'
  ]
};

export const PRIZE_LADDER = PRIZE_LADDERS[Difficulty.Master];

export const INITIAL_MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'احمد_المبرمج', score: 1000000, language: 'Python', date: '2024-05-10', scoreFormatted: '1,000,000' },
  { name: 'Sara_Dev', score: 950000, language: 'JavaScript', date: '2024-05-11', scoreFormatted: '950,000' },
  { name: 'خالد_كود', score: 800000, language: 'C++', date: '2024-05-12', scoreFormatted: '800,000' },
  { name: 'Noor_Tech', score: 750000, language: 'TypeScript', date: '2024-05-12', scoreFormatted: '750,000' },
  { name: 'عمر_باشا', score: 600000, language: 'Java', date: '2024-05-13', scoreFormatted: '600,000' },
  { name: 'Dev_Master', score: 500000, language: 'PHP', date: '2024-05-13', scoreFormatted: '500,000' },
  { name: 'ليلى_جيك', score: 450000, language: 'Python', date: '2024-05-14', scoreFormatted: '450,000' },
  { name: 'يوسف_كودر', score: 400000, language: 'Swift', date: '2024-05-14', scoreFormatted: '400,000' },
  { name: 'مريم_الذكية', score: 350000, language: 'Ruby', date: '2024-05-14', scoreFormatted: '350,000' },
  { name: 'بايثون_كينج', score: 300000, language: 'Rust', date: '2024-05-14', scoreFormatted: '300,000' },
];

export const FAKE_NAMES = [
  'يوسف_كودر', 'مريم_الذكية', 'بايثون_كينج', 'جافا_كوين', 'عبقري_الويب',
  'CodeNinja', 'BitCracker', 'LogicMaster', 'KernelPanic', 'NullPointer',
  'عبدالله_ديف', 'هند_تيك', 'سوبر_مبرمج', 'سبيس_كود', 'تيك_تايم',
  'نظام_الاختراق', 'محترف_كود', 'المعلم_التقني', 'بنت_بايثون', 'فتى_السي_بلس',
  'CyberGhost', 'DeepMind', 'PixelWar', 'DataLord', 'CloudRunner'
];
