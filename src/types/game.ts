export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameScore {
  score: number;
  level: number;
  lines: number;
  date: string;
  difficulty: Difficulty;
}

export interface GameState {
  board: number[][];
  currentPiece: Piece | null;
  nextPiece: Piece | null;
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  shape: number[][];
  position: Position;
  type: number;
}

export interface DifficultyConfig {
  dropInterval: number;
  levelUpLines: number;
  scoreMultiplier: number;
}