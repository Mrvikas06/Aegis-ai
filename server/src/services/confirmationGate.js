/**
 * ConfirmationGate — ports app/confirmation.py.
 * No path from "proposed" to "executed" skips confirm(), and confirm()
 * refuses anyone who isn't a recognized IC/deputy IC.
 */
let idCounter = 1;
const nextId = () => `ca-${String(idCounter++).padStart(4, "0")}`;

export class ConfirmationDenied extends Error {}

export class ConfirmationGate {
  constructor(state, integrations) {
    this.state = state;
    this.integrations = integrations;
    this.pending = new Map();
    this.executors = new Map(); // integration -> (action) => void
  }

  registerExecutor(integration, fn) {
    this.executors.set(integration, fn);
  }

  request(description, integration, requestedBy, twoPerson = false) {
    const action = {
      id: nextId(), description, integration, requestedBy,
      requiresTwoPerson: twoPerson, confirmedBy: [], declined: false, executed: false,
      createdAt: new Date(),
    };
    this.pending.set(action.id, action);
    this.state._pushTimeline({
      timestamp: action.createdAt, entryType: "system_event", source: "aegis",
      summary: `PROPOSED (needs confirmation): ${description}`, refId: action.id,
    });
    this.state.emit("critical_action", action);
    return action;
  }

  async confirm(actionId, confirmingParticipantId) {
    const action = this.pending.get(actionId);
    if (!action) throw new Error(`Unknown critical action ${actionId}`);

    if (!this.state.canConfirmCriticalActions(confirmingParticipantId)) {
      this._logDecline(action, confirmingParticipantId, "not an authorized confirmer");
      throw new ConfirmationDenied(
        `${confirmingParticipantId} is not a recognized IC/deputy IC and cannot confirm critical actions.`
      );
    }

    if (!action.confirmedBy.includes(confirmingParticipantId)) {
      action.confirmedBy.push(confirmingParticipantId);
    }

    const required = action.requiresTwoPerson ? 2 : 1;
    if (action.confirmedBy.length < required) {
      this.state._pushTimeline({
        timestamp: new Date(), entryType: "system_event", source: "aegis",
        summary: `Confirmation ${action.confirmedBy.length}/${required} received for '${action.description}' from ${confirmingParticipantId}`,
        refId: action.id,
      });
      this.state.emit("critical_action", action);
      return action;
    }

    await this._execute(action);
    return action;
  }

  decline(actionId, participantId, reason = "") {
    const action = this.pending.get(actionId);
    action.declined = true;
    this._logDecline(action, participantId, reason || "declined");
    this.state.emit("critical_action", action);
    return action;
  }

  async _execute(action) {
    action.executed = true;
    const executor = this.executors.get(action.integration);
    if (executor) await executor(action);
    this.state._pushTimeline({
      timestamp: new Date(), entryType: "confirmation", source: "aegis",
      summary: `EXECUTED: '${action.description}' via ${action.integration} (confirmed by: ${action.confirmedBy.join(", ")})`,
      refId: action.id,
    });
    this.state.emit("critical_action", action);
  }

  _logDecline(action, participantId, reason) {
    this.state._pushTimeline({
      timestamp: new Date(), entryType: "system_event", source: "aegis",
      summary: `DECLINED/BLOCKED: '${action.description}' by ${participantId} (${reason})`,
      refId: action.id,
    });
  }
}
