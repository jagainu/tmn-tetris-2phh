import { TetrominoShape, PieceType, Position, GameState, Difficulty } from '@/types/game';

// テトリミノの形状定義
const TETROMINOS: Record<PieceType, number[][]> = {
  i: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  o: [
    [1, 1],
    [1, 1]
  ],
  t: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  s: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ],
  j: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  l: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ]
};

const PIECE_TYPES: PieceType[] = ['i', 'o', 't', 's', 'z', 'j', 'l'];

// 難易度別設定
const DIFFICULTY_CONFIG = {
  easy: { baseSpeed: 1000, speedIncrease: 50 },
  medium: { baseSpeed: 600, speedIncrease: 80 },
  hard: { baseSpeed: 300, speedIncrease: 100 }
};

export class TetrisGame {
  private grid: (PieceType | null)[][] = [];
  private currentPiece: TetrominoShape | null = null;
  private currentPosition: Position | null = null;
  private nextPiece: TetrominoShape | null = null;
  private score = 0;
  private level = 1;
  private lines = 0;
  private difficulty: Difficulty;
  private isGameOver = false;

  constructor(difficulty: Difficulty = 'medium') {
    this.difficulty = difficulty;
    this.initializeGrid();
    this.spawnNewPiece();
    this.generateNextPiece();
  }

  private initializeGrid(): void {
    this.grid = Array(20).fill(null).map(() => Array(10).fill(null));
  }

  private getRandomPieceType(): PieceType {
    return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  }

  private createPiece(type: PieceType): TetrominoShape {
    return {
      shape: TETROMINOS[type],
      type
    };
  }

  private generateNextPiece(): void {
    const type = this.getRandomPieceType();
    this.nextPiece = this.createPiece(type);
  }

  public spawnNewPiece(): boolean {
    if (this.nextPiece) {
      this.currentPiece = this.nextPiece;
      this.generateNextPiece();
    } else {
      const type = this.getRandomPieceType();
      this.currentPiece = this.createPiece(type);
    }

    this.currentPosition = { x: 3, y: 0 };

    // 新しいピースが配置できるかチェック
    if (this.isCollision(this.currentPiece.shape, this.currentPosition)) {
      this.isGameOver = true;
      return false;
    }

    return true;
  }

  private isCollision(shape: number[][], position: Position): boolean {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = position.x + x;
          const newY = position.y + y;

          // 境界チェック
          if (newX < 0 || newX >= 10 || newY >= 20) {
            return true;
          }

          // グリッドとの衝突チェック
          if (newY >= 0 && this.grid[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public movePieceLeft(): boolean {
    if (!this.currentPiece || !this.currentPosition) return false;

    const newPosition = { ...this.currentPosition, x: this.currentPosition.x - 1 };
    
    if (!this.isCollision(this.currentPiece.shape, newPosition)) {
      this.currentPosition = newPosition;
      return true;
    }
    return false;
  }

  public movePieceRight(): boolean {
    if (!this.currentPiece || !this.currentPosition) return false;

    const newPosition = { ...this.currentPosition, x: this.currentPosition.x + 1 };
    
    if (!this.isCollision(this.currentPiece.shape, newPosition)) {
      this.currentPosition = newPosition;
      return true;
    }
    return false;
  }

  public movePieceDown(): boolean {
    if (!this.currentPiece || !this.currentPosition) return false;

    const newPosition = { ...this.currentPosition, y: this.currentPosition.y + 1 };
    
    if (!this.isCollision(this.currentPiece.shape, newPosition)) {
      this.currentPosition = newPosition;
      return true;
    }
    return false;
  }

  private rotatePieceClockwise(shape: number[][]): number[][] {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = shape[i][j];
      }
    }

    return rotated;
  }

  public rotatePiece(): boolean {
    if (!this.currentPiece || !this.currentPosition) return false;

    const rotatedShape = this.rotatePieceClockwise(this.currentPiece.shape);
    
    if (!this.isCollision(rotatedShape, this.currentPosition)) {
      this.currentPiece.shape = rotatedShape;
      return true;
    }
    return false;
  }

  public dropPiece(): boolean {
    if (!this.currentPiece || !this.currentPosition) return false;

    while (this.movePieceDown()) {
      // 落下し続ける
    }
    return true;
  }

  public placePiece(): boolean {
    if (!this.currentPiece || !this.currentPosition) return false;

    // 現在のピースをグリッドに配置
    this.currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell && this.currentPosition) {
          const gridY = this.currentPosition.y + y;
          const gridX = this.currentPosition.x + x;
          if (gridY >= 0 && gridY < 20 && gridX >= 0 && gridX < 10) {
            this.grid[gridY][gridX] = this.currentPiece!.type;
          }
        }
      });
    });

    return true;
  }

  public clearLines(): number {
    let linesCleared = 0;
    
    for (let y = this.grid.length - 1; y >= 0; y--) {
      if (this.grid[y].every(cell => cell !== null)) {
        // ラインが完成している
        this.grid.splice(y, 1);
        this.grid.unshift(Array(10).fill(null));
        linesCleared++;
        y++; // 同じ行を再チェック
      }
    }

    this.lines += linesCleared;
    
    // レベルアップ判定
    const newLevel = Math.floor(this.lines / 10) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
    }

    return linesCleared;
  }

  public addScore(linesCleared: number): void {
    const baseScore = [0, 40, 100, 300, 1200];
    if (linesCleared > 0 && linesCleared <= 4) {
      this.score += baseScore[linesCleared] * this.level;
    }
  }

  public getDropSpeed(): number {
    const config = DIFFICULTY_CONFIG[this.difficulty];
    const speed = Math.max(50, config.baseSpeed - (this.level - 1) * config.speedIncrease);
    return speed;
  }

  public getState(): GameState {
    return {
      grid: this.grid.map(row => [...row]),
      currentPiece: this.currentPiece ? { 
        shape: this.currentPiece.shape.map(row => [...row]), 
        type: this.currentPiece.type 
      } : null,
      currentPosition: this.currentPosition ? { ...this.currentPosition } : null,
      nextPiece: this.nextPiece ? { 
        shape: this.nextPiece.shape.map(row => [...row]), 
        type: this.nextPiece.type 
      } : null,
      score: this.score,
      level: this.level,
      lines: this.lines,
      isGameOver: this.isGameOver
    };
  }
}