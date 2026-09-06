/**
 * Integration adapters (FR-26..FR-31).
 *
 * Each adapter calls the real API when its env vars are present, and
 * falls back to logging ("dry run") otherwise — same graceful-degrade
 * pattern as persistence.js and agora/tokenService.js, so the app is
 * always demoable and never crashes for missing credentials (NFR-4).
 */
class LoggingAdapter {
  constructor(name) {
    this.name = name;
    this.calls = [];
  }
  _record(action, payload, dryRun, result = null, error = null) {
    const call = { integration: this.name, action, payload, dryRun, result, error, at: new Date() };
    this.calls.push(call);
    return call;
  }
}

export class JiraAdapter extends LoggingAdapter {
  constructor() {
    super("jira");
    this.baseUrl = process.env.JIRA_BASE_URL;
    this.email = process.env.JIRA_EMAIL;
    this.token = process.env.JIRA_API_TOKEN;
    this.projectKey = process.env.JIRA_PROJECT_KEY || "INC";
  }
  get configured() { return Boolean(this.baseUrl && this.email && this.token); }

  async createTicketFromAction(incidentId, actionText, ownerName) {
    const payload = {
      fields: {
        project: { key: this.projectKey },
        summary: actionText,
        issuetype: { name: "Task" },
        labels: [`incident:${incidentId}`],
        description: `Auto-drafted by Aegis from a live incident action item. Suggested owner: ${ownerName}.`,
      },
    };
    if (!this.configured) return this._record("create_issue", payload, true);
    try {
      const res = await fetch(`${this.baseUrl}/rest/api/3/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${this.email}:${this.token}`).toString("base64")}`,
        },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      return this._record("create_issue", payload, false, body, res.ok ? null : body);
    } catch (e) {
      return this._record("create_issue", payload, false, null, e.message);
    }
  }
}

export class PagerDutyAdapter extends LoggingAdapter {
  constructor() {
    super("pagerduty");
    this.routingKey = process.env.PAGERDUTY_ROUTING_KEY;
  }
  get configured() { return Boolean(this.routingKey); }

  async escalate(incidentId, reason) {
    const payload = {
      routing_key: this.routingKey,
      event_action: "trigger",
      payload: { summary: reason, source: "aegis", severity: "critical", custom_details: { incidentId } },
    };
    if (!this.configured) return this._record("trigger_escalation", { incidentId, reason }, true);
    try {
      const res = await fetch("https://events.pagerduty.com/v2/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      return this._record("trigger_escalation", { incidentId, reason }, false, body, res.ok ? null : body);
    } catch (e) {
      return this._record("trigger_escalation", { incidentId, reason }, false, null, e.message);
    }
  }

  async getOnCall(schedule) {
    return this._record("get_on_call", { schedule }, !this.configured);
  }
}

export class SlackAdapter extends LoggingAdapter {
  constructor() {
    super("slack");
    this.botToken = process.env.SLACK_BOT_TOKEN;
  }
  get configured() { return Boolean(this.botToken); }

  async postStatus(channel, text) {
    const payload = { channel, text };
    if (!this.configured) return this._record("post_message", payload, true);
    try {
      const res = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.botToken}` },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      return this._record("post_message", payload, false, body, body.ok ? null : body.error);
    } catch (e) {
      return this._record("post_message", payload, false, null, e.message);
    }
  }
}

export class MonitoringAdapter extends LoggingAdapter {
  constructor(provider = "datadog") { super(`monitoring:${provider}`); }
  normalizeAlert(raw) {
    return `${raw.metric || "metric"} ${raw.status || "alert"}: ${raw.value ?? "?"}`;
  }
}

export class StatuspageAdapter extends LoggingAdapter {
  constructor() {
    super("statuspage");
    this.apiKey = process.env.STATUSPAGE_API_KEY;
    this.pageId = process.env.STATUSPAGE_PAGE_ID;
  }
  get configured() { return Boolean(this.apiKey && this.pageId); }

  async draftUpdate(confirmedFactTexts) {
    const payload = { incident: { name: "Ongoing incident", status: "investigating", body: confirmedFactTexts.join(" ") } };
    if (!this.configured) return this._record("draft_incident_update", payload, true);
    try {
      const res = await fetch(`https://api.statuspage.io/v1/pages/${this.pageId}/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `OAuth ${this.apiKey}` },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      return this._record("draft_incident_update", payload, false, body, res.ok ? null : body);
    } catch (e) {
      return this._record("draft_incident_update", payload, false, null, e.message);
    }
  }
}

export class IntegrationBus {
  constructor() {
    this.jira = new JiraAdapter();
    this.pagerduty = new PagerDutyAdapter();
    this.slack = new SlackAdapter();
    this.monitoring = new MonitoringAdapter();
    this.statuspage = new StatuspageAdapter();
  }
  allCalls() {
    return [this.jira, this.pagerduty, this.slack, this.monitoring, this.statuspage].flatMap((a) => a.calls);
  }
  configuredStatus() {
    return {
      jira: this.jira.configured, pagerduty: this.pagerduty.configured,
      slack: this.slack.configured, statuspage: this.statuspage.configured,
    };
  }
}
