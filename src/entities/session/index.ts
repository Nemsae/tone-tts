import { writable, get } from 'svelte/store';
import type { Twister, TwisterLength } from '@/shared/vendor';
import type { GameSettings, Session, RoundResult, ScoringResult, FinalResult } from './model';
import { calculateSimilarity } from '@/shared/lib/string-utils';

export type { GameSettings, Session, RoundResult, ScoringResult, FinalResult } from './model';
export {
  createSession,
  getCurrentTwister,
  advanceSession,
  addRoundResult,
  isSessionComplete,
  calculateAccuracy,
  getElapsedTime,
  saveSession,
  loadSession,
  clearSession,
  saveFinalResult,
  loadFinalResult,
  clearFinalResult,
  scoreTwister,
} from './model';

export type GameScreen = 'home' | 'play' | 'game-over';

export interface GameFlowState {
  screen: GameScreen;
  rounds: number;
}

const DEFAULT_ROUNDS = 3;

function createGameFlowStore() {
  const { subscribe, set, update } = writable<GameFlowState>({
    screen: 'home',
    rounds: DEFAULT_ROUNDS,
  });

  return {
    subscribe,
    get screen() {
      return get({ subscribe }).screen;
    },
    get rounds() {
      return get({ subscribe }).rounds;
    },
    setScreen(screen: GameScreen) {
      update((state) => ({ ...state, screen }));
    },
    setRounds(rounds: number) {
      update((state) => ({ ...state, rounds }));
    },
  };
}

export const gameFlowStore = createGameFlowStore();
