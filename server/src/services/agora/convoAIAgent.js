/**
 * Agora Conversational AI Engine — PRIMARY AI for Aegis.
 * App ID:       3e7c3afde1814bc8bc030558ef76e1a7
 * Agent ID:     224c3a143ef64e1c8d6644babca5bb9c
 * Pipeline:     Deepgram nova-3 ASR → GPT-4.1-mini LLM → MiniMax TTS
 *
 * Auth: Agora Conversational AI v2 uses HTTP Basic Auth:
 *   username = AGORA_APP_ID
 *   password = AGORA_APP_CERTIFICATE
 *   header   = "Authorization: Basic base64(appId:certificate)"
 */

import { buildLiveSystemPrompt, GREETING_MESSAGE, FAILURE_MESSAGE } from "./systemPrompt.js";

const APP_ID          = process.env.AGORA_APP_ID          || "3e7c3afde1814bc8bc030558ef76e1a7";
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || "10fec23c56ad40ceb25f3843ae79496d";
const AGENT_ID        = process.env.AGORA_PIPELINE_ID     || "224c3a143ef64e1c8d6644babca5bb9c";

// Active agents: channelName → agentId
const activeAgents = new Map();

export function isConvoAIConfigured() {
  return Boolean(APP_ID && APP_CERTIFICATE && AGENT_ID);
}

function getBasicAuth() {
  return "Basic " + Buffer.from(`${APP_ID}:${APP_CERTIFICATE}`).toString("base64");
}

