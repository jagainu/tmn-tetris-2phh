import { GameScore, Difficulty } from '@/types/game';

const STORAGE_KEY = 'tetris-high-scores';

type HighScores = Record<Difficulty, GameScore[]>;

export function getHighScores(): HighScores {
  if (typeof window === 'undefined') {
    return { easy: [], medium: [], hard: [] };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load high scores:', error);
  }

  return { easy: [], medium: [], hard: [] };
}

export function saveScore(difficulty: Difficulty, score: number): void {
  if (typeof window === 'undefined') return;

  const highScores = getHighScores();
  
  const newScore: GameScore = {
    difficulty,
    score,
    date: new Date().toISOString(),
  };

  // 該当する難易度のスコア配列に追加
  if (!highScores[difficulty]) {
    highScores[difficulty] = [];
  }
  
  highScores[difficulty].push(newScore);
  
  // スコアの高い順でソート
  highScores[difficulty].sort((a, b) => b.score - a.score);
  
  // 上位10件のみ保持
  highScores[difficulty] = highScores[difficulty].slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(highScores));
  } catch (error) {
    console.error('Failed to save high score:', error);
  }
}

export function clearHighScores(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear high scores:', error);
  }
}