<script lang="ts">
  import Router from 'svelte-spa-router';
  import { HomePage } from '@/pages/home';
  import { PlayPage } from '@/pages/play';
  import { GameOverPage } from '@/pages/game-over';

  const routes = {
    '/': HomePage,
    '/play': PlayPage,
    '/game-over': GameOverPage,
  };
</script>

<Router {routes} />
