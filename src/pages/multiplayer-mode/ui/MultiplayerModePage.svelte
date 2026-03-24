<script lang="ts">
  import { push } from 'svelte-spa-router';
  import styles from './multiplayer-mode.module.scss';

  function handleCreateRoom() {
    push('/multiplayer-setup');
  }

  function handleJoinRoom() {
    push('/multiplayer-join');
  }

  function handleBack() {
    push('/');
  }
</script>

<div class={styles.page}>
  <div class={styles.header}>
    <button class={styles.backButton} onclick={handleBack}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  </div>

  <div class={styles.container}>
    <h1 class={styles.title}>Twist & Shout</h1>
    <p class={styles.subtitle}>
      <span class={styles.highlight}>ready to play.</span>
      <br />
      Experience the rhythm of connection.
    </p>

    <div class={styles.section}>
      <h2 class={styles.sectionTitle}>Premium Experience</h2>
      <p class={styles.sectionSubtitle}>multiplayer lounge</p>

      <div class={styles.cardGrid}>
        <button class={styles.card} onclick={handleCreateRoom}>
          <div class={styles.cardIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>
          <div class={styles.cardContent}>
            <h3 class={styles.cardTitle}>create a new room</h3>
            <p class={styles.cardDescription}>Host a private session and invite your friends to join.</p>
          </div>
          <div class={styles.cardAction}>
            <span class={styles.buttonText}>HOST NOW</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <button class={styles.card} onclick={handleJoinRoom}>
          <div class={styles.cardIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div class={styles.cardContent}>
            <h3 class={styles.cardTitle}>join a room</h3>
            <p class={styles.cardDescription}>Enter a room code to join an existing session.</p>
          </div>
          <div class={styles.cardAction}>
            <span class={styles.buttonText}>CONNECT</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  </div>
</div>
