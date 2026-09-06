/**
 * AICore — Agora Conversational AI fully embedded in the Aegis dashboard.
 *
 * Flow:
 *   1. User clicks "Go Live"
 *   2. We POST /api/agora/token → get RTC token + appId
 *   3. We join the Agora RTC channel as a publisher (so the AI agent can hear us)
 *   4. We POST /api/agora/start-agent → Agora starts the ConvAI pipeline
 *      (Deepgram STT → GPT-4o-mini LLM → MiniMax TTS)
 *   5. Agora agent joins the same channel, hears everyone, speaks back
 *   6. Agent audio plays through the remote audio tracks automatically
 *   7. Agent transcripts arrive via socket events from the server webhook
 *
 * The standalone Agora test page (localhost:5147) is NOT used — everything
 * happens inside this component, inside YOUR dashboard.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Brain, Shield, Activity, Zap, CheckSquare, AlertCircle, Waves } from "lucide-react";
import AgoraRTC, {
  AgoraRTCProvider,
  useJoin,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteAudioTracks,
  useRemoteUsers,
} from "agora-rtc-react";

// One shared RTC client for the whole app
const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

// Disable Agora's own console spam
AgoraRTC.setLogLevel(4);

// ── Inner RTC manager (must live inside AgoraRTCProvider) ─────────────────
function RTCSession({ incidentId, isLive, onReady, onError, onAudioLevel, onAgentStatus }) {
  const [joinConfig, setJoinConfig] = useState(null); // { appid, channel, token, uid }
  const [agentStarted, setAgentStarted] = useState(false);
  const levelTimer = useRef(null);

  // Step 1: fetch token + start agent
  useEffect(() => {
    if (!isLive || joinConfig) return;

    const uid = Math.floor(Math.random() * 900000) + 100000;

    const apiBase = import.meta.env.VITE_API_URL || "";
    fetch(`${apiBase}/api/agora/token`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ incidentId, uid, participantId: "p1" }),
    })
      .then(r => r.json())
      .then(async (data) => {
        if (!data.appId || !data.rtc?.token) {
          onError("Agora not configured — check server credentials");
          return;
        }

        // Join the RTC channel
        setJoinConfig({
          appid:   data.appId,
          channel: data.channel || incidentId,
          token:   data.rtc.token,
          uid:     data.uid || uid,
        });

        onAgentStatus("starting");

        // Start the AI agent (separate call after token)
        const agentRes = await fetch(`${apiBase}/api/agora/start-agent`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ incidentId }),
        });
        const agentData = await agentRes.json();

        if (agentData.started || agentData.mode === "already_running") {
          setAgentStarted(true);
          onAgentStatus("online");
          onReady();
        } else if (agentData.mode === "stub") {
          // Stub mode: RTC works, AI is simulated
          setAgentStarted(true);
          onAgentStatus("stub");
          onReady();
        } else {
          onAgentStatus("error");
          onError(`Agent failed: ${JSON.stringify(agentData.error || "unknown")}`);
        }
      })
      .catch(err => {
        onError(`Connection failed: ${err.message}`);
      });
  }, [isLive, incidentId, joinConfig, onReady, onError, onAgentStatus]);

  // Reset when disconnected
  useEffect(() => {
    if (!isLive) { setJoinConfig(null); setAgentStarted(false); }
  }, [isLive]);

  // Step 2: join the RTC channel
  const shouldJoin = Boolean(isLive && joinConfig && joinConfig.appid);
  useJoin(joinConfig || { appid: "", channel: "", token: null, uid: 0 }, shouldJoin);

  // Step 3: mic + publish
  const { localMicrophoneTrack, error: micErr } = useLocalMicrophoneTrack(shouldJoin);
  useEffect(() => { if (micErr) onError("Mic access denied — allow microphone in browser"); }, [micErr, onError]);
  usePublish([localMicrophoneTrack]);

  // Step 4: audio level for orb animation
  useEffect(() => {
    if (!localMicrophoneTrack || !shouldJoin) return;
    levelTimer.current = setInterval(() => {
      onAudioLevel(localMicrophoneTrack.getVolumeLevel?.() ?? 0);
    }, 60);
    return () => clearInterval(levelTimer.current);
  }, [localMicrophoneTrack, shouldJoin, onAudioLevel]);

  // Step 5: play remote users (Agora AI agent audio comes through here)
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);
  useEffect(() => {
    audioTracks.forEach(t => t.play());
    return () => audioTracks.forEach(t => { try { t.stop(); } catch (_) {} });
  }, [audioTracks]);

  return null;
}

// ── Main exported component ─────────────────────────────────────────────────
const BARS = [0.28,0.72,0.48,1.0,0.62,0.95,0.38,0.8,0.55,1.08,0.68,0.42,0.9,0.6,0.33,0.77,0.5];

const AGENT_STATE_CFG = {
  standby:  { label: "Standby",         color: "#4A5280", pulse: false },
  starting: { label: "Connecting…",     color: "#FFAC32", pulse: true  },
  online:   { label: "Live · Listening",color: "#22D38C", pulse: true  },
  stub:     { label: "Demo Mode",       color: "#7C60FF", pulse: true  },
  error:    { label: "Error",           color: "#FF4646", pulse: false },
};

export default function AICore({ state = "idle", incidentId, items = [], onStatusRequest }) {
  const [isLive, setIsLive]           = useState(false);
  const [agentStatus, setAgentStatus] = useState("standby");
  const [errorMsg, setErrorMsg]       = useState(null);
  const [audioLevel, setAudioLevel]   = useState(0);
  const [orbPulse, setOrbPulse]       = useState(0);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const pulseTimer = useRef(null);

  const stateCfg = AGENT_STATE_CFG[agentStatus] || AGENT_STATE_CFG.standby;
  const isActive = isLive && (agentStatus === "online" || agentStatus === "stub");

  // Orb pulse randomness while live
  useEffect(() => {
    if (!isActive) { setOrbPulse(0); return; }
    pulseTimer.current = setInterval(() => setOrbPulse(Math.random()), 80);
    return () => clearInterval(pulseTimer.current);
  }, [isActive]);

  // Visual agent speaking state from parent items
  useEffect(() => {
    if (state === "speaking") { setAgentSpeaking(true); setTimeout(() => setAgentSpeaking(false), 3000); }
  }, [state]);

  const goLive = useCallback(() => {
    setErrorMsg(null);
    setAgentStatus("standby");
    setIsLive(true);
  }, []);

  const disconnect = useCallback(async () => {
    setIsLive(false);
    setAgentStatus("standby");
    setAudioLevel(0);
    // Stop the server-side agent too
    if (incidentId) {
      const apiBase = import.meta.env.VITE_API_URL || "";
      fetch(`${apiBase}/api/agora/stop-agent`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId }),
      }).catch(() => {});
    }
  }, [incidentId]);

  const handleReady = useCallback(() => {}, []);
  const handleError = useCallback((msg) => { setErrorMsg(msg); setAgentStatus("error"); setIsLive(false); }, []);
  const handleAgentStatus = useCallback((s) => setAgentStatus(s), []);
  const handleAudioLevel  = useCallback((l) => setAudioLevel(l), []);

  const facts      = items.filter(i => i.type === "fact").length;
  const hypotheses = items.filter(i => i.type === "hypothesis" && !i.stale).length;
  const actions    = items.filter(i => i.type === "action" && i.status !== "done").length;

  const orbScale = isActive ? 1 + (audioLevel * 0.4) + (orbPulse * 0.06) : 1;
  const orbGlow  = isActive
    ? `0 0 ${50 + audioLevel * 60}px rgba(124,96,255,${0.65 + audioLevel * 0.3}), 0 0 100px rgba(124,96,255,0.2)`
    : "none";

  return (
    <AgoraRTCProvider client={agoraClient}>
      {/* Hidden RTC session manager */}
      {isLive && (
        <RTCSession
          incidentId={incidentId}
          isLive={isLive}
          onReady={handleReady}
          onError={handleError}
          onAudioLevel={handleAudioLevel}
          onAgentStatus={handleAgentStatus}
        />
      )}

      <div className="glass flex flex-col gap-4 p-5 relative overflow-hidden">

        {/* Grid bg texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.018]"
          style={{ backgroundImage: "linear-gradient(rgba(120,96,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(120,96,255,1) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Header row */}
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <Brain size={14} style={{ color: "#7C60FF" }} />
              <span className="text-sm font-semibold" style={{ color: "#E8EDF8" }}>Agora AI Voice</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {stateCfg.pulse && (
                <span className="h-1.5 w-1.5 rounded-full anim-pulse2"
                  style={{ background: stateCfg.color, boxShadow: `0 0 6px ${stateCfg.color}` }} />
              )}
              {!stateCfg.pulse && (
                <span className="h-1.5 w-1.5 rounded-full"
                  style={{ background: stateCfg.color }} />
              )}
              <span className="text-[11px] font-mono" style={{ color: stateCfg.color }}>{stateCfg.label}</span>
            </div>
          </div>

          {/* Connect / Disconnect button */}
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.94 }}
            onClick={isLive ? disconnect : goLive}
            disabled={agentStatus === "starting"}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
            style={isLive
              ? { background: "rgba(255,70,70,0.15)", border: "1px solid rgba(255,70,70,0.3)", color: "#FF7070" }
              : { background: "rgba(34,211,140,0.1)",  border: "1px solid rgba(34,211,140,0.28)", color: "#22D38C" }}>
            {isLive ? <MicOff size={13} /> : <Mic size={13} />}
            {agentStatus === "starting" ? "Connecting…" : isLive ? "Disconnect" : "Go Live"}
          </motion.button>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 px-3 py-2 rounded-xl text-[11px]"
              style={{ background: "rgba(255,70,70,0.08)", border: "1px solid rgba(255,70,70,0.2)", color: "#FF7070" }}>
              <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Orb + waveform ── */}
        <div className="flex items-center justify-center gap-2 py-2 relative z-10">

          {/* Left bars */}
          <div className="flex items-end gap-[3px] h-14">
            {BARS.slice(0, 9).map((h, i) => (
              <motion.div key={`l${i}`}
                animate={{ height: isActive ? Math.max(2, 48 * h * (1 + audioLevel * 2 + orbPulse * 0.35)) : 2 + h * 7 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className="w-[3px] rounded-full"
                style={{ background: isActive ? `rgba(124,96,255,${0.45 + h * 0.55})` : "rgba(58,64,96,0.35)" }}
              />
            ))}
          </div>

          {/* Central orb */}
          <div className="relative flex items-center justify-center mx-2">
            {/* Ripple rings (only when live) */}
            {isActive && [1, 2, 3].map(ring => (
              <div key={ring} className="absolute rounded-full pointer-events-none"
                style={{
                  inset:            -(ring * 16),
                  border:           `1px solid rgba(124,96,255,${0.28 - ring * 0.07})`,
                  animation:        `orbRing ${2.2 + ring * 0.5}s ease-in-out infinite`,
                  animationDelay:   `${ring * 0.25}s`,
                }} />
            ))}

            {/* Agent speaking ring */}
            <AnimatePresence>
              {agentSpeaking && (
                <motion.div initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 2.2, opacity: 0 }}
                  exit={{}} transition={{ duration: 1.4, repeat: Infinity }}
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{ background: "rgba(124,96,255,0.3)" }} />
              )}
            </AnimatePresence>

            {/* Glow halo */}
            <div className="absolute rounded-full pointer-events-none transition-all duration-150"
              style={{ inset: -24, background: isActive ? `radial-gradient(circle,rgba(124,96,255,${0.3 + audioLevel * 0.35}) 0%,transparent 70%)` : "transparent", filter: "blur(10px)" }} />

            {/* The orb button */}
            <motion.button
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.92 }}
              animate={{ scale: orbScale }}
              transition={{ duration: 0.08, ease: "easeOut" }}
              onClick={isLive ? disconnect : goLive}
              className="h-[88px] w-[88px] rounded-full flex items-center justify-center relative z-10"
              style={isActive
                ? { background: "linear-gradient(135deg,#7C60FF 0%,#5040D0 55%,#9B7FFF 100%)", boxShadow: orbGlow }
                : agentStatus === "error"
                  ? { background: "linear-gradient(135deg,#FF4646,#CC2222)", boxShadow: "0 0 30px rgba(255,70,70,0.4)" }
                  : { background: "linear-gradient(135deg,rgba(58,64,96,0.5),rgba(18,22,42,0.75))", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Shield
                size={30}
                color={isActive ? "white" : agentStatus === "error" ? "white" : "rgba(255,255,255,0.28)"}
                strokeWidth={1.7}
              />
            </motion.button>
          </div>

          {/* Right bars */}
          <div className="flex items-end gap-[3px] h-14">
            {BARS.slice(8).map((h, i) => (
              <motion.div key={`r${i}`}
                animate={{ height: isActive ? Math.max(2, 48 * h * (1 + audioLevel * 2 + orbPulse * 0.28)) : 2 + h * 7 }}
                transition={{ duration: 0.1, ease: "easeOut", delay: i * 0.01 }}
                className="w-[3px] rounded-full"
                style={{ background: isActive ? `rgba(124,96,255,${0.45 + h * 0.55})` : "rgba(58,64,96,0.35)" }}
              />
            ))}
          </div>
        </div>

        {/* Status label */}
        <p className="text-center text-[11px] font-mono relative z-10 -mt-1" style={{ color: "#2A3560" }}>
          {isActive
            ? "Agora AI agent is live in this room · speak naturally"
            : agentStatus === "starting"
              ? "Starting Deepgram → Gemini Flash → MiniMax pipeline…"
              : "Click orb or Go Live to start the AI voice agent"}
        </p>

        {/* Pipeline badges (only when live) */}
        <AnimatePresence>
          {isActive && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
              className="flex items-center justify-center gap-2 relative z-10">
              {[
                { label: "Deepgram STT", color: "#22D38C" },
                { label: "→", color: "#2A3560" },
                { label: "Gemini Flash",  color: "#7C60FF" },
                { label: "→", color: "#2A3560" },
                { label: "MiniMax TTS",  color: "#FFAC32" },
              ].map((b, i) => (
                b.label === "→"
                  ? <span key={i} className="text-xs" style={{ color: b.color }}>→</span>
                  : <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                      style={{ background: `${b.color}14`, border: `1px solid ${b.color}28`, color: b.color }}>
                      {b.label}
                    </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live metrics */}
        <div className="grid grid-cols-3 gap-2 relative z-10">
          {[
            { label: "Facts",    value: facts,      color: "#22D38C", icon: Activity,    bg: "rgba(34,211,140,0.07)"  },
            { label: "Hypotheses",value: hypotheses, color: "#FFAC32", icon: Waves,      bg: "rgba(255,172,50,0.07)"  },
            { label: "Actions",  value: actions,    color: "#A898FF", icon: CheckSquare, bg: "rgba(124,96,255,0.07)"  },
          ].map(({ label, value, color, icon: Icon, bg }) => (
            <motion.div key={label} whileHover={{ scale: 1.03 }}
              className="p-3 rounded-xl flex items-center gap-2"
              style={{ background: bg, border: `1px solid ${color}20` }}>
              <Icon size={13} style={{ color, flexShrink: 0 }} />
              <div>
                <motion.div key={value} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="text-[15px] font-mono font-bold leading-none" style={{ color }}>
                  {value}
                </motion.div>
                <div className="text-[9px] mt-0.5 uppercase tracking-wide font-medium" style={{ color: "#3A4060" }}>{label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ask Aegis button */}
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={onStatusRequest}
          className="w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 relative z-10 transition-all"
          style={{ background: "rgba(120,96,255,0.07)", border: "1px solid rgba(120,96,255,0.2)", color: "#A898FF" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(120,96,255,0.14)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(120,96,255,0.07)"}>
          <Zap size={12} />
          Ask Aegis for status summary
        </motion.button>
      </div>
    </AgoraRTCProvider>
  );
}
