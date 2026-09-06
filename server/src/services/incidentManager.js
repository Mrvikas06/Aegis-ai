/**
 * IncidentManager — in-memory registry of open incidents (keyed by id),
 * each with its own IncidentState / ConfirmationGate / IntegrationBus.
 * A production build would rehydrate this from Mongo on boot; for this
 * build a fresh registry starts empty and incidents are created via the API.
 */
import { IncidentState } from "./incidentState.js";
import { ConfirmationGate } from "./confirmationGate.js";
import { IntegrationBus } from "./integrations.js";
import { persist } from "./persistence.js";
import { LullSummaryScheduler } from "./lullScheduler.js";

let idCounter = 1;
const nextId = () => `inc-${String(idCounter++).padStart(3, "0")}`;

class Incident {
  constructor(name, io) {
    this.state = new IncidentState(nextId(), name);
    this.integrations = new IntegrationBus();
    this.gate = new ConfirmationGate(this.state, this.integrations);
    this.gate.registerExecutor("pagerduty", (a) => this.integrations.pagerduty.escalate(this.state.name, a.description));
    this.gate.registerExecutor("statuspage", (a) => this.integrations.statuspage.draftUpdate([a.description]));
    this.gate.registerExecutor("jira", (a) => this.integrations.jira.createTicketFromAction(this.state.name, a.description, a.requestedBy));

    persist.incident(this.state);
    this.state.on("participant", (p) => persist.participant(this.state.id, p));
    this.state.on("item", (item) => persist.knowledgeItem(this.state.id, item));
    this.state.on("timeline", (entry) => persist.timelineEntry(this.state.id, entry));
    this.state.on("critical_action", (action) => persist.criticalAction(this.state.id, action));

    this.scheduler = io ? new LullSummaryScheduler(this.state, io) : null;
    this.scheduler?.start();
    this.state.on("closed", () => this.scheduler?.stop());

    if (io) {
      this.state.on("open_questions", (questions) => io.to(this.state.id).emit("open_questions", questions));

      // G3: Forward timeline events to socket clients
      this.state.on("timeline", (entry) => io.to(this.state.id).emit("timeline", entry));

      // G14: Confidence decay scheduler — every 60s, flag stale hypotheses/assumptions
      this._decayInterval = setInterval(() => {
        const stale = this.state.applyConfidenceDecay();
        stale.forEach((item) => io.to(this.state.id).emit("item", item));
      }, 60_000);

      // G5: Action nudge scheduler — every 30s, check for overdue action items
      this._nudgeInterval = setInterval(() => {
        const overdue = this.state.overdueActions();
        for (const item of overdue) {
          // Only nudge once per item per cycle (tracked via a transient flag)
          if (item._lastNudge && Date.now() - item._lastNudge < 120_000) continue;
          item._lastNudge = Date.now();
          const owner = this.state.participants.get(item.ownerId);
          const ownerName = owner ? owner.name : "Unassigned";
          const summary = `NUDGE: Action "${item.text}" (owner: ${ownerName}) was due and has no update yet.`;
          this.state.appendSystemEvent("aegis", summary);
          io.to(this.state.id).emit("nudge", { itemId: item.id, text: item.text, ownerName, summary });
        }
      }, 30_000);

      this.state.on("closed", () => {
        clearInterval(this._decayInterval);
        clearInterval(this._nudgeInterval);
      });
    }
  }
}

export class IncidentManager {
  constructor() {
    this.incidents = new Map();
    this.io = null; // set once via attachIO() from index.js
  }

  attachIO(io) {
    this.io = io;
  }

  create(name) {
    const incident = new Incident(name, this.io);
    this.incidents.set(incident.state.id, incident);
    return incident;
  }

  get(id) {
    let incident = this.incidents.get(id);
    if (!incident) {
      incident = this.create(id ? `Incident ${id}` : "Payment Gateway Outage");
    }
    return incident;
  }

  list() {
    return [...this.incidents.values()].map((i) => ({
      id: i.state.id, name: i.state.name, openedAt: i.state.openedAt, closedAt: i.state.closedAt,
    }));
  }
}

export const incidentManager = new IncidentManager();
