'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Pause, Play, Home, RotateCw } from 'lucide-react';
import { Difficulty } from '@/types/game';
import { saveScore } from '@/lib/storage';
import { TetrisGame, GameState } from '@/lib/tetris';
import clsx from 'clsx';

export default function GamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const difficulty = (searchParams.get('difficulty') as Difficulty) || 'medium';
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const gameRef = useRef<TetrisGame | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);

  // Initialize game
  useEffect(() => {
    const game = new TetrisGame(difficulty);
    gameRef.current = game;
    
    game.onStateChange((state) => {
      setGameState(state);
    });
    
    game.onGameOver((finalScore) => {
      setShowGameOver(true);
      // Save score
      saveScore({
        score: finalScore,
        level: gameState?.level || 1,
        lines: gameState?.lines || 0,
        date: new Date().toISOString(),
        difficulty,
      });
    });
    
    setGameState(game.getState());
    
    return () => {
      game.destroy();
    };
  }, [difficulty]);

  // Handle keyboard input
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!gameRef.current || !isGameStarted) return;
    
    switch (event.code) {
      case 'ArrowLeft':
        gameRef.current.moveLeft();
        break;
      case 'ArrowRight':
        gameRef.current.moveRight();
        break;
      case 'ArrowDown':
        gameRef.current.moveDown();
        break;
      case 'ArrowUp':
        gameRef.current.rotate();
        break;
      case 'Space':
        event.preventDefault();
        gameRef.current.hardDrop();
        break;
      case 'KeyP':
        togglePause();
        break;
    }
  }, [isGameStarted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const startGame = () => {
    gameRef.current?.start();
    setIsGameStarted(true);
  };

  const togglePause = () => {
    if (!gameRef.current) return;
    
    if (gameState?.isPaused) {
      gameRef.current.resume();
    } else {
      gameRef.current.pause();
    }
  };

  const resetGame = () => {
    gameRef.current?.reset();
    setIsGameStarted(false);
    setShowGameOver(false);
  };

  const renderBoard = () => {
    if (!gameState) return null;
    
    const board = [...gameState.board];
    
    // Add current piece to display
    if (gameState.currentPiece) {
      const { shape, position } = gameState.currentPiece;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const boardY = position.y + y;
            const boardX = position.x + x;
            if (boardY >= 0 && boardY < 20 && boardX >= 0 && boardX < 10) {
              board[boardY] = [...board[boardY]];
              board[boardY][boardX] = gameState.currentPiece.type;
            }
          }
        }
      }
    }
    
    return (
      <div className="grid grid-cols-10 gap-0.5 bg-slate-900 p-2 rounded-lg border-2 border-slate-600">
        {board.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={clsx(
                'w-6 h-6 rounded-sm border border-slate-700',
                {
                  'bg-slate-800': cell === 0,
                  'bg-cyan-500': cell === 1,
                  'bg-yellow-500': cell === 2,
                  'bg-purple-500': cell === 3,
                  'bg-green-500': cell === 4,
                  'bg-red-500': cell === 5,
                  'bg-blue-500': cell === 6,
                  'bg-orange-500': cell === 7,
                }
              ))
            />
          ))
        )}
      </div>
    );
  };

  const renderNextPiece = () => {
    if (!gameState?.nextPiece) return null;
    
    const { shape } = gameState.nextPiece;
    
    return (
      <div className="bg-slate-800 p-4 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Next</h3>
        <div className="grid gap-0.5">
          {shape.map((row, y) => (
            <div key={y} className="flex gap-0.5">
              {row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className={clsx(
                    'w-4 h-4 rounded-sm',
                    cell ? 'bg-white' : 'bg-slate-700'
                  )}
                />
              ))}
            </div>
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">TETRIS</h1>
          <p className="text-gray-400 capitalize">難易度: {difficulty}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls & Info */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">操作</h3>
              <div className="space-y-2 text-sm">
                <div>← → : 移動</div>
                <div>↓ : 高速落下</div>
                <div>↑ : 回転</div>
                <div>Space : 瞬間落下</div>
                <div>P : 一時停止</div>
              </div>
            </div>
            
            {renderNextPiece()}
            
            <div className="space-y-2">
              <Link
                href="/"
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                ホームに戻る
              </Link>
            </div>
          </div>

          {/* Center - Game Board */}
          <div className="flex flex-col items-center">
            {renderBoard()}
            
            <div className="mt-4 space-x-2">
              {!isGameStarted ? (
                <button
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  スタート
                </button>
              ) : (
                <>
                  <button
                    onClick={togglePause}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {gameState.isPaused ? (
                      <><Play className="w-4 h-4" /> 再開</>
                    ) : (
                      <><Pause className="w-4 h-4" /> 一時停止</>
                    )}
                  </button>
                  <button
                    onClick={resetGame}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RotateCw className="w-4 h-4" />
                    リセット
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Panel - Stats */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">スコア</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>得点</span>
                  <span className="font-mono">{gameState.score.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>レベル</span>
                  <span className="font-mono">{gameState.level}</span>
                </div>
                <div className="flex justify-between">
                  <span>ライン</span>
                  <span className="font-mono">{gameState.lines}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {showGameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-xl border border-slate-600 text-center max-w-md w-full mx-4">
            <h2 className="text-3xl font-bold mb-4">ゲームオーバー</h2>
            <div className="space-y-2 mb-6">
              <div className="text-xl">最終スコア: {gameState.score.toLocaleString()}</div>
              <div>レベル: {gameState.level}</div>
              <div>ライン: {gameState.lines}</div>
            </div>
            <div className="space-x-4">
              <button
                onClick={resetGame}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                もう一度
              </button>
              <Link
                href="/"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors inline-block"
              >
                ホーム
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}