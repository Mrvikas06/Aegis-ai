/**
 * Classification layer — ports app/classifier.py 1:1.
 * Transparent rule-based classifier so the whole pipeline is demoable
 * without any API keys. Swap classify() for an LLM call in production;
 * keep the same { type, confidence, normalizedText, ownerHint, dueHint }
 * return shape and nothing downstream needs to change.
 */
export const ItemType = Object.freeze({
  FACT: "fact",
  HYPOTHESIS: "hypothesis",
  ASSUMPTION: "assumption",
  DECISION: "decision",
  ACTION: "action",
  NON_SUBSTANTIVE: "non_substantive",
});

const HYPOTHESIS_MARKERS = [
  /\bi think\b/i, /\bi believe\b/i, /\bmight be\b/i, /\bcould be\b/i,
  /\bprobably\b/i, /\bmy guess\b/i, /\bmaybe\b/i, /\bpossibly\b/i,
  /\bit seems\b/i, /\bsuspect\b/i, /\bcould have\b/i, /\bwonder if\b/i,
];

const ASSUMPTION_MARKERS = [
  /\bwe'?re assuming\b/i, /\bassuming\b/i, /\bi assume\b/i,
  /\bpresumably\b/i, /\bi'd assume\b/i,
];

const DECISION_MARKERS = [
  /\bwe'?re rolling back\b/i, /\bwe'?ve decided\b/i, /\blet'?s go with\b/i,
  /\bdecision is\b/i, /\bwe will\b/i, /\bwe'?re going to\b/i,
  /\bfinal call\b/i, /\bwe'?re doing\b/i,
];

const ACTION_MARKERS = [
  /\bcan you\b/i, /\bcould you\b/i, /\bplease check\b/i, /\bplease look\b/i,
  /\bi'?ll (take|check|handle|look)\b/i, /\byou take\b/i, /\bassign(ed)? to\b/i,
  /\bfollow up on\b/i,
];

const FACT_MARKERS = [
  /\d+%/, /\bat \d{1,2}:\d{2}\b/i, /\berror rate\b/i,
  /\bper (datadog|grafana|pagerduty|newrelic)\b/i, /\bconfirmed\b/i,
  /\bshows\b/i, /\blogs? show\b/i, /\bmetrics?\b/i, /\bwe (saw|see|observed)\b/i,
];

const OWNER_RE = /\b([A-Z][a-z]+),?\s+(can you|could you|please)\b/;
const DUE_RE = /\b(in \d+ ?min(ute)?s?|by \d{1,2}:\d{2}|within \d+ ?min(ute)?s?)\b/i;

const matchesAny = (patterns, text) => patterns.some((p) => p.test(text));

export class HeuristicClassifier {
  classify(text) {
    const stripped = text.trim();
    if (stripped.length < 3) {
      return { type: ItemType.NON_SUBSTANTIVE, confidence: 0.99, normalizedText: stripped };
    }

    const ownerMatch = OWNER_RE.exec(stripped);
    const dueMatch = DUE_RE.exec(stripped);

    if (matchesAny(ACTION_MARKERS, stripped) || ownerMatch) {
      return {
        type: ItemType.ACTION,
        confidence: 0.78,
        normalizedText: stripped,
        ownerHint: ownerMatch ? ownerMatch[1] : null,
        dueHint: dueMatch ? dueMatch[0] : null,
      };
    }
    if (matchesAny(DECISION_MARKERS, stripped)) {
      return { type: ItemType.DECISION, confidence: 0.82, normalizedText: stripped };
    }
    if (matchesAny(ASSUMPTION_MARKERS, stripped)) {
      return { type: ItemType.ASSUMPTION, confidence: 0.7, normalizedText: stripped };
    }
    if (matchesAny(HYPOTHESIS_MARKERS, stripped)) {
      return { type: ItemType.HYPOTHESIS, confidence: 0.72, normalizedText: stripped };
    }
    if (matchesAny(FACT_MARKERS, stripped)) {
      return { type: ItemType.FACT, confidence: 0.75, normalizedText: stripped };
    }
    // Default: never silently drop an utterance — low-confidence fact,
    // correctable in one step by any participant (FR-12).
    return { type: ItemType.FACT, confidence: 0.5, normalizedText: stripped };
  }
}
