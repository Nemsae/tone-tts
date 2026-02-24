import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameSession } from '@/widgets/game-session';
import { loadSession, clearSession, saveFinalResult, type Session } from '@/entities/session';

export function PlayPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(() => loadSession());

  const handleComplete = useCallback(
    (result: { accuracy: number; elapsedTime: number }) => {
      saveFinalResult({ accuracy: result.accuracy, elapsedTime: result.elapsedTime });
      clearSession();
      navigate('/game-over');
    },
    [navigate]
  );

  if (!session) {
    navigate('/');
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      }}
    >
      <GameSession session={session} onSessionChange={setSession} onComplete={handleComplete} />
    </div>
  );
}
