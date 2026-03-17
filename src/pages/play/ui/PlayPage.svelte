<script lang="ts">
  import { push } from 'svelte-spa-router';
  import GameSession from '@/widgets/game-session/ui/GameSession.svelte';
  import { loadSession, clearSession, saveFinalResult, type Session } from '@/entities/session';
  import { onMount } from 'svelte';

  let session = $state<Session | null>(null);

  onMount(() => {
    session = loadSession();
  });

  function handleComplete(result: { accuracy: number; elapsedTime: number }) {
    saveFinalResult({ accuracy: result.accuracy, elapsedTime: result.elapsedTime });
    clearSession();
    push('/game-over');
  }

  function handleSessionChange(newSession: Session) {
    session = newSession;
  }
</script>

{#if !session}
  <div style="min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 2rem;">
    Loading...
  </div>
{:else}
  <div
    style="min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 2rem;"
  >
    <GameSession session={session} onSessionChange={handleSessionChange} onComplete={handleComplete} />
  </div>
{/if}
