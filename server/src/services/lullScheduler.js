/**
 * LullSummaryScheduler (FR-32, FR-33).
 *
 * Aegis delivers status summaries at natural pauses, not mid-sentence —
 * modeled here as: no new utterance for LULL_MS, and something has
 * actually changed since the last summary (otherwise repeating the same
 * summary is just noise). A fallback cadence (FALLBACK_MS) fires even
 * without a lull, so a heads-down room still gets periodic updates.
 *
 * Demo-shortened windows (15s/45s) so the behavior is visible without
 * waiting through a real incident's timescale; production would use
 * something like 60-120s / 10-15min.
 */
import { statusSummary } from "./summary.js";

const LULL_MS = 15_000;
const FALLBACK_MS = 45_000;
const CHECK_INTERVAL_MS = 3_000;

export class LullSummaryScheduler {
  constructor(state, io) {
    this.state = state;
    this.io = io;
    this.lastUtteranceAt = Date.now();
    this.lastSummaryAt = 0;
    this.itemCountAtLastSummary = 0;
    this._interval = null;

    state.on("item", () => { this.lastUtteranceAt = Date.now(); });
  }

  start() {
    this._interval = setInterval(() => this._check(), CHECK_INTERVAL_MS);
  }

  stop() {
    clearInterval(this._interval);
  }

  _check() {
    if (this.state.closedAt) return this.stop();

    const now = Date.now();
    const sinceUtterance = now - this.lastUtteranceAt;
    const sinceSummary = now - this.lastSummaryAt;
    const hasNewContent = this.state.items.length > this.itemCountAtLastSummary;

    const lullHit = sinceUtterance >= LULL_MS && hasNewContent;
    const fallbackHit = sinceSummary >= FALLBACK_MS && hasNewContent;

    if (lullHit || fallbackHit) this._speak(lullHit ? "lull" : "fallback_cadence");
  }

  /** On-demand trigger (FR-34: wake-word / "Aegis, status" query). */
  speakNow(role = "unknown") {
    return this._speak("on_demand", role);
  }

  _speak(trigger, role = "unknown") {
    let text = statusSummary(this.state, role);
    // G4: Append proactive gap prompts for unanswered canonical questions
    const gapPrompt = this.state.gapPromptText();
    if (gapPrompt) {
      text += ` ${gapPrompt}`;
    }
    this.lastSummaryAt = Date.now();
    this.itemCountAtLastSummary = this.state.items.length;
    const payload = { text, trigger, at: new Date() };
    this.io.to(this.state.id).emit("status_summary", payload);
    this.state.appendSystemEvent("aegis", `Spoken status summary delivered (${trigger}).`);
    return payload;
  }
}
