
export enum Difficulty {
  Beginner = 1,
  Intermediate = 2,
  Advanced = 3,
  Expert = 4,
  Master = 5
}

export interface Question {
  id: string;
  text: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  scoreFormatted: string;
  language: string;
  date: string;
}

export interface GameState {
  currentLanguage: string | null;
  currentStage: number; 
  currentQuestionIndex: number; 
  score: string;
  timeLeft: number;
  isGameOver: boolean;
  isGameWon: boolean;
  withdrawn: boolean;
  lifelines: {
    fiftyFifty: boolean;
    askAudience: boolean;
    expertCall: boolean;
  };
  revivedWithCoins?: boolean;
  revivedWithAd?: boolean;
}

export interface LanguageOption {
  id: string;
  name: string;
  description: string;
}

export type MultiplayerStatus = 'idle' | 'creating' | 'joining' | 'lobby' | 'battle' | 'results';

export interface OpponentData {
  name: string;
  currentIdx: number;
  score: number;
  totalScore: number;
  isCorrect?: boolean;
}
