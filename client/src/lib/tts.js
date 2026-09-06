/**
 * Browser-native Text-to-Speech (TTS) module for Aegis AI Voice Agent.
 * Speaks AI responses aloud using SpeechSynthesis API when voice call is active.
 * Built with full exception safety for all modern browsers & Vercel deployment.
 */

let currentUtterance = null;

export function speakText(text, onEnd = null) {
  try {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !window.speechSynthesis ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      return;
    }

    // Stop any active speech before starting new phrase
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}

    // Clean markdown tags & code blocks for crisp speech delivery
    const cleanText = (text || "")
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/[`#*_~]/g, "")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05; // Natural human cadence
    utterance.pitch = 1.0;

    const setVoice = () => {
      try {
        const voices = window.speechSynthesis.getVoices() || [];
        // Prefer clear English voice
        const preferredVoice =
          voices.find(
            (v) =>
              v.lang?.startsWith("en") &&
              (v.name?.includes("Google") ||
                v.name?.includes("Natural") ||
                v.name?.includes("Zira") ||
                v.name?.includes("Samantha") ||
                v.name?.includes("Daniel") ||
                v.name?.includes("Karen") ||
                v.name?.includes("Alex"))
          ) || voices.find((v) => v.lang?.startsWith("en"));

        if (preferredVoice) utterance.voice = preferredVoice;
      } catch (_) {}
    };

    setVoice();

    try {
      if ("onvoiceschanged" in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = setVoice;
      }
    } catch (_) {}

    if (onEnd) utterance.onend = onEnd;

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("[TTS speakText Note]", err);
  }
}

export function stopSpeaking() {
  try {
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      window.speechSynthesis
    ) {
      window.speechSynthesis.cancel();
    }
  } catch (err) {
    console.warn("[TTS stopSpeaking Note]", err);
  }
}
