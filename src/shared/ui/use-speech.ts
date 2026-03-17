import { writable, get } from 'svelte/store';

const UNSUPPORTED_ERROR_MESSAGE = 'Speech recognition is not supported in this browser.';
const PERMISSION_ERROR_MESSAGE =
  'Microphone permission is blocked. You can keep playing with keyboard fallback.';
const NETWORK_ERROR_MESSAGE =
  'No internet connection. Speech recognition requires internet to work.';
const NO_SPEECH_ERROR_MESSAGE = 'No speech detected. Please try speaking again.';

interface SpeechState {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
}

const isSpeechSupported =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition !== undefined || window.webkitSpeechRecognition !== undefined);

function createSpeechStore() {
  const { subscribe, set, update } = writable<SpeechState>({
    isSupported: isSpeechSupported,
    isListening: false,
    transcript: '',
    error: isSpeechSupported ? null : UNSUPPORTED_ERROR_MESSAGE,
  });

  let recognition: SpeechRecognition | null = null;

  function createRecognitionHandlers() {
    return {
      onresult: (event: SpeechRecognitionEvent) => {
        const chunks: string[] = [];
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          chunks.push(event.results[index][0].transcript);
        }
        update((state) => ({ ...state, transcript: chunks.join(' ').trim() }));
      },
      onerror: (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event, event.error);
        let errorMsg = '';
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errorMsg = PERMISSION_ERROR_MESSAGE;
        } else if (event.error === 'network') {
          errorMsg = NETWORK_ERROR_MESSAGE;
        } else if (event.error === 'no-speech') {
          errorMsg = NO_SPEECH_ERROR_MESSAGE;
        } else {
          errorMsg = `Speech recognition error: ${event.error}.`;
        }
        update((state) => ({ ...state, error: errorMsg, isListening: false }));
      },
      onend: () => {
        update((state) => ({ ...state, isListening: false }));
      },
    };
  }

  function init() {
    if (!isSpeechSupported) {
      return;
    }

    const handlers = createRecognitionHandlers();
    const RecognitionConstructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    recognition = new RecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    recognition.onresult = handlers.onresult;
    recognition.onerror = handlers.onerror;
    recognition.onend = handlers.onend;
  }

  function startListening() {
    if (recognition === null) {
      update((state) => ({ ...state, error: UNSUPPORTED_ERROR_MESSAGE }));
      return;
    }

    update((state) => ({ ...state, error: null }));

    try {
      recognition.start();
      update((state) => ({ ...state, isListening: true }));
    } catch (startError) {
      if (startError instanceof DOMException && startError.name === 'InvalidStateError') {
        return;
      }

      update((state) => ({
        ...state,
        error: 'Could not start microphone capture. Please try again.',
        isListening: false,
      }));
    }
  }

  function stopListening() {
    recognition?.stop();
    update((state) => ({ ...state, isListening: false }));
  }

  function restartRecognition() {
    recognition?.stop();
    update((state) => ({ ...state, transcript: '', isListening: false, error: null }));

    if (!isSpeechSupported) {
      return;
    }

    const handlers = createRecognitionHandlers();
    const RecognitionConstructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    recognition = new RecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    recognition.onresult = handlers.onresult;
    recognition.onerror = handlers.onerror;
    recognition.onend = handlers.onend;

    try {
      recognition.start();
      update((state) => ({ ...state, isListening: true }));
    } catch (startError) {
      if (startError instanceof DOMException && startError.name === 'InvalidStateError') {
        return;
      }
      update((state) => ({
        ...state,
        error: 'Could not start microphone capture. Please try again.',
        isListening: false,
      }));
    }
  }

  function clearError() {
    update((state) => ({ ...state, error: null }));
  }

  function clearTranscript() {
    update((state) => ({ ...state, transcript: '' }));
  }

  init();

  return {
    subscribe,
    get isSupported() {
      return get({ subscribe }).isSupported;
    },
    get isListening() {
      return get({ subscribe }).isListening;
    },
    get transcript() {
      return get({ subscribe }).transcript;
    },
    get error() {
      return get({ subscribe }).error;
    },
    startListening,
    stopListening,
    restartRecognition,
    clearError,
    clearTranscript,
  };
}

export const speechStore = createSpeechStore();
