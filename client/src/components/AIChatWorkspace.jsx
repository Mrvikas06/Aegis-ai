import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Search,
  FileText,
  ShieldCheck,
  ChevronDown,
  Bot,
  User,
  AlertCircle,
  Send,
  Radio,
  Activity,
  Waves,
} from "lucide-react";
import AgoraRTC, {
  AgoraRTCProvider,
  useJoin,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteAudioTracks,
  useRemoteUsers,
} from "agora-rtc-react";
import ServicesFlowchart from "./ServicesFlowchart";
import { socket } from "../lib/socket";
import { createSTT } from "../lib/stt";

// Shared Agora RTC Client
export const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
AgoraRTC.setLogLevel(4);

// ── Inner RTC Session Component ─────────────────────────────────────────────
export function RTCSessionManager({
  incidentId,
  isLive,
  isMuted,
  onReady,
  onError,
  onAudioLevel,
  onAgentStatus,
}) {
  const [joinConfig, setJoinConfig] = useState(null);
  const levelTimer = useRef(null);

  useEffect(() => {
    if (!isLive) {
      setJoinConfig(null);
      return;
    }

    const uid = Math.floor(Math.random() * 800000) + 100000;
    const targetIncidentId = incidentId || "default-incident";

    const apiBase = import.meta.env.VITE_API_URL || "";
    fetch(`${apiBase}/api/agora/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incidentId: targetIncidentId, uid, participantId: "p1" }),
    })
      .then((r) => r.json())
      .then(async (data) => {
        const validToken = data.rtc?.token && data.rtc.token !== "demo" ? data.rtc.token : null;
        const config = {
          appid: data.appId || "3e7c3afde1814bc8bc030558ef76e1a7",
          channel: data.channel || targetIncidentId,
          token: validToken,
          uid: data.uid || uid,
        };
        setJoinConfig(config);
        onAgentStatus?.("online");
        onReady?.();

        try {
          await fetch(`${apiBase}/api/agora/start-agent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ incidentId: targetIncidentId }),
          });
        } catch (e) {
          console.warn("Agent start call note:", e);
        }
      })
      .catch((err) => {
        console.warn("Token fetch note:", err);
        setJoinConfig({
          appid: "3e7c3afde1814bc8bc030558ef76e1a7",
          channel: targetIncidentId,
          token: null,
          uid,
        });
        onAgentStatus?.("online");
        onReady?.();
      });
  }, [isLive, incidentId]);

  const shouldJoin = Boolean(isLive && joinConfig && joinConfig.appid);

  useJoin(
    joinConfig || { appid: "", channel: "", token: null, uid: 0 },
    shouldJoin
  );

  const { localMicrophoneTrack, error: micErr } = useLocalMicrophoneTrack(shouldJoin);

  useEffect(() => {
    if (micErr) {
      console.warn("Microphone access note:", micErr.message || micErr);
    }
  }, [micErr]);

  useEffect(() => {
    if (localMicrophoneTrack) {
      try {
        localMicrophoneTrack.setEnabled(!isMuted);
      } catch (_) {}
    }
  }, [localMicrophoneTrack, isMuted]);

  usePublish(
    localMicrophoneTrack ? [localMicrophoneTrack] : [],
    Boolean(shouldJoin && localMicrophoneTrack)
  );

  useEffect(() => {
    if (!isLive) return;
    levelTimer.current = setInterval(() => {
      const micLvl = localMicrophoneTrack?.getVolumeLevel?.() ?? 0;
      const simLvl = Math.random() * 0.35 + 0.15;
      onAudioLevel?.(micLvl > 0.05 ? micLvl : simLvl);
    }, 80);
    return () => clearInterval(levelTimer.current);
  }, [isLive, localMicrophoneTrack, onAudioLevel]);

  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  useEffect(() => {
    if (audioTracks && audioTracks.length > 0) {
      audioTracks.forEach((t) => {
        try {
          t.play();
        } catch (e) {
          console.warn("Remote audio play note:", e);
        }
      });
    }
  }, [audioTracks]);

  return null;
}

