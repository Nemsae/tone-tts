<script lang="ts">
  import Router from 'svelte-spa-router';
  import { HomePage } from '@/pages/home';
  import { SoloSetupPage } from '@/pages/solo-setup';
  import { SoloGamePage } from '@/pages/solo-game';
  import { SoloResultPage } from '@/pages/solo-result';
  import { MultiplayerSetupPage } from '@/pages/multiplayer-setup';
  import { MultiplayerJoinPage } from '@/pages/multiplayer-join';
  import { MultiplayerGamePage } from '@/pages/multiplayer-game';
  import { MultiplayerResultPage } from '@/pages/multiplayer-result';
  import { MultiplayerModePage } from '@/pages/multiplayer-mode';
  import { MultiplayerLobbyPage } from '@/pages/multiplayer-lobby';

  const routes = {
    '/': HomePage,
    '/solo-setup': SoloSetupPage,
    '/solo-game': SoloGamePage,
    '/solo-result': SoloResultPage,
    '/multiplayer-setup': MultiplayerSetupPage,
    '/multiplayer-join': MultiplayerJoinPage,
    '/multiplayer-lobby': MultiplayerLobbyPage,
    '/multiplayer-game': MultiplayerGamePage,
    '/multiplayer-result': MultiplayerResultPage,
    '/multiplayer-mode': MultiplayerModePage,
  };
</script>

<Router {routes} />
