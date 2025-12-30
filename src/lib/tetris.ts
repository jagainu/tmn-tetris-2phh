import { GameState, Piece, Position, Difficulty, DifficultyConfig } from '@/types/game';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const PIECES = [
  // I piece
  [[[1, 1, 1, 1]]], 
  // O piece
  [[[1, 1], [1, 1]]],
  // T piece
  [[[0, 1, 0], [1, 1, 1]], [[1, 0], [1, 1], [1, 0]], [[1, 1, 1], [0, 1, 0]], [[0, 1], [1, 1], [0, 1]]],
  // S piece
  [[[0, 1, 1], [1, 1, 0]], [[1, 0], [1, 1], [0, 1]]],
  // Z piece
  [[[1, 1, 0], [0, 1, 1]], [[0, 1], [1, 1], [1, 0]]],
  // J piece
  [[[1, 0, 0], [1, 1, 1]], [[1, 1], [1, 0], [1, 0]], [[1, 1, 1], [0, 0, 1]], [[0, 1], [0, 1], [1, 1]]],
  // L piece
  [[[0, 0, 1], [1, 1, 1]], [[1, 0], [1, 0], [1, 1]], [[1, 1, 1], [1, 0, 0]], [[1, 1], [0, 1], [0, 1]]],
];

const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: { dropInterval: 800, levelUpLines: 10, scoreMultiplier: 1 },
  medium: { dropInterval: 500, levelUpLines: 8, scoreMultiplier: 1.5 },
  hard: { dropInterval: 300, levelUpLines: 6, scoreMultiplier: 2 },
};

export class TetrisGame {
  private state: GameState;
  private difficulty: Difficulty;
  private config: DifficultyConfig;
  private dropTimer: NodeJS.Timeout | null = null;
  private lastDropTime = 0;
  private callbacks: {
    onStateChange?: (state: GameState) => void;
    onGameOver?: (finalScore: number) => void;
  } = {};

  constructor(difficulty: Difficulty = 'medium') {
    this.difficulty = difficulty;
    this.config = DIFFICULTY_CONFIGS[difficulty];
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)),
      currentPiece: this.generatePiece(),
      nextPiece: this.generatePiece(),
      score: 0,
      level: 1,
      lines: 0,
      isGameOver: false,
      isPaused: false,
    };
  }

  private generatePiece(): Piece {
    const type = Math.floor(Math.random() * PIECES.length);
    const rotations = PIECES[type];
    return {
      shape: rotations[0],
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      type: type + 1,
    };
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public start(): void {
    this.state.isPaused = false;
    this.startDropTimer();
  }

  public pause(): void {
    this.state.isPaused = true;
    if (this.dropTimer) {
      clearInterval(this.dropTimer);
      this.dropTimer = null;
    }
    this.notifyStateChange();
  }

  public resume(): void {
    if (this.state.isGameOver) return;
    this.state.isPaused = false;
    this.startDropTimer();
    this.notifyStateChange();
  }

  public reset(): void {
    if (this.dropTimer) {
      clearInterval(this.dropTimer);
      this.dropTimer = null;
    }
    this.state = this.createInitialState();
    this.notifyStateChange();
  }

  public moveLeft(): void {
    if (this.canMove(-1, 0)) {
      this.state.currentPiece!.position.x -= 1;
      this.notifyStateChange();
    }
  }

  public moveRight(): void {
    if (this.canMove(1, 0)) {
      this.state.currentPiece!.position.x += 1;
      this.notifyStateChange();
    }
  }

  public moveDown(): void {
    if (this.canMove(0, 1)) {
      this.state.currentPiece!.position.y += 1;
      this.notifyStateChange();
    } else {
      this.placePiece();
    }
  }

  public hardDrop(): void {
    while (this.canMove(0, 1)) {
      this.state.currentPiece!.position.y += 1;
    }
    this.placePiece();
    this.notifyStateChange();
  }

  public rotate(): void {
    // Simplified rotation logic
    this.notifyStateChange();
  }

  private canMove(dx: number, dy: number): boolean {
    if (!this.state.currentPiece) return false;
    
    const { shape, position } = this.state.currentPiece;
    const newX = position.x + dx;
    const newY = position.y + dy;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;
          
          if (boardX < 0 || boardX >= BOARD_WIDTH || 
              boardY >= BOARD_HEIGHT || 
              (boardY >= 0 && this.state.board[boardY][boardX])) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private placePiece(): void {
    if (!this.state.currentPiece) return;
    
    const { shape, position } = this.state.currentPiece;
    
    // Place piece on board
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0) {
            this.state.board[boardY][boardX] = this.state.currentPiece!.type;
          }
        }
      }
    }
    
    // Clear lines
    this.clearLines();
    
    // Generate next piece
    this.state.currentPiece = this.state.nextPiece;
    this.state.nextPiece = this.generatePiece();
    
    // Check game over
    if (!this.canMove(0, 0)) {
      this.gameOver();
    }
  }

  private clearLines(): void {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.state.board[y].every(cell => cell !== 0)) {
        this.state.board.splice(y, 1);
        this.state.board.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        y++; // Check the same row again
      }
    }
    
    if (linesCleared > 0) {
      this.state.lines += linesCleared;
      this.state.score += this.calculateScore(linesCleared);
      this.state.level = Math.floor(this.state.lines / this.config.levelUpLines) + 1;
    }
  }

  private calculateScore(lines: number): number {
    const baseScore = [0, 40, 100, 300, 1200][lines] || 0;
    return Math.floor(baseScore * this.state.level * this.config.scoreMultiplier);
  }

  private startDropTimer(): void {
    if (this.dropTimer) {
      clearInterval(this.dropTimer);
    }
    
    const interval = Math.max(50, this.config.dropInterval - (this.state.level - 1) * 50);
    
    this.dropTimer = setInterval(() => {
      if (!this.state.isPaused && !this.state.isGameOver) {
        this.moveDown();
      }
    }, interval);
  }

  private gameOver(): void {
    this.state.isGameOver = true;
    if (this.dropTimer) {
      clearInterval(this.dropTimer);
      this.dropTimer = null;
    }
    this.notifyStateChange();
    this.callbacks.onGameOver?.(this.state.score);
  }

  public onStateChange(callback: (state: GameState) => void): void {
    this.callbacks.onStateChange = callback;
  }

  public onGameOver(callback: (finalScore: number) => void): void {
    this.callbacks.onGameOver = callback;
  }

  private notifyStateChange(): void {
    this.callbacks.onStateChange?.(this.getState());
  }

  public destroy(): void {
    if (this.dropTimer) {
      clearInterval(this.dropTimer);
      this.dropTimer = null;
    }
  }
}

export { GameState };