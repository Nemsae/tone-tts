import { writable } from 'svelte/store';

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
  const store = writable<SpeechState>({
    isSupported: isSpeechSupported,
    isListening: false,
    transcript: '',
    error: isSpeechSupported ? null : UNSUPPORTED_ERROR_MESSAGE,
  });

  let recognition: SpeechRecognition | null = null;
  let isRestarting = false;

  function createRecognitionHandlers() {
    return {
      onresult: (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let index = 0; index < event.results.length; index += 1) {
          const result = event.results[index];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const combinedTranscript = (finalTranscript || interimTranscript).trim();
        if (combinedTranscript) {
          store.update((state) => ({ ...state, transcript: combinedTranscript }));
        }
      },
      onerror: (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        let errorMsg = '';
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errorMsg = PERMISSION_ERROR_MESSAGE;
        } else if (event.error === 'network') {
          errorMsg = NETWORK_ERROR_MESSAGE;
        } else if (event.error === 'no-speech') {
          errorMsg = NO_SPEECH_ERROR_MESSAGE;
        } else if (event.error === 'aborted') {
          return;
        } else {
          errorMsg = `Speech recognition error: ${event.error}.`;
        }
        store.update((state) => ({ ...state, error: errorMsg, isListening: false }));
      },
      onend: () => {
        if (isRestarting) {
          isRestarting = false;
          return;
        }
        store.update((state) => ({ ...state, isListening: false }));
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
      store.update((state) => ({ ...state, error: UNSUPPORTED_ERROR_MESSAGE }));
      return;
    }

    store.update((state) => ({ ...state, error: null }));

    try {
      recognition.start();
      store.update((state) => ({ ...state, isListening: true }));
    } catch (startError) {
      if (startError instanceof DOMException && startError.name === 'InvalidStateError') {
        return;
      }

      store.update((state) => ({
        ...state,
        error: 'Could not start microphone capture. Please try again.',
        isListening: false,
      }));
    }
  }

  function stopListening() {
    recognition?.stop();
    store.update((state) => ({ ...state, isListening: false }));
  }

  function restartRecognition() {
    recognition?.stop();
    store.update((state) => ({ ...state, transcript: '', isListening: false, error: null }));

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
      store.update((state) => ({ ...state, isListening: true }));
    } catch (startError) {
      if (startError instanceof DOMException && startError.name === 'InvalidStateError') {
        return;
      }
      store.update((state) => ({
        ...state,
        error: 'Could not start microphone capture. Please try again.',
        isListening: false,
      }));
    }
  }

  function clearError() {
    store.update((state) => ({ ...state, error: null }));
  }

  function clearTranscript(restartListening = false) {
    store.update((state) => ({ ...state, transcript: '' }));

    if (!restartListening || !isSpeechSupported) {
      return;
    }

    isRestarting = true;
    recognition?.stop();

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
      store.update((state) => ({ ...state, isListening: true }));
    } catch (startError) {
      isRestarting = false;
      if (startError instanceof DOMException && startError.name === 'InvalidStateError') {
        return;
      }
      store.update((state) => ({
        ...state,
        error: 'Could not start microphone capture. Please try again.',
        isListening: false,
      }));
    }
  }

  init();

  return {
    subscribe: store.subscribe,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    restartRecognition,
    clearError,
    clearTranscript,
  };
}

export const speechStore = createSpeechStore();
