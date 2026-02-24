import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateAITwisters, isApiKeyConfigured, type PredefinedTopic } from '@/features/twister-generator'
import { createSession, saveSession, type GameSettings } from '@/entities/session'
import { useGameFlow } from '@/entities/session'
import type { TwisterLength } from '@/shared/vendor'
import styles from './home.module.scss'

const PREDEFINED_TOPICS = ['Animals', 'Tech', 'Food'] as const
const DIFFICULTY_OPTIONS: { value: TwisterLength; label: string; words: string }[] = [
  { value: 'short', label: 'Easy', words: '~5 words' },
  { value: 'medium', label: 'Medium', words: '~10 words' },
  { value: 'long', label: 'Hard', words: '~20 words' },
  { value: 'custom', label: 'Custom', words: '5-40 words' },
]
const ROUND_MIN = 1
const ROUND_MAX = 10

export function HomePage() {
  const navigate = useNavigate()
  const gameFlow = useGameFlow()
  const [selectedTopic, setSelectedTopic] = useState<PredefinedTopic | ''>('')
  const [customTopic, setCustomTopic] = useState('')
  const [useCustomTopic, setUseCustomTopic] = useState(true)
  const [length, setLength] = useState<TwisterLength>('medium')
  const [customLength, setCustomLength] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const customTopicInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (useCustomTopic && customTopicInputRef.current) {
      customTopicInputRef.current.focus()
    }
  }, [useCustomTopic])

  const handleStartGame = async () => {
    const topic = useCustomTopic ? customTopic : selectedTopic
    if (!topic) {
      setError('Please select or enter a topic')
      return
    }

    if (useCustomTopic && topic.length < 2) {
      setError('Custom topic must be at least 2 characters')
      return
    }

    if (length === 'custom' && (customLength < 5 || customLength > 40)) {
      setError('Custom difficulty must be between 5 and 40 words')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const twisters = await generateAITwisters(
        topic,
        length,
        length === 'custom' ? customLength : undefined,
        gameFlow.rounds,
      )
      const settings: GameSettings = { topic, length, customLength: length === 'custom' ? customLength : undefined, rounds: gameFlow.rounds }
      const session = createSession(twisters, settings)
      saveSession(session)
      navigate('/play')
    } catch (err) {
      setError('Failed to generate tongue twisters. Please check your API key.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isApiKeyConfigured()) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Tongue Twister Challenge</h1>
          <p className={styles.subtitle}>Configure your API key to play</p>
          <div className={styles.error}>
            Please add your OpenAI API key to the .env file as VITE_OPENAI_API_KEY
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Tongue Twister Challenge</h1>
        <p className={styles.subtitle}>Test your pronunciation skills!</p>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Theme</h2>
          <div className={styles.customTopicSection}>
            <input
              ref={customTopicInputRef}
              type="text"
              className={`${styles.textInput} ${styles.primaryInput}`}
              placeholder="e.g. Marvel Superheroes, Lord of the Rings, 80s Music..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
            />
            <span className={styles.hintText}>
              or select a preset below
            </span>
          </div>
          <div className={styles.topicGrid}>
            {PREDEFINED_TOPICS.map((topic) => (
              <button
                key={topic}
                className={`${styles.topicButton} ${styles.secondaryButton} ${selectedTopic === topic && !useCustomTopic ? styles.selected : ''}`}
                onClick={() => {
                  setSelectedTopic(topic)
                  setUseCustomTopic(false)
                }}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Difficulty</h2>
          <div className={styles.lengthGrid}>
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`${styles.lengthButton} ${length === option.value ? styles.selected : ''}`}
                onClick={() => setLength(option.value)}
              >
                <span className={styles.lengthLabel}>{option.label}</span>
                <span className={styles.lengthWords}>{option.words}</span>
              </button>
            ))}
          </div>
          {length === 'custom' && (
            <div className={styles.customLengthRow}>
              <label>Words:</label>
              <input
                type="number"
                className={styles.numberInput}
                min={5}
                max={40}
                value={customLength}
                onChange={(e) => setCustomLength(Number(e.target.value))}
              />
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Rounds: {gameFlow.rounds}</h2>
          <input
            type="range"
            className={styles.rangeInput}
            min={ROUND_MIN}
            max={ROUND_MAX}
            value={gameFlow.rounds}
            onChange={(e) => gameFlow.updateRounds(Number(e.target.value))}
          />
          <div className={styles.rangeLabels}>
            <span>{ROUND_MIN}</span>
            <span>{ROUND_MAX}</span>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button
          className={styles.startButton}
          onClick={handleStartGame}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Start Game'}
        </button>
      </div>
    </div>
  )
}
