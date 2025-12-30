'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pause, Play, Home, RotateCcw } from 'lucide-react';
import { Difficulty } from '@/types/game';
import { saveScore } from '@/lib/storage';
import { TetrisGame, GameState } from '@/lib/tetris';
import clsx from 'clsx';

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const difficulty = (searchParams.get('difficulty') as Difficulty) || 'medium';
  
  const [game, setGame] = useState<TetrisGame | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const requestRef = useRef<number | null>(null);

  // ゲームの初期化
  useEffect(() => {
    const tetrisGame = new TetrisGame(difficulty);
    setGame(tetrisGame);
    setGameState(tetrisGame.getState());
  }, [difficulty]);

  // ゲームループ
  const gameLoop = useCallback(() => {
    if (!game || isPaused || isGameOver) return;

    const moved = game.movePieceDown();
    if (!moved) {
      if (game.placePiece()) {
        const linesCleared = game.clearLines();
        if (linesCleared > 0) {
          game.addScore(linesCleared);
        }
        if (game.spawnNewPiece()) {
          setGameState({ ...game.getState() });
        } else {
          // ゲームオーバー
          setIsGameOver(true);
          const finalScore = game.getState().score;
          saveScore(difficulty, finalScore);
        }
      }
    }
    setGameState({ ...game.getState() });
  }, [game, isPaused, isGameOver, difficulty]);

  // ゲームループの開始/停止
  useEffect(() => {
    if (game && !isPaused && !isGameOver) {
      const speed = game.getDropSpeed();
      gameLoopRef.current = setInterval(gameLoop, speed);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [game, gameLoop, isPaused, isGameOver]);

  // キーボード操作
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!game || isPaused || isGameOver) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          game.movePieceLeft();
          setGameState({ ...game.getState() });
          break;
        case 'ArrowRight':
          event.preventDefault();
          game.movePieceRight();
          setGameState({ ...game.getState() });
          break;
        case 'ArrowDown':
          event.preventDefault();
          game.movePieceDown();
          setGameState({ ...game.getState() });
          break;
        case 'ArrowUp':
          event.preventDefault();
          game.rotatePiece();
          setGameState({ ...game.getState() });
          break;
        case ' ':
          event.preventDefault();
          game.dropPiece();
          setGameState({ ...game.getState() });
          break;
        case 'Escape':
          event.preventDefault();
          handleTogglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [game, isPaused, isGameOver]);

  const handleTogglePause = () => {
    if (isGameOver) return;
    setIsPaused(!isPaused);
  };

  const handleRestart = () => {
    setIsGameOver(false);
    setIsPaused(false);
    const newGame = new TetrisGame(difficulty);
    setGame(newGame);
    setGameState(newGame.getState());
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const getDifficultyLabel = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'easy': return 'イージー';
      case 'medium': return 'ミディアム';
      case 'hard': return 'ハード';
    }
  };

  const renderGrid = () => {
    if (!gameState) return null;

    const { grid, currentPiece, currentPosition } = gameState;
    const displayGrid = grid.map(row => [...row]);

    // 現在のピースを描画
    if (currentPiece && currentPosition) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const gridY = currentPosition.y + y;
            const gridX = currentPosition.x + x;
            if (gridY >= 0 && gridY < 20 && gridX >= 0 && gridX < 10) {
              displayGrid[gridY][gridX] = currentPiece.type;
            }
          }
        });
      });
    }

    return (
      <div className="tetris-grid" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
        {displayGrid.flat().map((cell, index) => (
          <div
            key={index}
            className={clsx(
              'tetris-cell',
              cell && 'filled',
              cell && `piece-${cell}`
            )}
          />
        ))}
      </div>
    );
  };

  const renderNextPiece = () => {
    if (!gameState?.nextPiece) return null;

    const { shape, type } = gameState.nextPiece;
    return (
      <div className="bg-slate-800 rounded p-2">
        <h3 className="text-sm font-bold mb-2">Next</h3>
        <div 
          className="grid gap-px"
          style={{ gridTemplateColumns: `repeat(${shape[0].length}, 1fr)` }}
        >
          {shape.flat().map((cell, index) => (
            <div
              key={index}
              className={clsx(
                'w-4 h-4',
                cell ? `piece-${type}` : 'bg-slate-900'
              )}
            />
          ))}
        </div>
      </div>
    );
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-8 p-4">
      {/* メインゲームエリア */}
      <div className="flex flex-col items-center">
        {/* ゲーム情報 */}
        <div className="flex items-center justify-between w-full max-w-sm mb-4">
          <div className="text-center">
            <div className="text-sm text-gray-400">難易度</div>
            <div className="font-bold">{getDifficultyLabel(difficulty)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">スコア</div>
            <div className="font-bold text-xl">{gameState.score.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">レベル</div>
            <div className="font-bold">{gameState.level}</div>
          </div>
        </div>

        {/* ゲームグリッド */}
        <div className="relative">
          {renderGrid()}
          
          {/* ゲームオーバー/ポーズオーバーレイ */}
          {(isPaused || isGameOver) && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
              {isPaused && (
                <div className="text-center">
                  <Pause className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                  <h2 className="text-2xl font-bold mb-2">ポーズ中</h2>
                  <p className="text-gray-300">Escキーで再開</p>
                </div>
              )}
              {isGameOver && (
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4 text-red-400">GAME OVER</h2>
                  <p className="text-xl mb-2">最終スコア: {gameState.score.toLocaleString()}</p>
                  <p className="text-gray-300 mb-6">スコアが保存されました</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* コントロールボタン */}
        <div className="flex gap-4 mt-4">
          {!isGameOver && (
            <button
              onClick={handleTogglePause}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-bold transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? '再開' : 'ポーズ'}
            </button>
          )}
          {isGameOver && (
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              再ゲーム
            </button>
          )}
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-bold transition-colors"
          >
            <Home className="w-4 h-4" />
            ホーム
          </button>
        </div>
      </div>

      {/* サイドパネル */}
      <div className="flex flex-row lg:flex-col gap-4">
        {/* Next Piece */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
          {renderNextPiece()}
        </div>

        {/* ゲーム統計 */}
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm font-bold mb-3">統計</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">ライン</span>
              <span className="font-mono">{gameState.lines}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">レベル</span>
              <span className="font-mono">{gameState.level}</span>
            </div>
          </div>
        </div>

        {/* モバイル操作ボタン */}
        <div className="lg:hidden bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm font-bold mb-3">操作</h3>
          <div className="grid grid-cols-3 gap-2">
            <div></div>
            <button 
              className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-sm"
              onClick={() => game?.rotatePiece()}
            >
              ↻
            </button>
            <div></div>
            <button 
              className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-sm"
              onClick={() => game?.movePieceLeft()}
            >
              ←
            </button>
            <button 
              className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-sm"
              onClick={() => game?.movePieceDown()}
            >
              ↓
            </button>
            <button 
              className="bg-slate-700 hover:bg-slate-600 p-2 rounded text-sm"
              onClick={() => game?.movePieceRight()}
            >
              →
            </button>
          </div>
          <button 
            className="w-full bg-red-600 hover:bg-red-700 p-2 rounded text-sm mt-2"
            onClick={() => game?.dropPiece()}
          >
            DROP
          </button>
        </div>
      </div>
    </div>
  );
}