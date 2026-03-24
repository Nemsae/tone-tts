import { writable, get } from 'svelte/store';
import type { TwisterLength } from '@/shared/vendor';

export type PredefinedTopic = 'Animals' | 'Tech' | 'Food';

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
  const { subscribe, update } = writable<GameFlowState>({
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

export const PREDEFINED_TOPICS = ['Animals', 'Tech', 'Food'] as const;

export interface GameSettingsState {
  selectedTopic: PredefinedTopic | '';
  customTopic: string;
  useCustomTopic: boolean;
  length: TwisterLength;
  customLength: number;
  rounds: number;
  roundTimeLimitEnabled: boolean;
  roundTimeLimit: number;
  autoSubmitEnabled: boolean;
  autoSubmitDelay: number;
}

const DEFAULT_SETTINGS: GameSettingsState = {
  selectedTopic: '',
  customTopic: '',
  useCustomTopic: true,
  length: 'medium',
  customLength: 10,
  rounds: 3,
  roundTimeLimitEnabled: false,
  roundTimeLimit: 30,
  autoSubmitEnabled: false,
  autoSubmitDelay: 1500,
};

function createGameSettingsStore() {
  const { subscribe, update, set } = writable<GameSettingsState>({ ...DEFAULT_SETTINGS });

  return {
    subscribe,
    get selectedTopic() {
      return get({ subscribe }).selectedTopic;
    },
    get customTopic() {
      return get({ subscribe }).customTopic;
    },
    get useCustomTopic() {
      return get({ subscribe }).useCustomTopic;
    },
    get length() {
      return get({ subscribe }).length;
    },
    get customLength() {
      return get({ subscribe }).customLength;
    },
    get rounds() {
      return get({ subscribe }).rounds;
    },
    get roundTimeLimitEnabled() {
      return get({ subscribe }).roundTimeLimitEnabled;
    },
    get roundTimeLimit() {
      return get({ subscribe }).roundTimeLimit;
    },
    get autoSubmitEnabled() {
      return get({ subscribe }).autoSubmitEnabled;
    },
    get autoSubmitDelay() {
      return get({ subscribe }).autoSubmitDelay;
    },
    setSelectedTopic(topic: PredefinedTopic | '') {
      update((state) => ({
        ...state,
        selectedTopic: topic,
        useCustomTopic: false,
        customTopic: '',
      }));
    },
    setCustomTopic(topic: string) {
      update((state) => ({
        ...state,
        customTopic: topic,
        useCustomTopic: true,
        selectedTopic: '',
      }));
    },
    setLength(length: TwisterLength) {
      update((state) => ({ ...state, length }));
    },
    setCustomLength(customLength: number) {
      update((state) => ({ ...state, customLength }));
    },
    setRounds(rounds: number) {
      update((state) => ({ ...state, rounds }));
      gameFlowStore.setRounds(rounds);
    },
    setRoundTimeLimitEnabled(enabled: boolean) {
      update((state) => ({ ...state, roundTimeLimitEnabled: enabled }));
    },
    setRoundTimeLimit(limit: number) {
      update((state) => ({ ...state, roundTimeLimit: limit }));
    },
    setAutoSubmitEnabled(enabled: boolean) {
      update((state) => ({ ...state, autoSubmitEnabled: enabled }));
    },
    setAutoSubmitDelay(delay: number) {
      update((state) => ({ ...state, autoSubmitDelay: delay }));
    },
    reset() {
      set({ ...DEFAULT_SETTINGS });
    },
  };
}

export const gameSettingsStore = createGameSettingsStore();
