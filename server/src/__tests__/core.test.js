/**
 * Node's built-in test runner (no extra deps). Run: npm test
 * Mirrors the Part 1 Python test suite so both implementations are
 * checked against the same behaviors.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { IncidentState, Role, ActionStatus } from "../services/incidentState.js";
import { ItemType } from "../services/classifier.js";
import { ConfirmationGate, ConfirmationDenied } from "../services/confirmationGate.js";
import { IntegrationBus } from "../services/integrations.js";
import { catchupSummary } from "../services/summary.js";

function makeState() {
  const s = new IncidentState("test-inc", "Test Incident");
  s.addParticipant("ic", "Meera", Role.INCIDENT_COMMANDER, true);
  s.addParticipant("eng", "Priya", Role.ENGINEER, true);
  return s;
}

test("classifies hypothesis", () => {
  const s = makeState();
  const item = s.ingest("eng", "I think this might be the new deploy.");
  assert.equal(item.type, ItemType.HYPOTHESIS);
});

test("classifies decision", () => {
  const s = makeState();
  const item = s.ingest("ic", "We've decided we're rolling back v2.14.");
  assert.equal(item.type, ItemType.DECISION);
});

test("action owner extraction", () => {
  const s = makeState();
  const item = s.ingest("ic", "Priya, can you check the queue depth?");
  assert.equal(item.type, ItemType.ACTION);
  assert.equal(item.ownerId, "eng");
  assert.equal(item.status, ActionStatus.OPEN);
});

test("conflict detection", () => {
  const s = makeState();
  s.ingest("eng", "The database looks healthy, connections are normal.");
  const b = s.ingest("ic", "Actually the DB connections are maxed out.");
  assert.ok(b.conflictsWith.length > 0, "expected a detected conflict");
});

test("confidence decay", () => {
  const s = makeState();
  const item = s.ingest("eng", "I think this might be the deploy.");
  assert.equal(item.stale, false);
  const later = new Date(item.timestamp.getTime() + 15 * 60 * 1000);
  const stale = s.applyConfidenceDecay(later);
  assert.ok(stale.includes(item));
  assert.equal(item.stale, true);
});

test("recategorize correction", () => {
  const s = makeState();
  const item = s.ingest("eng", "Connections look fine right now.");
  s.recategorize(item.id, ItemType.HYPOTHESIS);
  assert.equal(item.type, ItemType.HYPOTHESIS);
});

test("reassignment is logged, not silent", () => {
  const s = makeState();
  const item = s.ingest("ic", "Priya, can you check the queue depth?");
  s.addParticipant("eng2", "Sam", Role.ENGINEER, true);
  const before = s.timeline.length;
  s.reassignOwner(item.id, "eng2");
  assert.equal(item.ownerId, "eng2");
  assert.equal(s.timeline.length, before + 1);
  assert.ok(s.timeline.at(-1).summary.includes("reassigned"));
});

test("open questions shrink as covered", () => {
  const s = makeState();
  assert.equal(s.openQuestions().length, 5);
  s.ingest("eng", "60 percent of customers are affected, payment gateway started at 14:02, we're rolling back now.");
  assert.ok(s.openQuestions().length < 5);
});

test("open_questions event fires when coverage changes", () => {
  const s = makeState();
  let firedWith = null;
  s.on("open_questions", (qs) => { firedWith = qs; });
  s.ingest("eng", "60 percent of customers are affected.");
  assert.ok(Array.isArray(firedWith));
  assert.ok(firedWith.length < 5);
});

test("confirmation gate blocks unauthorized confirmer", async () => {
  const s = makeState();
  const bus = new IntegrationBus();
  const gate = new ConfirmationGate(s, bus);
  const action = gate.request("Escalate to secondary on-call", "pagerduty", "eng");
  await assert.rejects(() => gate.confirm(action.id, "eng"), ConfirmationDenied);
  assert.equal(action.executed, false);
});

test("confirmation gate allows IC", async () => {
  const s = makeState();
  const bus = new IntegrationBus();
  const gate = new ConfirmationGate(s, bus);
  const action = gate.request("Escalate to secondary on-call", "pagerduty", "ic");
  await gate.confirm(action.id, "ic");
  assert.equal(action.executed, true);
});

test("two-person rule requires second approver", async () => {
  const s = makeState();
  s.addParticipant("dep", "Arjun", Role.DEPUTY_IC, true);
  const bus = new IntegrationBus();
  const gate = new ConfirmationGate(s, bus);
  const action = gate.request("Publish customer status update", "statuspage", "ic", true);
  await gate.confirm(action.id, "ic");
  assert.equal(action.executed, false);
  await gate.confirm(action.id, "dep");
  assert.equal(action.executed, true);
});

// ============== New tests for G6, G4, G5, G7 ==============

test("G6: due-time extraction from 'in N minutes'", () => {
  const s = makeState();
  const item = s.ingest("ic", "Priya, can you check the queue depth in 10 minutes?");
  assert.equal(item.type, ItemType.ACTION);
  assert.ok(item.due instanceof Date, "item.due should be a Date");
  const diffMs = item.due.getTime() - item.timestamp.getTime();
  assert.ok(diffMs >= 9 * 60 * 1000 && diffMs <= 11 * 60 * 1000, `due should be ~10 minutes out, got ${diffMs}ms`);
});

test("G6: due-time extraction from 'by HH:MM'", () => {
  const s = makeState();
  const item = s.ingest("ic", "Priya, can you check the queue depth by 15:30?");
  assert.equal(item.type, ItemType.ACTION);
  assert.ok(item.due instanceof Date, "item.due should be a Date");
  assert.equal(item.due.getHours(), 15);
  assert.equal(item.due.getMinutes(), 30);
});

test("G4: gap prompt text when all questions open", () => {
  const s = makeState();
  const prompt = s.gapPromptText();
  assert.ok(prompt, "should return gap prompt text");
  assert.ok(prompt.includes("impact scope"), "should mention impact scope");
  assert.ok(prompt.includes("mitigation"), "should mention mitigation");
});

test("G4: gap prompt returns null when all questions answered", () => {
  const s = makeState();
  s.ingest("eng", "60 percent of customers are affected by the payment gateway that started at 14:02. Rolling back now, customer status updated on statuspage.");
  // All 5 canonical questions should now be answered
  const prompt = s.gapPromptText();
  assert.equal(prompt, null, "should return null when no gaps remain");
});

test("G5: overdueActions detects items past due", () => {
  const s = makeState();
  const item = s.ingest("ic", "Priya, can you check the queue depth in 10 minutes?");
  assert.equal(item.type, ItemType.ACTION);
  assert.ok(item.due instanceof Date, "due must be a Date for overdue test");
  // Check 20 minutes in the future — item should be overdue
  const later = new Date(item.timestamp.getTime() + 20 * 60 * 1000);
  const overdue = s.overdueActions(later);
  assert.ok(overdue.includes(item), "item should appear in overdue list");
});

test("G5: overdueActions ignores done items", () => {
  const s = makeState();
  const item = s.ingest("ic", "Priya, can you check the queue depth over the next 10 minutes?");
  s.updateActionStatus(item.id, ActionStatus.DONE);
  const later = new Date(item.timestamp.getTime() + 20 * 60 * 1000);
  const overdue = s.overdueActions(later);
  assert.ok(!overdue.includes(item), "done item should not appear in overdue list");
});

test("catchup summary returns role-tailored content", () => {
  const s = makeState();
  s.ingest("eng", "Error rate hit 40% at 14:02 per Datadog.");
  s.ingest("eng", "I think this might be the new deploy.");
  s.ingest("ic", "We've decided we're rolling back v2.14.");
  s.ingest("ic", "Priya, can you check the queue depth?");

  const bizCatchup = catchupSummary(s, "business");
  assert.ok(bizCatchup.includes("Catch-up for Business"), "business catch-up should have business header");

  const engCatchup = catchupSummary(s, "engineer");
  assert.ok(engCatchup.includes("Catch-up for Engineering"), "engineer catch-up should have eng header");

  const icCatchup = catchupSummary(s, "incident_commander");
  assert.ok(icCatchup.includes("Full catch-up"), "IC catch-up should have full header");
});

test("MonitoringAdapter normalizes Datadog-style alerts", () => {
  const adapter = new IntegrationBus().monitoring;
  
  // Datadog payload style
  const ddAlert = {
    metric: "redis.cpu",
    status: "critical",
    value: "99.8"
  };
  const norm1 = adapter.normalizeAlert(ddAlert);
  assert.equal(norm1, "redis.cpu critical: 99.8");
  
  // Generic payload style (defaults when fields are missing)
  const genericAlert = {
    text: "Database connections exhausted"
  };
  const norm2 = adapter.normalizeAlert(genericAlert);
  assert.equal(norm2, "metric alert: ?");
});

