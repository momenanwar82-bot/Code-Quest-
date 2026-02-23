
import { LanguageOption, LeaderboardEntry, Difficulty } from './types';

export const COINS_KEY = 'code_quest_total_coins_v1';
export const LEADERBOARD_KEY = 'code_quest_leaderboard_v5';
export const DAILY_CHALLENGE_KEY = 'code_quest_daily_challenge_date';
export const DAILY_BONUS_AMOUNT = 25000;
export const DAILY_REWARDS_KEY = 'code_quest_daily_rewards_v1';

export const REWARD_SCHEDULE = [
  { day: 1, amount: 5000, type: 'coins' },
  { day: 2, amount: 10000, type: 'coins' },
  { day: 3, amount: 15000, type: 'coins' },
  { day: 4, amount: 25000, type: 'coins' },
  { day: 5, amount: 40000, type: 'coins' },
  { day: 6, amount: 60000, type: 'coins' },
  { day: 7, amount: 100000, type: 'coins' },
];

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
    '10', '20', '50', '100', '150', '250', '400', '600', '800', '1,000', '1,500', '2,000', '3,000', '4,000', '5,000'
  ],
  [Difficulty.Intermediate]: [
    '50', '100', '250', '500', '1,000', '2,000', '4,000', '7,000', '10,000', '15,000', '20,000', '25,000', '30,000', '40,000', '50,000'
  ],
  [Difficulty.Advanced]: [
    '500', '1,000', '2,500', '5,000', '10,000', '15,000', '25,000', '40,000', '60,000', '80,000', '100,000', '130,000', '160,000', '200,000', '250,000'
  ],
  [Difficulty.Expert]: [
    '1,000', '2,500', '5,000', '10,000', '20,000', '40,000', '70,000', '100,000', '150,000', '200,000', '250,000', '300,000', '350,000', '400,000', '500,000'
  ],
  [Difficulty.Master]: [
    '5,000', '10,000', '20,000', '40,000', '60,000', '80,000', '100,000', '150,000', '200,000', '300,000', '450,000', '600,000', '750,000', '900,000', '1,000,000'
  ]
};

export const PRIZE_LADDER = PRIZE_LADDERS[Difficulty.Master];

export const INITIAL_MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'احمد_المبرمج', score: 1000000, language: 'Python', date: '2024-05-10', scoreFormatted: '1,000,000' },
  { name: 'Sara_Dev', score: 950000, language: 'JavaScript', date: '2024-05-11', scoreFormatted: '950,000' },
  { name: 'خالد_كود', score: 800000, language: 'C++', date: '2024-05-12', scoreFormatted: '800,000' },
  { name: 'Noor_Tech', score: 750000, language: 'TypeScript', date: '2024-05-12', scoreFormatted: '750,000' },
  { name: 'عمر_باشا', score: 600000, language: 'Java', date: '2024-05-13', scoreFormatted: '600,000' },
];

export const FAKE_NAMES = [
  'يوسف_كودر', 'مريم_الذكية', 'بايثون_كينج', 'جافا_كوين', 'عبقري_الويب',
  'CodeNinja', 'BitCracker', 'LogicMaster', 'KernelPanic', 'NullPointer'
];
