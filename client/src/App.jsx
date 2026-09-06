import React, { useState, useEffect, useCallback, useRef } from "react";
import { api } from "./lib/api";
import { socket } from "./lib/socket";
import { AgoraRTCProvider } from "agora-rtc-react";

// Navigation Views
import OverviewView from "./views/OverviewView";
import IncidentsView from "./views/IncidentsView";
import OrchestrationView from "./views/OrchestrationView";
import InvestigationsView from "./views/InvestigationsView";
import TimelineView from "./views/TimelineView";
import ServicesView from "./views/ServicesView";
import AlertsView from "./views/AlertsView";
import IntegrationsView from "./views/IntegrationsView";
import SettingsView from "./views/SettingsView";

// Core Components
import BootSequence from "./components/BootSequence";
import SideNav from "./components/SideNav";
import TopBar from "./components/TopBar";
import AIChatWorkspace, { agoraClient, RTCSessionManager } from "./components/AIChatWorkspace";
import { speakText, stopSpeaking } from "./lib/tts";
import AnalyticsSection from "./components/AnalyticsSection";
import RootCauseVisualizationModal from "./components/RootCauseVisualizationModal";
import AutoMitigationModal from "./components/AutoMitigationModal";
import ResponsePlanModal from "./components/ResponsePlanModal";
import IncidentDetailDrawer from "./components/IncidentDetailDrawer";
import CommandBarModal from "./components/CommandBarModal";
import AddScenarioModal from "./components/AddScenarioModal";

