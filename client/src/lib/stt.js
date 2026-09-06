/**
 * Browser-native Speech-to-Text module (G1, FR-1, FR-2, FR-4).
 *
 * Uses the Web Speech API (webkitSpeechRecognition / SpeechRecognition)
 * for continuous real-time speech recognition in the browser.
 * Built with full exception safety for all modern browsers & Vercel deployment.
 */

const WAKE_WORDS = ["aegis", "commander", "aegis status", "commander status"];

export function createSTT(options = {}) {
  const {
    onResult = () => {},
    onWakeWord = () => {},
    onError = () => {},
    onStateChange = () => {},
    lang = "en-IN",
  } = options;

  let SpeechRecognition = null;
  try {
    if (typeof window !== "undefined") {
      SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    }
  } catch (_) {}

  if (!SpeechRecognition) {
    return {
      supported: false,
      start: () => onError("Speech recognition not supported in this browser. Use Chrome or Edge."),
      stop: () => {},
      isListening: () => false,
    };
  }

  let recognition;
  try {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;
  } catch (err) {
    return {
      supported: false,
      start: () => onError("Failed to initialize speech recognition."),
      stop: () => {},
      isListening: () => false,
    };
  }

  let listening = false;
  let shouldRestart = false;

  recognition.onstart = () => {
    listening = true;
    onStateChange("listening");
  };

  recognition.onresult = (event) => {
    try {
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

      if (interimTranscript) {
        onResult({ text: interimTranscript, isFinal: false });
      }

      if (finalTranscript) {
        const cleaned = finalTranscript.trim();
        if (!cleaned) return;

        const lower = cleaned.toLowerCase();
        const isWakeWord = WAKE_WORDS.some((w) => lower.startsWith(w));

        if (isWakeWord) {
          const query = lower.replace(/^(aegis|commander)\s*/i, "").trim();
          onWakeWord(query || "status");
        } else {
          onResult({ text: cleaned, isFinal: true });
        }
      }
    } catch (e) {
      console.warn("[STT onresult error]", e);
    }
  };

  recognition.onerror = (event) => {
    if (event.error === "no-speech") return;
    if (event.error === "aborted") return;
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
      try {
        recognition.start();
      } catch (e) {
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
        onError("Failed to start speech recognition.");
      }
    },

    stop() {
      shouldRestart = false;
      if (listening) {
        try { recognition.stop(); } catch (_) {}
      }
      onStateChange("stopped");
    },

    isListening() {
      return listening;
    },
  };
}
