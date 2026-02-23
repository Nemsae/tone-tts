import type { Twister, TwisterLength } from '@/shared/vendor'
import { calculateSimilarity } from '@/shared/lib/string-utils'

export interface GameSettings {
  topic: string
  length: TwisterLength
  customLength?: number
  rounds: number
}

export interface RoundResult {
  twisterId: string
  similarity: number
}

export interface Session {
  id: string
  twisters: Twister[]
  currentIndex: number
  startTime: number
  roundResults: RoundResult[]
  settings?: GameSettings
}

export interface ScoringResult {
  isMatch: boolean
  similarity: number
  matchedWords: boolean[]
  wordsAttempted: number
}

const MATCH_THRESHOLD = 80

export function scoreTwister(spoken: string, target: string): ScoringResult {
  const similarity = calculateSimilarity(target, spoken)
  const isMatch = similarity >= MATCH_THRESHOLD

  const targetWords = target.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)
  const spokenWords = spoken.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)

  const matchedWords: boolean[] = []
  for (let i = 0; i < targetWords.length; i++) {
    if (i < spokenWords.length) {
      matchedWords.push(
        calculateSimilarity(targetWords[i], spokenWords[i]) >= MATCH_THRESHOLD,
      )
    } else {
      matchedWords.push(false)
    }
  }

  const wordsAttempted = spokenWords.length

  return { isMatch, similarity, matchedWords, wordsAttempted }
}

const STORAGE_KEY = 'tongue-twister-session'
const FINAL_RESULT_KEY = 'tongue-twister-result'

export function createSession(twisters: Twister[], settings?: GameSettings): Session {
  return {
    id: crypto.randomUUID(),
    twisters,
    currentIndex: 0,
    startTime: Date.now(),
    roundResults: [],
    settings,
  }
}

export function getCurrentTwister(session: Session): Twister | null {
  return session.twisters[session.currentIndex] ?? null
}

export function advanceSession(session: Session): Session {
  return {
    ...session,
    currentIndex: session.currentIndex + 1,
  }
}

export function addRoundResult(session: Session, result: RoundResult): Session {
  return {
    ...session,
    roundResults: [...session.roundResults, result],
  }
}

export function isSessionComplete(session: Session): boolean {
  return session.currentIndex >= session.twisters.length
}

export function calculateAccuracy(session: Session): number {
  if (session.roundResults.length === 0) return 0
  const total = session.roundResults.reduce((sum, r) => sum + r.similarity, 0)
  return Math.round(total / session.roundResults.length)
}

export function getElapsedTime(session: Session): number {
  return Date.now() - session.startTime
}

export function saveSession(session: Session): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // sessionStorage not available
  }
}

export function loadSession(): Session | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // sessionStorage not available
  }
}

export interface FinalResult {
  accuracy: number
  elapsedTime: number
}

export function saveFinalResult(result: FinalResult): void {
  try {
    sessionStorage.setItem(FINAL_RESULT_KEY, JSON.stringify(result))
  } catch {
    // sessionStorage not available
  }
}

export function loadFinalResult(): FinalResult | null {
  try {
    const stored = sessionStorage.getItem(FINAL_RESULT_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function clearFinalResult(): void {
  try {
    sessionStorage.removeItem(FINAL_RESULT_KEY)
  } catch {
    // sessionStorage not available
  }
}