// ── Main Exported Component ─────────────────────────────────────────────────
export default function AIChatWorkspace({
  incidentId,
  aiState = "idle",
  isSimulating = false,
  simulationStep = 0,
  onActionTrigger,
  onSendUserMessage,
  messages = [],
  isCallActive = false,
  isMuted = false,
  agentStatus = "standby",
  errorMsg = null,
  audioLevel = 0,
  onStartCall,
  onEndCall,
  onToggleMute,
}) {
  const [inputText, setInputText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [speechVol, setSpeechVol] = useState(0);
  const chatEndRef = useRef(null);
  const BARS = [0.3, 0.7, 0.45, 0.9, 0.6, 0.95, 0.4, 0.8, 0.5, 1.0, 0.75, 0.4, 0.85, 0.55];

  // Continuous Browser Speech Recognition when Voice Call is active & unmuted
  useEffect(() => {
    if (!isCallActive || isMuted) {
      setInterimText("");
      setSpeechVol(0);
      return;
    }

    const stt = createSTT({
      onResult: ({ text, isFinal }) => {
        if (isFinal) {
          setInterimText("");
          setSpeechVol(0);
          if (text && text.trim()) {
            onSendUserMessage?.(text.trim());
          }
        } else {
          setInterimText(text);
          setSpeechVol(Math.random() * 0.5 + 0.4);
        }
      },
      onWakeWord: (query) => {
        setInterimText("");
        onSendUserMessage?.(query || "status");
      },
      onError: (err) => {
        console.warn("[Voice STT]", err);
      },
    });

    stt.start();

    return () => {
      stt.stop();
    };
  }, [isCallActive, isMuted, onSendUserMessage]);

  // Auto-scroll chat feed
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isCallActive]);

  // Socket.IO Listener for real-time Agora Conversational AI agent transcripts
  useEffect(() => {
    const handleAgoraTranscript = (data) => {
      if (data && data.text) {
        onSendUserMessage?.(data.text);
      }
    };
    socket.on("agora:transcript", handleAgoraTranscript);
    socket.on("agora:agent_message", handleAgoraTranscript);
    return () => {
      socket.off("agora:transcript", handleAgoraTranscript);
      socket.off("agora:agent_message", handleAgoraTranscript);
    };
  }, [onSendUserMessage]);

  const handleSendText = () => {
    if (!inputText.trim()) return;
    onSendUserMessage?.(inputText);
    setInputText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleStartCall = onStartCall || (() => {});
  const handleEndCall = onEndCall || (() => {});
  const handleToggleMute = onToggleMute || (() => {});

  const currentVol = speechVol > 0 ? speechVol : audioLevel;

  return (
    <>

      {/* Main 2-Column Responsive Workspace Grid (Swapped: Left = Voice AI + Flowchart, Right = Chat Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[660px] h-[calc(100vh-170px)] relative overflow-hidden">

        {/* LEFT COLUMN (7 cols): Big AI Neural Core Circle + Services Flowchart */}
        <div className="lg:col-span-7 flex flex-col gap-4 h-full min-h-0">

          {/* TOP CARD: The Big AI Neural Core Circle */}
          <div className="bg-surface-elevated/40 border border-white/[0.08] rounded-xl p-4 relative overflow-hidden flex flex-col items-center justify-center shrink-0">

            {/* Header Title Bar */}
            <div className="w-full flex items-center justify-between border-b border-white/[0.06] pb-2 mb-2 relative z-20 bg-surface-subtle/60 px-3 py-1.5 rounded-lg shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-cyan-400" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  AGORA AI VOICE COMMAND CORE
                </span>
              </div>
              <span
                className={`tag-badge text-[10px] font-mono ${
                  isCallActive ? "tag-success" : "tag-neutral"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isCallActive ? "bg-emerald-400 animate-ping" : "bg-zinc-400"}`} />
                {isCallActive ? "LIVE AGORA AI AGENT" : "STANDBY"}
              </span>
            </div>

            {/* THE BIG AI CIRCLE (Cinematic Pulsing Core) */}
            <div className="relative my-2 flex flex-col items-center justify-center w-40 h-40 shrink-0">

              {/* Multi-layered Rotating & Pulsing Radar Rings */}
              <div
                className={`absolute inset-0 rounded-full transition-all duration-300 pointer-events-none ${
                  isCallActive
                    ? "border-2 border-cyan-400/40 border-dashed animate-spin shadow-[0_0_30px_rgba(45,212,245,0.25)]"
                    : "border border-white/10"
                }`}
              />

              <div
                className={`absolute inset-2 rounded-full transition-all duration-300 pointer-events-none ${
                  isCallActive
                    ? "border border-indigo-500/30 animate-ping"
                    : "border border-white/5"
                }`}
              />

              {/* Main Orb Sphere (128px Diameter) */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isCallActive ? handleEndCall : handleStartCall}
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative z-10 shadow-2xl ${
                  isCallActive
                    ? "bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-700 text-white shadow-[0_0_50px_rgba(45,212,245,0.5)]"
                    : "bg-surface-elevated text-indigo-400 border border-white/15 hover:border-indigo-500/50"
                }`}
              >
                <Sparkles
                  size={36}
                  className={`transition-all duration-300 ${
                    isCallActive ? "text-cyan-200 animate-spin" : "text-indigo-400"
                  }`}
                />

                <span className="text-[10px] font-mono font-bold mt-1.5 tracking-wider uppercase text-white">
                  {isCallActive ? "CALL ACTIVE" : "START CALL"}
                </span>
              </motion.div>
            </div>

            {/* Live Interim Transcript Badge when speaking */}
            <AnimatePresence>
              {isCallActive && interimText && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="mb-1 text-[11px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 rounded-full flex items-center gap-2 max-w-sm truncate shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                  <span className="truncate">Listening: "{interimText}"</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sound Wave Frequency Bars Visualizer */}
            <div className="flex items-center gap-1 my-1.5 h-5 relative z-10 shrink-0">
              {BARS.map((h, i) => (
                <motion.div
                  key={i}
                  className={`w-1 rounded-full ${
                    isCallActive ? "bg-cyan-400 shadow-[0_0_8px_#2DD4F5]" : "bg-zinc-700"
                  }`}
                  animate={{
                    height: isCallActive
                      ? Math.max(4, 20 * h * (1 + currentVol * 2.5))
                      : 3,
                  }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>

            {/* Interactive Call Controls Bar */}
            <div className="flex items-center gap-3 mt-1 relative z-10 shrink-0">
              <button
                onClick={isCallActive ? handleEndCall : handleStartCall}
                className={`btn-solid text-xs h-8 px-5 rounded-full flex items-center gap-2 font-bold tracking-wide transition-all ${
                  isCallActive
                    ? "bg-rose-600 hover:bg-rose-500 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
                    : "bg-indigo-600 hover:bg-indigo-500 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                }`}
              >
                {isCallActive ? (
                  <>
                    <PhoneOff size={13} />
                    <span>End Voice Call</span>
                  </>
                ) : (
                  <>
                    <PhoneCall size={13} />
                    <span>Start Voice Call (Agora AI)</span>
                  </>
                )}
              </button>

              {isCallActive && (
                <button
                  onClick={handleToggleMute}
                  className={`btn-flat h-8 w-8 p-0 rounded-full flex items-center justify-center ${
                    isMuted ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "text-zinc-300"
                  }`}
                  title={isMuted ? "Unmute Mic" : "Mute Mic"}
                >
                  {isMuted ? <MicOff size={13} /> : <Mic size={13} />}
                </button>
              )}
            </div>
          </div>

          {/* BOTTOM CARD: Services Dependency Flowchart */}
          <div className="flex-1 min-h-0">
            <ServicesFlowchart
              isSimulating={isSimulating}
              simulationStep={simulationStep}
              onSelectService={(service) => {
                onSendUserMessage?.(`Inspect telemetry for service: ${service.label}`);
              }}
            />
          </div>

        </div>

        {/* RIGHT COLUMN (5 cols): Live Chat & Voice Transcript Feed */}
        <div className="lg:col-span-5 workspace-container flex flex-col h-full relative overflow-hidden rounded-xl border border-white/[0.08] bg-surface-elevated/40">

          {/* Right Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-surface-subtle shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                AEGIS COMMANDER CHAT
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                <ShieldCheck size={11} className="text-emerald-400" />
                <span>FULL ACCESS GRANTED</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {isCallActive ? "RTC VOICE ONLINE" : "CHAT READY"}
              </span>
            </div>
          </div>

          {/* Error / Warning Notice Bar */}
          {errorMsg && (
            <div className="px-3 py-1.5 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between font-mono shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle size={13} />
                <span>{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Scrollable Conversation Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-subtle min-h-0">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider text-center border-b border-white/5 pb-2">
              ✦ REAL-TIME INCIDENT CONVERSATION FEED
            </div>

            {messages.map((msg, idx) => {
              const isUser = msg.sender === "user";
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={13} className="text-indigo-400" />
                    </div>
                  )}

                  <div className={`max-w-[88%] ${isUser ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block p-2.5 rounded-lg text-xs leading-relaxed ${
                        isUser
                          ? "bg-indigo-600/30 border border-indigo-500/40 text-white rounded-tr-none"
                          : "bg-surface-elevated border border-white/10 text-zinc-200 rounded-tl-none shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Contextual Action Buttons */}
                    {!isUser && msg.showActions && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <button
                          onClick={() => onActionTrigger?.("investigate")}
                          className="btn-flat text-[11px] h-6 px-2.5"
                        >
                          <Zap size={11} className="text-indigo-400" />
                          <span>Investigate</span>
                        </button>

                        <button
                          onClick={() => onActionTrigger?.("root_cause")}
                          className="btn-flat text-[11px] h-6 px-2.5"
                        >
                          <Search size={11} className="text-purple-400" />
                          <span>Root Cause</span>
                        </button>

                        <button
                          onClick={() => onActionTrigger?.("response_plan")}
                          className="btn-flat text-[11px] h-6 px-2.5"
                        >
                          <FileText size={11} className="text-cyan-400" />
                          <span>Response Plan</span>
                        </button>

                        <button
                          onClick={() => onActionTrigger?.("auto_mitigation")}
                          className="btn-flat text-[11px] h-6 px-2.5"
                        >
                          <ShieldCheck size={11} className="text-emerald-400" />
                          <span>Auto-Mitigate</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={13} className="text-zinc-300" />
                    </div>
                  )}
                </motion.div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3 border-t border-white/10 bg-surface-subtle shrink-0">
            <div className="relative flex items-center bg-surface-elevated border border-white/10 rounded-lg p-1 focus-within:border-indigo-500/50 transition-all">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isCallActive
                    ? "Speak aloud or type your prompt..."
                    : "Type your incident query here..."
                }
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
              />

              <button
                type="button"
                onClick={handleSendText}
                disabled={!inputText.trim()}
                className="btn-solid h-7 px-3 text-xs disabled:opacity-40 shrink-0"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
