import { useCallback, useEffect, useRef, useState } from 'react'

const UNSUPPORTED_ERROR_MESSAGE = 'Speech recognition is not supported in this browser.'
const PERMISSION_ERROR_MESSAGE =
  'Microphone permission is blocked. You can keep playing with keyboard fallback.'
const NETWORK_ERROR_MESSAGE =
  'No internet connection. Speech recognition requires internet to work.'

export interface UseSpeechResult {
  isSupported: boolean
  isListening: boolean
  transcript: string
  error: string | null
  startListening: () => void
  stopListening: () => void
  clearError: () => void
  restartRecognition: () => void
}

const isSpeechSupported = typeof window !== 'undefined' && 
  (window.SpeechRecognition !== undefined || window.webkitSpeechRecognition !== undefined)

const INITIAL_ERROR = isSpeechSupported ? null : UNSUPPORTED_ERROR_MESSAGE

const createRecognition = (
  onresult: (event: SpeechRecognitionEvent) => void,
  onerror: (event: SpeechRecognitionErrorEvent) => void,
  onend: () => void
): SpeechRecognition => {
  const RecognitionConstructor = window.SpeechRecognition ?? window.webkitSpeechRecognition
  const recognition = new RecognitionConstructor()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'en-US'
  recognition.maxAlternatives = 1
  recognition.onresult = onresult
  recognition.onerror = onerror
  recognition.onend = onend
  return recognition
}

const createRecognitionHandlers = (
  setTranscript: (transcript: string) => void,
  setError: (error: string | null) => void,
  setIsListening: (listening: boolean) => void
) => {
  const onresult = (event: SpeechRecognitionEvent) => {
    const chunks: string[] = []
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      chunks.push(event.results[index][0].transcript)
    }
    setTranscript(chunks.join(' ').trim())
  }

  const onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error:', event, event.error)
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      setError(PERMISSION_ERROR_MESSAGE)
    } else if (event.error === 'network') {
      setError(NETWORK_ERROR_MESSAGE)
    } else {
      setError(`Speech recognition error: ${event.error}.`)
    }
    setIsListening(false)
  }

  const onend = () => {
    setIsListening(false)
  }

  return { onresult, onerror, onend }
}

export function useSpeech(): UseSpeechResult {
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isSupported = isSpeechSupported
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(INITIAL_ERROR)

  useEffect(() => {
    if (!isSpeechSupported) {
      return
    }

    const handlers = createRecognitionHandlers(setTranscript, setError, setIsListening)
    const recognition = createRecognition(handlers.onresult, handlers.onerror, handlers.onend)

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [])

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current

    if (recognition === null) {
      setError(UNSUPPORTED_ERROR_MESSAGE)
      return
    }

    setError(null)

    try {
      recognition.start()
      setIsListening(true)
    } catch (startError) {
      if (startError instanceof DOMException && startError.name === 'InvalidStateError') {
        return
      }

      setError('Could not start microphone capture. Please try again.')
      setIsListening(false)
    }
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const restartRecognition = useCallback(() => {
    recognitionRef.current?.stop()
    setTranscript('')
    setIsListening(false)
    setError(null)

    if (!isSpeechSupported) {
      return
    }

    const handlers = createRecognitionHandlers(setTranscript, setError, setIsListening)
    const recognition = createRecognition(handlers.onresult, handlers.onerror, handlers.onend)
    recognitionRef.current = recognition

    try {
      recognition.start()
      setIsListening(true)
    } catch (startError) {
      if (startError instanceof DOMException && startError.name === 'InvalidStateError') {
        return
      }
      setError('Could not start microphone capture. Please try again.')
      setIsListening(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    clearError,
    restartRecognition,
  }
}
