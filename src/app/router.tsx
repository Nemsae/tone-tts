import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages/home'
import { PlayPage } from '@/pages/play'
import { GameOverPage } from '@/pages/game-over'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/game-over" element={<GameOverPage />} />
      </Routes>
    </BrowserRouter>
  )
}
