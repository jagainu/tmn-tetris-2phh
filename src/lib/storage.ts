import { GameScore, Difficulty } from '@/types/game';

const STORAGE_KEY = 'tetris-high-scores';
const MAX_SCORES = 10;

export function getHighScores(): Record<Difficulty, GameScore[]> {
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

export function saveScore(score: GameScore): void {
  if (typeof window === 'undefined') return;

  try {
    const scores = getHighScores();
    const difficultyScores = scores[score.difficulty] || [];
    
    difficultyScores.push(score);
    difficultyScores.sort((a, b) => b.score - a.score);
    difficultyScores.splice(MAX_SCORES);
    
    scores[score.difficulty] = difficultyScores;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch (error) {
    console.error('Failed to save score:', error);
  }
}

export function isHighScore(score: number, difficulty: Difficulty): boolean {
  const scores = getHighScores();
  const difficultyScores = scores[difficulty] || [];
  
  return difficultyScores.length < MAX_SCORES || 
         score > (difficultyScores[difficultyScores.length - 1]?.score || 0);
}