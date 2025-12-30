import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tetris Game - テトリス',
  description: 'クラシックテトリスゲーム。ブロックを回転・移動させて、ラインを消去し、高得点を目指そう！',
  keywords: ['tetris', 'game', 'puzzle', 'block', 'テトリス', 'ゲーム'],
  authors: [{ name: 'TMN Tetris' }],
  openGraph: {
    title: 'Tetris Game - テトリス',
    description: 'クラシックテトリスゲーム',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="h-full">
      <body className={`${inter.className} h-full bg-gradient-to-br from-slate-900 to-slate-800 text-white`}>
        <div className="min-h-full">
          {children}
        </div>
      </body>
    </html>
  )
}