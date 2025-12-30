'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, Play, Settings } from 'lucide-react';
import { GameScore, Difficulty } from '@/types/game';
import { getHighScores } from '@/lib/storage';

export default function HomePage() {
  const [highScores, setHighScores] = useState<Record<Difficulty, GameScore[]>>(
    {} as Record<Difficulty, GameScore[]>
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const scores = getHighScores();
      setHighScores(scores);
      setIsLoaded(true);
    }
  }, []);

  const difficulties: { value: Difficulty; label: string; description: string }[] = [
    { value: 'easy', label: 'イージー', description: '初心者向け - ゆっくりとした落下速度' },
    { value: 'medium', label: 'ミディアム', description: '標準 - バランスの取れた難易度' },
    { value: 'hard', label: 'ハード', description: '上級者向け - 高速な落下速度' },
  ];

  const formatScore = (score: number) => {
    return score.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            TETRIS
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            ブロックを操り、ラインを消去して高得点を目指そう！
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ゲーム開始セクション */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              ゲーム設定
            </h2>

            {/* 難易度選択 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">難易度を選択</h3>
              <div className="space-y-3">
                {difficulties.map(({ value, label, description }) => (
                  <label
                    key={value}
                    className={`block p-4 rounded-lg border cursor-pointer transition-all hover:bg-slate-700/50 ${
                      selectedDifficulty === value
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={value}
                      checked={selectedDifficulty === value}
                      onChange={(e) => setSelectedDifficulty(e.target.value as Difficulty)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{label}</div>
                        <div className="text-sm text-gray-400">{description}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedDifficulty === value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-400'
                      }`} />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* ゲーム開始ボタン */}
            <Link
              href={`/game?difficulty=${selectedDifficulty}`}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-lg"
            >
              <Play className="w-6 h-6" />
              ゲームスタート
            </Link>
          </div>

          {/* ハイスコアセクション */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              ハイスコア
            </h2>

            <div className="space-y-6">
              {difficulties.map(({ value, label }) => {
                const scores = highScores[value] || [];
                return (
                  <div key={value} className="">
                    <h3 className="text-lg font-semibold mb-3 text-gray-200">
                      {label}
                    </h3>
                    <div className="space-y-2">
                      {scores.length > 0 ? (
                        scores.slice(0, 5).map((score, index) => (
                          <div
                            key={index}
                            className={`flex justify-between items-center p-3 rounded-lg ${
                              index === 0
                                ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border border-yellow-600/30'
                                : 'bg-slate-700/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-bold text-lg ${
                                index === 0 ? 'text-yellow-400' : 'text-gray-300'
                              }`}>
                                #{index + 1}
                              </span>
                              <span className="font-mono text-lg text-white">
                                {formatScore(score.score)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-400">
                              {formatDate(score.date)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-center py-4">
                          記録なし
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 操作説明 */}
        <div className="mt-8 bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4">操作方法</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="bg-slate-700 rounded p-2 mb-2">←→</div>
              <div>左右移動</div>
            </div>
            <div className="text-center">
              <div className="bg-slate-700 rounded p-2 mb-2">↓</div>
              <div>高速落下</div>
            </div>
            <div className="text-center">
              <div className="bg-slate-700 rounded p-2 mb-2">↑</div>
              <div>回転</div>
            </div>
            <div className="text-center">
              <div className="bg-slate-700 rounded p-2 mb-2">Space</div>
              <div>瞬間落下</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}