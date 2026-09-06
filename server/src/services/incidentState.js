/**
 * IncidentState — ports app/state.py to JS, plus emits events so
 * sockets/incidentSocket.js can push live updates to every connected client.
 *
 * This is the hot path: everything here runs in memory for <2s latency
 * (FR-2). services/persistence.js writes through to Mongo in the
 * background without blocking this class.
 */
import { EventEmitter } from "node:events";
import { HeuristicClassifier, ItemType } from "./classifier.js";

let idCounter = 1;
const nextId = (prefix) => `${prefix}-${String(idCounter++).padStart(4, "0")}`;

export const Role = Object.freeze({
  INCIDENT_COMMANDER: "incident_commander",
  DEPUTY_IC: "deputy_ic",
  ENGINEER: "engineer",
  SUPPORT: "support",
  BUSINESS: "business",
  UNKNOWN: "unknown",
});

export const ActionStatus = Object.freeze({
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  DONE: "done",
  BLOCKED: "blocked",
});

export const CANONICAL_QUESTIONS = [
  "impact_scope", "start_time", "affected_systems", "customer_facing_status", "mitigation_owner",
];

const QUESTION_KEYWORDS = {
  impact_scope: ["% of", "percent", "customers affected", "users affected", "error rate"],
  start_time: [" at ", "started at", "began at"],
  affected_systems: ["payment", "checkout", "gateway", "database", "queue", "service"],
  customer_facing_status: ["statuspage", "customer", "status page", "public"],
  mitigation_owner: ["rolling back", "owns the fix", "leading the fix", "assigned to"],
};

const NEGATION_PAIRS = [
  ["healthy", "unhealthy"], ["healthy", "down"], ["up", "down"],
  ["resolved", "ongoing"], ["passed", "failed"], ["succeeded", "failed"],
  ["stable", "maxed"], ["normal", "spiking"], ["healthy", "maxed"],
  ["normal", "maxed"], ["healthy", "timeouts"], ["normal", "timeouts"],
];

const STALE_AFTER_MS = 10 * 60 * 1000; // FR-20 decay window (demo default)

/**
 * Parses natural-language due hints into Date objects.
 * Supports "in N min(utes)" and "by HH:MM" formats from the classifier.
 */
function parseDueHint(hint, baseTime) {
  if (!hint) return null;
  const relativeMatch = hint.match(/(?:in|within)\s+(\d+)\s*min/i);
  if (relativeMatch) {
    const ms = parseInt(relativeMatch[1], 10) * 60 * 1000;
    return new Date(baseTime.getTime() + ms);
  }
  const absoluteMatch = hint.match(/by\s+(\d{1,2}):(\d{2})/i);
  if (absoluteMatch) {
    const d = new Date(baseTime);
    d.setHours(parseInt(absoluteMatch[1], 10), parseInt(absoluteMatch[2], 10), 0, 0);
    if (d < baseTime) d.setDate(d.getDate() + 1); // next day if past
    return d;
  }
  return null;
}

function shareSubject(a, b) {
  const aw = new Set(a.split(/\s+/).filter((w) => w.length > 3));
  const bw = new Set(b.split(/\s+/).filter((w) => w.length > 3));
  for (const w of aw) if (bw.has(w)) return true;
  return false;
}

export class IncidentState extends EventEmitter {
  constructor(id, name, classifier = new HeuristicClassifier()) {
    super();
    this.id = id;
    this.name = name;
    this.classifier = classifier;

    this.participants = new Map();
    this.utterances = [];
    this.items = [];
    this.timeline = [];
    this.answeredQuestions = new Set();
    this.openedAt = new Date();
    this.closedAt = null;

    this.seedDemoData();
  }