export default function App() {
  const [booted, setBooted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("commander");

  // Incident & Socket State
  const [incident, setIncident] = useState(null);
  const [connected, setConnected] = useState(socket.connected);
  const [aiState, setAiState] = useState("idle");

  // Persistent Agora Voice Call State across all tab switches
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [agentStatus, setAgentStatus] = useState("standby");
  const [errorMsg, setErrorMsg] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Shared Master Simulation Engine State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [showResolutionBanner, setShowResolutionBanner] = useState(false);

  // Modals & Drawers
  const [showRootCauseModal, setShowRootCauseModal] = useState(false);
  const [showMitigationModal, setShowMitigationModal] = useState(false);
  const [showResponsePlanModal, setShowResponsePlanModal] = useState(false);
  const [showCommandBar, setShowCommandBar] = useState(false);
  const [showAddScenarioModal, setShowAddScenarioModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Conversational AI Messages
  const [messages, setMessages] = useState([
    {
      sender: "user",
      text: "What needs my attention right now?",
    },
    {
      sender: "ai",
      text: "I've identified three incidents requiring attention. The Payment API is experiencing elevated latency, increasing 240% over the last 12 minutes. I found a potential correlation with increased database connection saturation.",
      showActions: true,
    },
  ]);

  const lastSpokenMsgRef = useRef(null);

  // Auto-speak AI responses aloud during active voice call
  useEffect(() => {
    if (!isCallActive) {
      stopSpeaking();
      return;
    }
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === "ai" && lastMsg.text !== lastSpokenMsgRef.current) {
      lastSpokenMsgRef.current = lastMsg.text;
      speakText(lastMsg.text);
    }
  }, [messages, isCallActive]);

  // Voice Call Control Handlers
  const handleStartCall = useCallback(() => {
    setErrorMsg(null);
    setAgentStatus("online");
    setIsCallActive(true);
    speakText("Agora AI Voice Commander online. How can I help resolve this incident?");
  }, []);

  const handleEndCall = useCallback(() => {
    setIsCallActive(false);
    setAgentStatus("standby");
    setAudioLevel(0);
    stopSpeaking();

    if (incident?.id) {
      const apiBase = import.meta.env.VITE_API_URL || "";
      fetch(`${apiBase}/api/agora/stop-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId: incident.id }),
      }).catch(() => {});
    }
  }, [incident]);

  // Global Keyboard Shortcuts (Cmd+K)
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandBar((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Bootstrap Incident Socket Connection
  useEffect(() => {
    const defaultInc = {
      id: "inc-payment-gateway-01",
      name: "Payment Gateway Outage",
      status: "open",
      severity: "SEV-1",
      service: "payment-gateway",
      title: "Payment Gateway Latency & DB Saturation",
      impact: "High",
      confidence: 98.4,
      started: "12m ago",
      items: [],
      timeline: [],
      participants: new Map(),
    };

    setIncident(defaultInc);

    api
      .createIncident("Payment Gateway Outage")
      .then((inc) => {
        if (inc && inc.id) {
          setIncident(inc);
          socket.emit("join_incident", inc.id);
        }
      })
      .catch((err) => {
        console.warn("[App Bootstrap Note]", err);
      });
  }, []);

  // Socket Event Listeners
  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  // MASTER SHARED INCIDENT SIMULATION ENGINE
  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    setSimulationStep(1);
    setAiState("analyzing");
    setShowResolutionBanner(false);

    let step = 1;
    const interval = setInterval(() => {
      step += 1;
      setSimulationStep(step);

      if (step === 3) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "⚡ Anomaly confirmed on api-gateway. Aegis Triage Agent has activated and dispatched parallel Logs, Metrics, and Topology sub-agents to analyze infrastructure telemetry.",
            showActions: false,
          },
        ]);
      } else if (step === 7) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "🔍 Root Cause Identified (94% confidence): Postgres connection pool max limit reached (200/200) due to unoptimized payout batch sync query.",
            showActions: true,
          },
        ]);
      } else if (step === 12) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "📋 5-Step Remediation Plan generated. Auto-mitigation prepared for execution.",
            showActions: true,
          },
        ]);
      } else if (step >= 18) {
        clearInterval(interval);
        setIsSimulating(false);
        setAiState("idle");
        setShowResolutionBanner(true);
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "✓ INCIDENT RESOLVED. All 24 infrastructure services restored to nominal health. Resolution Time: 2m 18s | AI Confidence: 98.4%.",
            showActions: false,
          },
        ]);
      }
    }, 1200);
  }, []);

  const handleActionTrigger = (actionType) => {
    if (actionType === "investigate") {
      setActiveTab("orchestration");
      if (!isSimulating) startSimulation();
    } else if (actionType === "root_cause") {
      setShowRootCauseModal(true);
    } else if (actionType === "response_plan") {
      setShowResponsePlanModal(true);
    } else if (actionType === "auto_mitigation") {
      setShowMitigationModal(true);
    }
  };

  const handleSendUserMessage = useCallback(async (text) => {
    if (!text || !text.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setAiState("analyzing");

    try {
      if (incident?.id) {
        const apiBase = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${apiBase}/api/incidents/${incident.id}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, speakerId: "user" }),
        });
        if (res.ok) {
          const data = await res.json();
          const replyText = data?.aiItem?.text || data?.aiItem?.summary;
          if (replyText) {
            setAiState("idle");
            setMessages((prev) => [
              ...prev,
              {
                sender: "ai",
                text: replyText,
                showActions: true,
              },
            ]);
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Backend chat API note:", e.message || e);
    }

    setTimeout(() => {
      setAiState("idle");
      const lower = text.toLowerCase().trim();
      let reply = `Aegis AI standing by with full read access to all 24 service telemetry streams. How can I assist you with "${text}"?`;

      if (/^(hi|hello|hey|greetings|yo|sup)$/i.test(lower)) {
        reply = "Hello! Aegis AI Incident Commander online. I am actively tracking all service dependencies and incident signals. What would you like to inspect?";
      } else if (lower.includes("status") || lower.includes("broken") || lower.includes("attention")) {
        reply = "Problem: Payment API error rate spiking at 38%. Suspected cause: Database connection pool maxed out at 200/200 limit. Active fix: Scaling DB connections to 400.";
      } else if (lower.includes("root cause") || lower.includes("why")) {
        reply = "Root Cause Analysis (94% confidence): Database connection pool exhaustion caused by unoptimized payout batch sync query locking Postgres primary.";
      } else if (lower.includes("permission") || lower.includes("access")) {
        reply = "Permission confirmed: Aegis AI is fully granted unrestricted access to read, inspect, and analyze every element of this website, live chat streams, service dependency graphs, and telemetry logs.";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: reply,
          showActions: true,
        },
      ]);
    }, 100);
  }, [incident]);

  const handleCommandSelect = (cmdId) => {
    if (cmdId === "simulate" || cmdId.startsWith("scenario:")) {
      startSimulation();
    } else if (cmdId === "root_cause") {
      setShowRootCauseModal(true);
    }
  };

  const handleExportReport = () => {
    if (!incident) return;
    const apiBase = import.meta.env.VITE_API_URL || "";
    window.open(`${apiBase}/api/incidents/${incident.id}/export`, "_blank");
  };

  const handleAddCustomScenario = (scenarioObj) => {
    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: `⚡ Custom Incident Scenario Injected: "${scenarioObj.label}" (SEV-${scenarioObj.sev}) on service [${scenarioObj.service}]. Aegis Sub-Agents activating telemetry analysis...`,
        showActions: true,
      },
    ]);
    startSimulation();
  };

  if (!booted) return <BootSequence onDone={() => setBooted(true)} />;

  return (
    <AgoraRTCProvider client={agoraClient}>
      {/* Persistent Global Agora Voice Call Session */}
      {isCallActive && (
        <RTCSessionManager
          incidentId={incident?.id}
          isLive={isCallActive}
          isMuted={isMuted}
          onReady={() => setAgentStatus("online")}
          onError={(msg) => setErrorMsg(msg)}
          onAudioLevel={(lvl) => setAudioLevel(lvl)}
          onAgentStatus={(st) => setAgentStatus(st)}
        />
      )}

      <div className="flex h-screen overflow-hidden bg-[#0C0E17] text-slate-100 font-sans">
        {/* Collapsible Left Sidebar */}
        <SideNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          connected={connected}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
          {/* Floating Top Header Bar */}
          <TopBar
            incident={incident}
            connected={connected}
            isSimulating={isSimulating}
            onStartSimulation={startSimulation}
            onOpenSearch={() => setShowCommandBar(true)}
            onRunScenario={() => startSimulation()}
            onOpenAddScenario={() => setShowAddScenarioModal(true)}
            sidebarCollapsed={sidebarCollapsed}
            isCallActive={isCallActive}
            isMuted={isMuted}
            onStartCall={handleStartCall}
            onEndCall={handleEndCall}
            onToggleMute={() => setIsMuted((p) => !p)}
          />

          {/* Scrollable Main View Content */}
          <div
            className={`flex-1 overflow-y-auto px-6 py-5 transition-all duration-200 ${
              sidebarCollapsed ? "ml-[72px]" : "ml-[240px]"
            }`}
          >
            {activeTab === "overview" && (
              <OverviewView
                isSimulating={isSimulating}
                simulationStep={simulationStep}
                showResolutionBanner={showResolutionBanner}
                onCloseResolution={() => setShowResolutionBanner(false)}
                onStartSimulation={startSimulation}
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                onQuickAction={(act, inc) => {
                  setSelectedIncident(inc);
                  if (act === "investigate") handleActionTrigger("investigate");
                }}
                onSelectService={(s) => console.log(s)}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === "commander" && (
              <div className="space-y-4 pb-6">
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h1 className="text-page-title text-white font-sans font-semibold">
                      Good evening, Vikas.
                    </h1>
                    <p className="text-body-sm text-zinc-400 font-sans mt-0.5">
                      Your systems are being actively protected by Aegis AI.
                    </p>
                  </div>
                </div>

                <AIChatWorkspace
                  incidentId={incident?.id}
                  aiState={aiState}
                  isSimulating={isSimulating}
                  simulationStep={simulationStep}
                  onActionTrigger={handleActionTrigger}
                  onSendUserMessage={handleSendUserMessage}
                  messages={messages}
                  isCallActive={isCallActive}
                  isMuted={isMuted}
                  agentStatus={agentStatus}
                  errorMsg={errorMsg}
                  audioLevel={audioLevel}
                  onStartCall={handleStartCall}
                  onEndCall={handleEndCall}
                  onToggleMute={() => setIsMuted((p) => !p)}
                />
              </div>
            )}

            {activeTab === "incidents" && (
              <IncidentsView
                onSelectIncident={(inc) => setSelectedIncident(inc)}
                onQuickAction={(act, inc) => {
                  setSelectedIncident(inc);
                  if (act === "investigate") handleActionTrigger("investigate");
                }}
                onStartSimulation={startSimulation}
              />
            )}

            {activeTab === "orchestration" && (
              <OrchestrationView
                isSimulating={isSimulating}
                simulationStep={simulationStep}
                onStartSimulation={startSimulation}
                onResetSimulation={() => {
                  setSimulationStep(0);
                  setIsSimulating(false);
                  setShowResolutionBanner(false);
                }}
              />
            )}

            {activeTab === "investigations" && <InvestigationsView />}

            {activeTab === "timeline" && <TimelineView onExport={handleExportReport} />}

            {activeTab === "services" && (
              <ServicesView onSelectService={(s) => console.log(s)} />
            )}

            {activeTab === "alerts" && (
              <AlertsView onStartSimulation={startSimulation} />
            )}

            {activeTab === "analytics" && <AnalyticsSection />}

            {activeTab === "integrations" && <IntegrationsView />}

            {activeTab === "settings" && <SettingsView />}
          </div>
        </div>

        {/* SHARED MODALS & DRAWERS */}
        <RootCauseVisualizationModal
          isOpen={showRootCauseModal}
          onClose={() => setShowRootCauseModal(false)}
        />

        <AutoMitigationModal
          isOpen={showMitigationModal}
          onClose={() => setShowMitigationModal(false)}
          onConfirm={() => {
            setShowMitigationModal(false);
            setShowResolutionBanner(true);
          }}
        />

        <ResponsePlanModal
          isOpen={showResponsePlanModal}
          onClose={() => setShowResponsePlanModal(false)}
          onExecutePlan={() => {
            setShowResponsePlanModal(false);
            setShowMitigationModal(true);
          }}
        />

        <IncidentDetailDrawer
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onExecuteMitigation={() => {
            setSelectedIncident(null);
            setShowMitigationModal(true);
          }}
        />

        <CommandBarModal
          isOpen={showCommandBar}
          onClose={() => setShowCommandBar(false)}
          onSelectCommand={handleCommandSelect}
        />

        <AddScenarioModal
          isOpen={showAddScenarioModal}
          onClose={() => setShowAddScenarioModal(false)}
          onAddScenario={handleAddCustomScenario}
        />
      </div>
    </AgoraRTCProvider>
  );
}
