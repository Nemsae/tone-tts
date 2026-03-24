import type { Twister, TwisterLength } from '@/shared/vendor';

export type { Twister, TwisterLength };

export type GameScreen = 'lobby' | 'playing' | 'paused' | 'game-over';

export interface GameSettings {
  topic: string;
  length: TwisterLength;
  customLength?: number;
  rounds: number;
  roundTimeLimit?: number | null;
  autoSubmitEnabled?: boolean;
  autoSubmitDelay?: number;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  currentScore: number;
  isConnected: boolean;
}

export interface RoundResult {
  playerId: string;
  twisterId: string;
  similarity: number;
  completedAt: number;
}

export interface GameState {
  roomCode: string;
  settings: GameSettings;
  players: Player[];
  twisters: Twister[];
  currentRound: number;
  roundResults: RoundResult[];
  status: GameScreen;
  startedAt: number | null;
  pausedAt: number | null;
  totalPausedTime: number;
  currentTwisterStartTime: number | null;
}

export interface LeaderboardEntry {
  player: Player;
  accuracy: number;
  time: number;
}

export interface CreateRoomPayload {
  playerName: string;
  settings: GameSettings;
}

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
}

export interface SubmitAnswerPayload {
  transcript: string;
  timestamp: number;
}

export interface ApiResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface CreateRoomResponse {
  roomCode: string;
  player: Player;
  game: GameState;
}

export interface JoinRoomResponse {
  roomCode: string;
  player: Player;
  game: GameState;
}

export interface SubmitAnswerResponse {
  similarity: number;
}

export interface GetRoomStateResponse {
  game: GameState;
  playerId: string;
}

export interface PlayerJoinedEvent {
  player: Player;
  players: Player[];
  game: GameState;
}

export interface GameStartedEvent {
  game: GameState;
  currentTwister: Twister;
  roundStartTime: number;
}

export interface PlayerSubmittedEvent {
  playerId: string;
  similarity: number;
}

export interface RoundAdvancedEvent {
  currentRound: number;
  currentTwister: Twister;
  roundStartTime: number;
}

export interface GamePausedEvent {
  pausedAt: number;
  pausedBy: string;
}

export interface GameResumedEvent {
  resumedAt: number;
  totalPausedTime: number;
}

export interface GameEndedEvent {
  leaderboard: LeaderboardEntry[];
}

export interface PlayerLeftEvent {
  playerId: string;
  players: Player[];
}