  seedDemoData() {
    const defaultItems = [
      {
        id: "item-seed-1",
        speakerId: "p3",
        text: "Payment API P99 latency increased +240% (420ms) on api-gateway due to connection pool saturation.",
        type: ItemType.FACT,
        timestamp: new Date(Date.now() - 12 * 60 * 1000),
        confidence: 0.98,
        source: "telemetry",
      },
      {
        id: "item-seed-2",
        speakerId: "p5",
        text: "Support reporting 340+ customer tickets with HTTP 503 errors on main Checkout Gateway.",
        type: ItemType.FACT,
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        confidence: 0.95,
        source: "support",
      },
      {
        id: "item-seed-3",
        speakerId: "p4",
        text: "Postgres connection pool max limit reached (100/100) caused by unoptimized N+1 tax query in v2.14 deploy.",
        type: ItemType.HYPOTHESIS,
        timestamp: new Date(Date.now() - 6 * 60 * 1000),
        confidence: 0.94,
        source: "logs",
      },
      {
        id: "item-seed-4",
        speakerId: "p1",
        text: "Rollback cart-service to v2.13 and temporarily expand Postgres max_connections to 200.",
        type: ItemType.ACTION,
        status: ActionStatus.IN_PROGRESS,
        ownerId: "p1",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        confidence: 0.99,
        source: "ic_command",
      },
    ];

    this.items.push(...defaultItems);
    this.timeline.push(...defaultItems.map(i => ({
      id: i.id,
      timestamp: i.timestamp,
      entryType: i.type,
      source: i.source,
      summary: i.text,
    })));
  }

  // -- participants ---------------------------------------------------------

  addParticipant(participantId, name, role = Role.UNKNOWN, roleConfirmed = false) {
    const p = { id: participantId, name, role, roleConfirmed };
    this.participants.set(participantId, p);
    this.emit("participant", p);
    return p;
  }

  correctRole(participantId, role) {
    const p = this.participants.get(participantId);
    p.role = role;
    p.roleConfirmed = true;
    this.emit("participant", p);
    return p;
  }

  canConfirmCriticalActions(participantId) {
    const p = this.participants.get(participantId);
    return !!p && (p.role === Role.INCIDENT_COMMANDER || p.role === Role.DEPUTY_IC);
  }

  // -- ingestion --------------------------------------------------------------

  ingest(speakerId, text) {
    const utt = { id: nextId("utt"), speakerId, text, timestamp: new Date() };
    this.utterances.push(utt);

    const result = this.classifier.classify(text);
    const item = {
      id: nextId("k"),
      type: result.type,
      text: result.normalizedText,
      sourceUtteranceId: utt.id,
      speakerId,
      timestamp: utt.timestamp,
      confidence: result.confidence,
      stale: false,
      ownerId: null,
      due: null,
      status: null,
      conflictsWith: [],
    };

    if (item.type === ItemType.ACTION) {
      item.status = ActionStatus.OPEN;
      if (result.ownerHint) {
        const owner = [...this.participants.values()].find(
          (p) => p.name.toLowerCase() === result.ownerHint.toLowerCase()
        );
        if (owner) item.ownerId = owner.id;
      }
      if (result.dueHint) {
        item.due = parseDueHint(result.dueHint, utt.timestamp);
      }
    }

    if (item.type !== ItemType.NON_SUBSTANTIVE) {
      this.items.push(item);
      this._detectConflicts(item);
      this._updateCanonicalQuestions(text);
      this._appendTimelineForItem(item);
      this.emit("item", item);
    }

    return item;
  }

  _appendTimelineForItem(item) {
    const speaker = this.participants.get(item.speakerId);
    const speakerName = speaker ? speaker.name : item.speakerId;
    const entryType = item.type === ItemType.ACTION ? "action" : item.type;
    this._pushTimeline({
      timestamp: item.timestamp,
      entryType,
      summary: `${speakerName}: ${item.text}`,
      source: "room",
      refId: item.id,
    });
  }

  appendSystemEvent(source, summary, ts = null) {
    return this._pushTimeline({ timestamp: ts || new Date(), entryType: "system_event", source, summary, refId: null });
  }

  _pushTimeline(entryFields) {
    const entry = { id: nextId("tl"), ...entryFields };
    this.timeline.push(entry);
    this.emit("timeline", entry);
    return entry;
  }

  // -- correction ---------------------------------------------------------

  recategorize(itemId, newType) {
    const item = this._getItem(itemId);
    item.type = newType;
    this.emit("item", item);
    return item;
  }

  reassignOwner(itemId, newOwnerId) {
    const item = this._getItem(itemId);
    const oldOwner = this.participants.get(item.ownerId);
    const newOwner = this.participants.get(newOwnerId);
    item.ownerId = newOwnerId;
    this._pushTimeline({
      timestamp: new Date(), entryType: "action", source: "room",
      summary: `Ownership of '${item.text}' reassigned: ${oldOwner ? oldOwner.name : "unassigned"} -> ${newOwner ? newOwner.name : newOwnerId}`,
      refId: item.id,
    });
    this.emit("item", item);
    return item;
  }

