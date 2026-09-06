/**
 * MongoDB is used for durable storage/audit history (NFR-9, NFR-18) — the
 * hot path for a live incident runs in memory for speed (see incidentState.js)
 * and writes through here. If MONGO_URI isn't set (e.g. local demo without
 * a Mongo instance available), the app runs fully functional in
 * memory-only mode and logs a clear warning instead of crashing — an
 * incident room tool should never go down because its database is
 * unreachable (NFR-4 in spirit).
 */
import mongoose from "mongoose";
import {
  ParticipantModel, KnowledgeItemModel, TimelineEntryModel,
  CriticalActionModel, IncidentModel,
} from "../models/schemas.js";

let connected = false;

export async function connectMongo(uri) {
  if (!uri) {
    console.warn("[persistence] MONGO_URI not set — running in memory-only mode (no durable storage).");
    return false;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    connected = true;
    console.log("[persistence] connected to MongoDB");
    return true;
  } catch (err) {
    console.warn(`[persistence] could not connect to MongoDB (${err.message}) — continuing in memory-only mode.`);
    return false;
  }
}

export function isPersistenceEnabled() {
  return connected;
}

/** Fire-and-forget write-through helpers. Never let a persistence hiccup break the live room. */
export const persist = {
  async incident(incident) {
    if (!connected) return;
    try {
      await IncidentModel.findOneAndUpdate(
        { incidentId: incident.id },
        { incidentId: incident.id, name: incident.name, openedAt: incident.openedAt, closedAt: incident.closedAt },
        { upsert: true }
      );
    } catch (e) { console.warn("[persistence] incident write failed:", e.message); }
  },

  async participant(incidentId, p) {
    if (!connected) return;
    try {
      await ParticipantModel.findOneAndUpdate(
        { incidentId, participantId: p.id },
        { incidentId, participantId: p.id, name: p.name, role: p.role, roleConfirmed: p.roleConfirmed },
        { upsert: true }
      );
    } catch (e) { console.warn("[persistence] participant write failed:", e.message); }
  },

  async knowledgeItem(incidentId, item) {
    if (!connected) return;
    try {
      await KnowledgeItemModel.findOneAndUpdate(
        { itemId: item.id },
        {
          itemId: item.id, incidentId, type: item.type, text: item.text,
          speakerId: item.speakerId, sourceUtteranceId: item.sourceUtteranceId,
          confidence: item.confidence, stale: item.stale, ownerId: item.ownerId,
          due: item.due, status: item.status, conflictsWith: item.conflictsWith,
          timestamp: item.timestamp,
        },
        { upsert: true }
      );
    } catch (e) { console.warn("[persistence] knowledge item write failed:", e.message); }
  },

  async timelineEntry(incidentId, entry) {
    if (!connected) return;
    try {
      await TimelineEntryModel.findOneAndUpdate(
        { entryId: entry.id },
        {
          entryId: entry.id, incidentId, timestamp: entry.timestamp,
          entryType: entry.entryType, summary: entry.summary, source: entry.source, refId: entry.refId,
        },
        { upsert: true }
      );
    } catch (e) { console.warn("[persistence] timeline write failed:", e.message); }
  },

  async criticalAction(incidentId, action) {
    if (!connected) return;
    try {
      await CriticalActionModel.findOneAndUpdate(
        { actionId: action.id },
        {
          actionId: action.id, incidentId, description: action.description,
          integration: action.integration, requestedBy: action.requestedBy,
          requiresTwoPerson: action.requiresTwoPerson, confirmedBy: action.confirmedBy,
          declined: action.declined, executed: action.executed,
        },
        { upsert: true }
      );
    } catch (e) { console.warn("[persistence] critical action write failed:", e.message); }
  },
};
