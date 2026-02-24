import { AppRouter } from './router'
import { GameFlowProvider } from '@/entities/session'

export default function App() {
  return (
    <GameFlowProvider>
      <AppRouter />
    </GameFlowProvider>
  )
}
