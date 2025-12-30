export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameScore {
  difficulty: Difficulty;
  score: number;
  date: string;
}

export type PieceType = 'i' | 'o' | 't' | 's' | 'z' | 'j' | 'l';

export interface TetrominoShape {
  shape: number[][];
  type: PieceType;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  grid: (PieceType | null)[][];
  currentPiece: TetrominoShape | null;
  currentPosition: Position | null;
  nextPiece: TetrominoShape | null;
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
}