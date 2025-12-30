
import { LanguageOption, LeaderboardEntry } from './types';

export const COINS_KEY = 'code_quest_total_coins_v1';
export const LEADERBOARD_KEY = 'code_quest_leaderboard_v5';
export const DAILY_CHALLENGE_KEY = 'code_quest_daily_challenge_date';
export const DAILY_BONUS_AMOUNT = 25000;

export const LANGUAGES: {id: string, name: string, description: string}[] = [
  { id: 'javascript', name: 'JAVASCRIPT', description: 'لغة الويب الأكثر شهرة وقوة' },
  { id: 'python', name: 'PYTHON', description: 'لغة الذكاء الاصطناعي وعلم البيانات' },
  { id: 'java', name: 'JAVA', description: 'لغة تطبيقات الأندرويد والأنظمة' },
  { id: 'cpp', name: 'C++', description: 'لغة الأنظمة والألعاب عالية الأداء' },
  { id: 'typescript', name: 'TYPESCRIPT', description: 'النسخة المطورة والآمنة من جافا سكريبت' },
  { id: 'php', name: 'PHP', description: 'لغة تطوير المواقع وقواعد البيانات' },
];

export const PRIZE_LADDER = [
  '100', '200', '300', '500', '1,000',
  '2,000', '4,000', '8,000', '16,000', '32,000',
  '64,000', '125,000', '250,000', '500,000', '1,000,000'
];

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