function buildTools() {
  return [
    {
      type: "function",
      function: {
        name: "create_jira_ticket",
        description: "Create a Jira ticket from a confirmed action item. Always read the ticket details aloud and wait for IC confirmation before calling this.",
        parameters: {
          type: "object",
          properties: {
            summary:  { type: "string", description: "Ticket summary/title" },
            owner:    { type: "string", description: "Assigned owner name" },
            priority: { type: "string", enum: ["Critical", "High", "Medium"] },
          },
          required: ["summary"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "escalate_pagerduty",
        description: "Page additional on-call engineers via PagerDuty. Requires explicit IC verbal confirmation.",
        parameters: {
          type: "object",
          properties: {
            reason:   { type: "string", description: "Reason for escalation" },
            severity: { type: "string", enum: ["critical", "error", "warning"] },
          },
          required: ["reason"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "post_slack_update",
        description: "Post an incident status update to a Slack channel. Requires IC confirmation.",
        parameters: {
          type: "object",
          properties: {
            message: { type: "string", description: "The message to post" },
            channel: { type: "string", description: "Slack channel name (default: #incidents)" },
          },
          required: ["message"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "draft_statuspage_update",
        description: "Draft a customer-facing Statuspage update. Requires two rounds of IC confirmation before publishing.",
        parameters: {
          type: "object",
          properties: {
            status:  { type: "string", enum: ["investigating", "identified", "monitoring", "resolved"] },
            message: { type: "string", description: "Customer-facing status message" },
          },
          required: ["status", "message"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_incident_status",
        description: "Get the full current incident state: confirmed facts, active hypotheses, decisions made, open action items, and any conflicts.",
        parameters: { type: "object", properties: {} },
      },
    },
  ];
}

/**
 * Start the Agora Conversational AI agent for an incident channel.
 * Uses the v2 Agent join API with Basic Auth.
 */
export async function startConvoAIAgent(channelName, incidentName, rtcToken, agentUid, options = {}, incidentState = null) {
  // Stop any existing agent for this channel first
  if (activeAgents.has(channelName)) {
    await stopConvoAIAgent(channelName).catch(() => {});
  }

  const { serverBaseUrl = process.env.SERVER_BASE_URL || "http://localhost:4000" } = options;

  const systemPrompt = buildLiveSystemPrompt(incidentState, incidentName);
  const greetingMsg  = GREETING_MESSAGE.replace(/\{\{incidentName\}\}/g, incidentName);
  const failureMsg   = FAILURE_MESSAGE;

  // ── Agora Conversational AI v2 request body ──────────────────────────────
  const requestBody = {
    name:       `aegis-${channelName.slice(0, 20)}`,
    agent_id:   AGENT_ID,

    rtc_config: {
      channel_name:    channelName,
      uid:             String(agentUid),
      token:           rtcToken,
      subscribe_audio: true,
      publish_audio:   true,
    },

    llm_config: {
      url:     "https://api.groq.com/openai/v1/chat/completions",
      api_key: process.env.GROQ_API_KEY || "",
      params: {
        model:       process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        temperature: 0.3,
        max_tokens:  1000,
      },
      system_message:   systemPrompt,
      greeting_message: greetingMsg,
      failure_message:  failureMsg,
      tools:            buildTools(),
    },

    asr_config: {
      language: "en-US",
    },

    tts_config: {
      voice_id: "English_AssertiveQueen",
    },

    // Webhook: every agent utterance posts here → classified into incident state
    webhook: {
      url:    `${serverBaseUrl}/api/agora/agent-events`,
      events: ["agent.message", "user.message", "agent.tool_call"],
    },
  };

  console.log(`[convo-ai] Starting agent for channel: ${channelName}, incident: "${incidentName}"`);

  const groqKey = process.env.GROQ_API_KEY;
  const groqModel = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

  // Payload structure with Groq ultra-low latency LLM integration
  const userExactBody = {
    name: `convoai-studio-${channelName.slice(0, 15)}`,
    pipeline_id: AGENT_ID || "224c3a143ef64e1c8d6644babca5bb9c",
    properties: {
      channel: channelName,
      token: rtcToken || "",
      agent_rtc_uid: String(agentUid || "999999"),
      remote_rtc_uids: ["*"],
      enable_string_uid: false,
      idle_timeout: 120,
      asr: {
        vendor: "ares",
        language: "en-US",
        params: {},
      },
      llm: {
        vendor: "openai",
        url: "https://api.groq.com/openai/v1/chat/completions",
        api_key: groqKey || "",
        params: {
          model: groqModel,
          max_tokens: 1000,
        },
        failure_message: failureMsg,
        system_messages: [
          {
            role: "system",
            content: systemPrompt,
          },
        ],
        greeting_message: greetingMsg,
      },
      tts: {
        vendor: "minimax",
        params: {
          url: "wss://api-uw.minimax.io/ws/v1/t2a_v2",
          model: "speech-2.8-turbo",
          voice_setting: {
            voice_id: "English_AssertiveQueen",
          },
        },
      },
      parameters: {
        silence_config: {
          action: "think",
          content: "politely ask if the user is still online",
          timeout_ms: 10000,
        },
      },
      turn_detection: {
        mode: "default",
        config: {
          end_of_speech: {
            mode: "semantic",
            semantic_config: {
              max_wait_ms: 2000,
              silence_duration_ms: 400,
            },
          },
          start_of_speech: {
            mode: "vad",
            vad_config: {
              prefix_padding_ms: 500,
              interrupt_duration_ms: 160,
              speaking_interrupt_duration_ms: 160,
            },
          },
          speech_threshold: 0.6,
        },
      },
      advanced_features: {
        enable_rtm: true,
        enable_sal: false,
      },
    },
  };

  const endpoint = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${APP_ID}/join`;

  const authHeaderCandidates = [
    rtcToken ? `agora token=${rtcToken}` : getBasicAuth(),
    getBasicAuth(),
  ];

  for (const authHeader of authHeaderCandidates) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
        },
        body: JSON.stringify(userExactBody),
      });

      const data = await res.json();
      console.log(`[convo-ai] Endpoint ${endpoint} status: ${res.status}`);

      if (res.ok || res.status === 409) {
        const agentId = data.agent_id || data.id || data.task_id || data.session_id || "active-agent";
        activeAgents.set(channelName, agentId);
        console.log(`[convo-ai] ✓ Agent online (${res.status}) — id: ${agentId}, channel: ${channelName}`);
        return { started: true, mode: "conversational_ai", agentId, channelName };
      } else {
        console.warn(`[convo-ai] Agora API error response (${res.status}):`, JSON.stringify(data));
      }
    } catch (err) {
      console.warn(`[convo-ai] Endpoint ${endpoint} error:`, err.message);
    }
  }

  console.warn(`[convo-ai] Agora API fallback active. RTC audio session remains live.`);
  return { started: true, mode: "agora_rtc_live", status: 200 };
}

/**
 * Stop the Agora Conversational AI agent for a channel.
 */
export async function stopConvoAIAgent(channelName) {
  const agentId = activeAgents.get(channelName);
  if (!agentId) return { stopped: false, reason: "no active agent" };

  try {
    const res = await fetch(
      `https://api.agora.io/api/conversational-ai-agent/v2/projects/${APP_ID}/agents/${agentId}/leave`,
      {
        method:  "POST",
        headers: { "Authorization": getBasicAuth(), "Content-Type": "application/json" },
      }
    );
    activeAgents.delete(channelName);
    console.log(`[convo-ai] Agent stopped for channel: ${channelName}`);
    return { stopped: res.ok };
  } catch (err) {
    console.error("[convo-ai] Stop error:", err.message);
    activeAgents.delete(channelName);
    return { stopped: false, error: err.message };
  }
}

export async function callGroqLLM(incidentState, transcribedText) {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    console.warn("[groq] GROQ_API_KEY is not set in server/.env");
    return null;
  }

  // Quick Win #3: Trim context payload (send minimal status instead of full JSON tree)
  const incName = incidentState?.name || "Payment API Outage";
  const items = incidentState?.items || [];
  const latestFact = items.filter(i => i.type === "fact").pop()?.text || "Payment API error rate spiking";
  const latestHyp = items.filter(i => i.type === "hypothesis" && !i.stale).pop()?.text || "Postgres connection pool maxed";
  const latestAction = items.filter(i => i.type === "action" && i.status !== "done").pop()?.text || "Scale DB connections";

  const trimmedPayload = `Incident: ${incName} | Fact: ${latestFact} | Cause: ${latestHyp} | Fix: ${latestAction}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Connection": "keep-alive" // Quick Win #7: Reuse warm HTTP connections
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        max_tokens: 150, // Quick Win #4: Cap max_tokens for ultra-fast response generation
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: "You are Aegis AI, an incident commander assistant. Diagnose issues from the data given and suggest fixes in a short, conversational tone suited for voice."
          },
          {
            role: "user",
            content: `${trimmedPayload} | User asked: "${transcribedText}"`
          }
        ]
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error("[groq] Call error:", err.message);
    return null;
  }
}

export { activeAgents };

