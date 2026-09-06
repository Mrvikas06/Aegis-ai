/**
 * Mongoose schemas — the "M" in MERN.
 *
 * These mirror app/models.py from the Part 1 Python build 1:1 in shape.
 * The live, real-time source of truth for an *open* incident is the
 * in-memory IncidentState (services/incidentState.js) for latency reasons
 * (FR-2: <2s transcription-to-classification). Every mutation is also
 * written through to Mongo here so incidents are durable, queryable, and
 * survive a server restart — see services/persistence.js for the write-through.
 */
import mongoose from "mongoose";

const { Schema } = mongoose;

const ParticipantSchema = new Schema(
  {
    participantId: { type: String, required: true },
    incidentId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["incident_commander", "deputy_ic", "engineer", "support", "business", "unknown"],
      default: "unknown",
    },
    roleConfirmed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const KnowledgeItemSchema = new Schema(
  {
    itemId: { type: String, required: true, unique: true },
    incidentId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["fact", "hypothesis", "assumption", "decision", "action", "non_substantive"],
      required: true,
    },
    text: { type: String, required: true },
    speakerId: { type: String, required: true },
    sourceUtteranceId: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
    stale: { type: Boolean, default: false },
    ownerId: { type: String, default: null },
    due: { type: Date, default: null },
    status: { type: String, enum: ["open", "in_progress", "done", "blocked", null], default: null },
    conflictsWith: [{ type: String }],
    timestamp: { type: Date, required: true },
  },
  { timestamps: true }
);

const TimelineEntrySchema = new Schema(
  {
    entryId: { type: String, required: true, unique: true },
    incidentId: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true },
    entryType: { type: String, required: true },
    summary: { type: String, required: true },
    source: { type: String, required: true },
    refId: { type: String, default: null },
  },
  { timestamps: true }
);

const CriticalActionSchema = new Schema(
  {
    actionId: { type: String, required: true, unique: true },
    incidentId: { type: String, required: true, index: true },
    description: { type: String, required: true },
    integration: { type: String, required: true },
    requestedBy: { type: String, required: true },
    requiresTwoPerson: { type: Boolean, default: false },
    confirmedBy: [{ type: String }],
    declined: { type: Boolean, default: false },
    executed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const IncidentSchema = new Schema(
  {
    incidentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    openedAt: { type: Date, required: true },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const ParticipantModel = mongoose.model("Participant", ParticipantSchema);
export const KnowledgeItemModel = mongoose.model("KnowledgeItem", KnowledgeItemSchema);
export const TimelineEntryModel = mongoose.model("TimelineEntry", TimelineEntrySchema);
export const CriticalActionModel = mongoose.model("CriticalAction", CriticalActionSchema);
export const IncidentModel = mongoose.model("Incident", IncidentSchema);
