export const TYPE_META = {
  fact: { label: "Fact", color: "#4F7CFF", bg: "rgba(79,124,255,0.06)" },
  hypothesis: { label: "Hypothesis", color: "#635BFF", bg: "rgba(99,91,255,0.06)" },
  assumption: { label: "Assumption", color: "#F59E0B", bg: "rgba(245,158,11,0.06)" },
  decision: { label: "Decision", color: "#22A06B", bg: "rgba(34,160,107,0.06)" },
  action: { label: "Action", color: "#22C7D6", bg: "rgba(34,199,214,0.06)" },
};

export const ROLE_META = {
  incident_commander: { label: "Incident Commander", short: "IC" },
  deputy_ic: { label: "Deputy IC", short: "Dep IC" },
  engineer: { label: "Engineer", short: "Eng" },
  sre: { label: "SRE", short: "SRE" },
  database: { label: "Database", short: "DB" },
  support: { label: "Support", short: "Sup" },
  business: { label: "Business", short: "Biz" },
  unknown: { label: "Unassigned role", short: "?" },
};

export const STATUS_META = {
  open: { label: "Open", color: "#667085" },
  in_progress: { label: "In progress", color: "#4F7CFF" },
  done: { label: "Done", color: "#22A06B" },
  blocked: { label: "Blocked", color: "#E5484D" },
};