  updateActionStatus(itemId, status, source = "room") {
    const item = this._getItem(itemId);
    item.status = status;
    this._pushTimeline({
      timestamp: new Date(), entryType: "action", source,
      summary: `Action '${item.text}' -> ${status}`, refId: item.id,
    });
    this.emit("item", item);
    return item;
  }

  _getItem(itemId) {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) throw new Error(`Unknown item ${itemId}`);
    return item;
  }

  // -- conflict & gap detection --------------------------------------------

  _detectConflicts(item) {
    if (item.type !== ItemType.FACT && item.type !== ItemType.HYPOTHESIS) return;
    const lowNew = item.text.toLowerCase();
    for (const other of this.items) {
      if (other.id === item.id) continue;
      if (other.type !== ItemType.FACT && other.type !== ItemType.HYPOTHESIS) continue;
      if (item.conflictsWith.includes(other.id)) continue;
      const lowOld = other.text.toLowerCase();
      const matched = NEGATION_PAIRS.some(
        ([a, b]) => (lowNew.includes(a) && lowOld.includes(b)) || (lowNew.includes(b) && lowOld.includes(a))
      );
      if (matched && shareSubject(lowNew, lowOld)) {
        item.conflictsWith.push(other.id);
        other.conflictsWith.push(item.id);
        this._pushTimeline({
          timestamp: new Date(), entryType: "system_event", source: "aegis",
          summary: `CONFLICT DETECTED: "${other.text}" (from ${this._name(other.speakerId)}) vs "${item.text}" (from ${this._name(item.speakerId)}) — unresolved, needs human call`,
          refId: item.id,
        });
        this.emit("conflict", { a: item, b: other });
      }
    }
  }

  _name(participantId) {
    const p = this.participants.get(participantId);
    return p ? p.name : participantId;
  }

  _updateCanonicalQuestions(text) {
    const low = text.toLowerCase();
    const before = this.answeredQuestions.size;
    for (const [q, keywords] of Object.entries(QUESTION_KEYWORDS)) {
      if (keywords.some((k) => low.includes(k))) this.answeredQuestions.add(q);
    }
    if (this.answeredQuestions.size !== before) {
      this.emit("open_questions", this.openQuestions());
    }
  }

  openQuestions() {
    return CANONICAL_QUESTIONS.filter((q) => !this.answeredQuestions.has(q));
  }

  gapPromptText() {
    const gaps = this.openQuestions();
    if (gaps.length === 0) return null;
    const labels = {
      impact_scope: "impact scope (what % of users are affected)",
      start_time: "incident start time",
      affected_systems: "which systems are affected",
      customer_facing_status: "customer-facing status update",
      mitigation_owner: "who owns the mitigation/fix",
    };
    const readable = gaps.map((q) => labels[q] || q).join(", ");
    return `We still need answers on: ${readable}.`;
  }

  overdueActions(at = new Date()) {
    return this.items.filter(
      (i) => i.type === ItemType.ACTION && i.status !== ActionStatus.DONE && i.due && i.due < at
    );
  }

  applyConfidenceDecay(at = new Date()) {
    const newlyStale = [];
    for (const item of this.items) {
      if ((item.type === ItemType.HYPOTHESIS || item.type === ItemType.ASSUMPTION) && !item.stale) {
        if (at - item.timestamp > STALE_AFTER_MS) {
          item.stale = true;
          newlyStale.push(item);
          this.emit("item", item);
        }
      }
    }
    return newlyStale;
  }

  // -- views ---------------------------------------------------------------

  openActions() {
    return this.items.filter((i) => i.type === ItemType.ACTION && i.status !== ActionStatus.DONE);
  }

  unresolvedConflicts() {
    const seen = new Set();
    const pairs = [];
    for (const item of this.items) {
      const conflicts = item.conflictsWith || [];
      for (const otherId of conflicts) {
        const key = [item.id, otherId].sort().join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        pairs.push([item, this._getItem(otherId)]);
      }
    }
    return pairs;
  }

  close() {
    this.closedAt = new Date();
    this.emit("closed");
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      openedAt: this.openedAt,
      closedAt: this.closedAt,
      participants: [...this.participants.values()],
      items: this.items,
      timeline: this.timeline,
      openQuestions: this.openQuestions(),
    };
  }
}
