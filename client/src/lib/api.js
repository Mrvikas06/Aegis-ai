const BASE = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  createIncident: (name) => request("/incidents", { method: "POST", body: JSON.stringify({ name }) }),
  getIncident: (id) => request(`/incidents/${id}`),
  addParticipant: (id, p) => request(`/incidents/${id}/participants`, { method: "POST", body: JSON.stringify(p) }),
  correctRole: (id, pid, role) => request(`/incidents/${id}/participants/${pid}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
  ingest: (id, speakerId, text) => request(`/incidents/${id}/utterances`, { method: "POST", body: JSON.stringify({ speakerId, text }) }),
  chat: (id, speakerId, text) => request(`/incidents/${id}/chat`, { method: "POST", body: JSON.stringify({ speakerId, text }) }),
  recategorize: (id, itemId, type) => request(`/incidents/${id}/items/${itemId}/recategorize`, { method: "PATCH", body: JSON.stringify({ type }) }),
  reassign: (id, itemId, ownerId) => request(`/incidents/${id}/items/${itemId}/owner`, { method: "PATCH", body: JSON.stringify({ ownerId }) }),
  setStatus: (id, itemId, status) => request(`/incidents/${id}/items/${itemId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  requestCriticalAction: (id, payload) => request(`/incidents/${id}/critical-actions`, { method: "POST", body: JSON.stringify(payload) }),
  confirmCriticalAction: (id, actionId, participantId) => request(`/incidents/${id}/critical-actions/${actionId}/confirm`, { method: "POST", body: JSON.stringify({ participantId }) }),
  declineCriticalAction: (id, actionId, participantId, reason) => request(`/incidents/${id}/critical-actions/${actionId}/decline`, { method: "POST", body: JSON.stringify({ participantId, reason }) }),
  getSummary: (id, role) => request(`/incidents/${id}/summary?role=${role}`),
  close: (id) => request(`/incidents/${id}/close`, { method: "POST" }),
  runDemo: (id, type = "tech") => request(`/incidents/${id}/demo/run?type=${type}`, { method: "POST" }),

  // G7: Role-tailored catch-up briefing
  getCatchup: (id, role) => request(`/incidents/${id}/catchup?role=${role}`),

  // G11: Export closeout summary as downloadable markdown
  exportSummary: async (id) => {
    const res = await fetch(`${BASE}/api/incidents/${id}/export`);
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aegis-incident-${id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // G10: Draft Jira ticket from an action item (goes through confirmation gate)
  draftJiraFromAction: (id, actionItemId, requestedBy) =>
    request(`/incidents/${id}/integrations/jira`, {
      method: "POST",
      body: JSON.stringify({ actionItemId, requestedBy }),
    }),

  // G10: Draft Statuspage update (goes through confirmation gate)
  draftStatuspageUpdate: (id, requestedBy) =>
    request(`/incidents/${id}/integrations/statuspage`, {
      method: "POST",
      body: JSON.stringify({ requestedBy }),
    }),
};

