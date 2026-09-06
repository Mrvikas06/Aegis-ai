/**
 * Browser-native Speech-to-Text module (G1, FR-1, FR-2, FR-4).
 *
 * Uses the Web Speech API (webkitSpeechRecognition / SpeechRecognition)
 * for continuous real-time speech recognition in the browser.
 *
 * Features:
 * - Continuous recognition with auto-restart
 * - Interim results for live transcript preview
 * - Wake-word detection ("Aegis" / "Commander") routes to status query
 * - Graceful degradation when API unavailable
 */

const WAKE_WORDS = ["aegis", "commander", "aegis status", "commander status"];

/**
 * Creates a managed STT instance.
 * @param {Object} options
 * @param {function} options.onResult - Called with { text, isFinal } for each result
 * @param {function} options.onWakeWord - Called when a wake word is detected (instead of onResult)
 * @param {function} options.onError - Called with error message
 * @param {function} options.onStateChange - Called with "listening" | "stopped" | "error"
 * @param {string} options.lang - Language code (default: "en-IN")
 */
export function createSTT(options = {}) {
  const {
    onResult = () => {},
    onWakeWord = () => {},
    onError = () => {},
    onStateChange = () => {},
    lang = "en-IN",
  } = options;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return {
      supported: false,
      start: () => onError("Speech recognition not supported in this browser. Use Chrome or Edge."),
      stop: () => {},
      isListening: () => false,
    };
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = lang;
  recognition.maxAlternatives = 1;

  let listening = false;
  let shouldRestart = false;

  recognition.onstart = () => {
    listening = true;
    onStateChange("listening");
  };

  recognition.onresult = (event) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    // Show interim results for live preview
    if (interimTranscript) {
      onResult({ text: interimTranscript, isFinal: false });
    }

    // Process final results
    if (finalTranscript) {
      const cleaned = finalTranscript.trim();
      if (!cleaned) return;

      // Check for wake word
      const lower = cleaned.toLowerCase();
      const isWakeWord = WAKE_WORDS.some((w) => lower.startsWith(w));

      if (isWakeWord) {
        // Extract the query after the wake word, if any
        const query = lower.replace(/^(aegis|commander)\s*/i, "").trim();
        onWakeWord(query || "status");
      } else {
        onResult({ text: cleaned, isFinal: true });
      }
    }
  };

  recognition.onerror = (event) => {
    if (event.error === "no-speech") return; // Normal — user paused
    if (event.error === "aborted") return; // Manual stop
    if (event.error === "not-allowed") {
      listening = false;
      shouldRestart = false;
      onStateChange("error");
      onError("Microphone access denied. Please allow microphone access in browser settings.");
      return;
    }
    onError(`Speech recognition error: ${event.error}`);
  };

  recognition.onend = () => {
    listening = false;
    if (shouldRestart) {
      // Auto-restart for continuous listening
      try {
        recognition.start();
      } catch (e) {
        // Already started or browser blocked — retry after a short delay
        setTimeout(() => {
          if (shouldRestart) {
            try { recognition.start(); } catch (e2) { /* give up */ }
          }
        }, 500);
      }
    } else {
      onStateChange("stopped");
    }
  };

  return {
    supported: true,

    start() {
      if (listening) return;
      shouldRestart = true;
      try {
        recognition.start();
      } catch (e) {
        onError("Failed to start speech recognition. Is another tab using the microphone?");
      }
    },

    stop() {
      shouldRestart = false;
      if (listening) {
        recognition.stop();
      }
      onStateChange("stopped");
    },

    isListening() {
      return listening;
    },
  };
}
