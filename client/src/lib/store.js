import { useState, useEffect, useCallback } from "react";

// Initial Mock Data Sources
export const INITIAL_INCIDENTS = [
  {
    id: "inc-101",
    title: "Payment API Latency Spike",
    service: "api-gateway",
    severity: "CRITICAL",
    impact: "12,480 users",
    started: "12m ago",
    confidence: 98.4,
    status: "Investigating",
    assignee: "Vikas (IC)",
    summary: "Elevated P99 latency (+240%) on api-gateway due to connection pool saturation.",
  },
  {
    id: "inc-102",
    title: "Database Connection Saturation",
    service: "postgres-cluster",
    severity: "HIGH",
    impact: "7 downstream services",
    started: "24m ago",
    confidence: 94.2,
    status: "Root Cause Found",
    assignee: "Db-Oncall",
    summary: "Max connection limit (200) reached. Unoptimized batch sync query identified.",
  },
  {
    id: "inc-103",
    title: "Unusual Worker CPU Spike",
    service: "worker-cluster",
    severity: "MEDIUM",
    impact: "Worker queue lag +14%",
    started: "42m ago",
    confidence: 88.0,
    status: "Monitoring",
    assignee: "Infra-Team",
    summary: "CPU utilization spike to 84% on background worker node 3.",
  },
];

export const INITIAL_SERVICES = [
  {
    id: "api-gateway",
    name: "API Gateway",
    status: "DEGRADED",
    latency: "420ms (P99)",
    availability: "99.2%",
    riskPrediction: "HIGH (Elevated latency)",
    deps: ["postgres-cluster", "auth-service"],
  },
  {
    id: "postgres-cluster",
    name: "Postgres Cluster",
    status: "WARNING",
    latency: "84ms",
    availability: "99.8%",
    riskPrediction: "CRITICAL (Pool saturation)",
    deps: [],
  },
  {
    id: "auth-service",
    name: "Auth Service",
    status: "HEALTHY",
    latency: "12ms",
    availability: "99.99%",
    riskPrediction: "LOW (Nominal)",
    deps: ["postgres-cluster"],
  },
  {
    id: "worker-cluster",
    name: "Worker Cluster",
    status: "HEALTHY",
    latency: "32ms",
    availability: "99.95%",
    riskPrediction: "LOW",
    deps: ["postgres-cluster"],
  },
  {
    id: "payment-gateway",
    name: "Payments Engine",
    status: "DEGRADED",
    latency: "610ms",
    availability: "98.9%",
    riskPrediction: "HIGH",
    deps: ["api-gateway"],
  },
  {
    id: "notification-queue",
    name: "Notification Queue",
    status: "HEALTHY",
    latency: "8ms",
    availability: "100%",
    riskPrediction: "LOW",
    deps: ["worker-cluster"],
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "n-1",
    title: "SEV-1 Anomaly Detected",
    desc: "Payment API P99 latency increased 240% over baseline.",
    time: "2m ago",
    unread: true,
    severity: "critical",
    sourceId: "inc-101",
  },
  {
    id: "n-2",
    title: "AI Root Cause Identified",
    desc: "Postgres connection saturation correlated with 94% confidence.",
    time: "1m ago",
    unread: true,
    severity: "info",
    sourceId: "inc-102",
  },
  {
    id: "n-3",
    title: "Auto-Mitigation Verification",
    desc: "Connection pool expanded to 400. Verification in progress.",
    time: "Just now",
    unread: false,
    severity: "success",
    sourceId: "inc-101",
  },
];

export const INITIAL_TIMELINE = [
  { time: "12:42:01", event: "Anomaly detected: api-gateway P99 latency spike (842ms)", type: "alert" },
  { time: "12:42:04", event: "Aegis Triage Agent dispatched parallel sub-agents", type: "agent" },
  { time: "12:42:15", event: "Root cause identified: Postgres connection pool max limit (200/200)", type: "root_cause" },
  { time: "12:42:22", event: "Remediation plan generated: Expand max_connections to 400", type: "plan" },
  { time: "12:42:30", event: "Automated mitigation executed via Kubernetes API patch", type: "action" },
];

export const INITIAL_INTEGRATIONS = [
  { id: "jira", name: "Jira Software", status: "Connected", sync: "Auto ticket creation", category: "Issue Tracking" },
  { id: "pagerduty", name: "PagerDuty", status: "Connected", sync: "On-call escalation", category: "Alerting" },
  { id: "slack", name: "Slack", status: "Connected", sync: "#incidents-live channel feed", category: "ChatOps" },
  { id: "datadog", name: "Datadog", status: "Connected", sync: "Telemetry & APM metrics", category: "Monitoring" },
  { id: "github", name: "GitHub", status: "Connected", sync: "Deployment diff correlation", category: "VCS" },
  { id: "k8s", name: "Kubernetes", status: "Connected", sync: "Auto-remediation executor", category: "Infrastructure" },
];
