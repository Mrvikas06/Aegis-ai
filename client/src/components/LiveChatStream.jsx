import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Database, MessageSquare, Copy, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const API = import.meta.env.VITE_API_URL || "";

export default function LiveChatStream({ timeline = [], onSendChat, incidentId }) {
  const [tab, setTab] = useState("incident");
  const [text, setText] = useState("");
  const [generalMessages, setGeneralMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [timeline, generalMessages, tab]);

  const handleSend = useCallback(async (e) => {
    e?.preventDefault();
    const msg = text.trim();
    if (!msg || loading) return;
    setText("");
    setLoading(true);
    try {
      if (tab === "incident") {
        await onSendChat?.("p1", msg);
      } else {
        const userMsg = { id: Date.now().toString(), role: "user", text: msg, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
        setGeneralMessages(p => [...p, userMsg]);
        const res = await fetch(`${API}/api/incidents/${incidentId}/chat`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: msg, speakerId: "user" }),
        });
        if (res.status === 429) { setGeneralMessages(p => [...p, { id: Date.now().toString(), role: "ai", text: "⏱ Rate limit active — please wait a moment.", time: "" }]); return; }
        const data = await res.json();
        const replyText = data?.aiItem?.text || data?.reply || "Aegis is processing…";
        setGeneralMessages(p => [...p, { id: (Date.now()+1).toString(), role: "ai", text: replyText, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
      }
    } catch { } finally { setLoading(false); }
  }, [text, loading, tab, onSendChat, incidentId]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const copyMsg = (id, txt) => {
    navigator.clipboard.writeText(txt).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  // Build incident messages from timeline
  const incidentMessages = timeline
    .filter(t => ["fact", "hypothesis", "system_event", "decision"].includes(t.type))
    .slice(-40)
    .map(t => ({
      id: t.id,
      role: t.speakerId === "aegis" ? "ai" : "user",
      speakerName: t.speakerId === "aegis" ? "Aegis" : t.speakerId,
      text: t.summary || t.text || "",
      type: t.type,
      time: t.timestamp ? new Date(t.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
    }));

  const displayMessages = tab === "incident" ? incidentMessages : generalMessages;

  const TYPE_DOT = { fact: "#22D38C", hypothesis: "#FFAC32", decision: "#A898FF", system_event: "#7C60FF" };

  return (
    <div className="glass flex flex-col" style={{ height: 440 }}>
      {/* Tab bar */}
      <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { id: "incident", icon: Database,      label: "Incident Q&A" },
          { id: "general",  icon: MessageSquare, label: "Ask Aegis" },
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={tab === id
              ? { background: "rgba(120,96,255,0.15)", border: "1px solid rgba(120,96,255,0.28)", color: "#A898FF" }
              : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#3A4060" }}>
            <Icon size={11} /> {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono" style={{ color: "#22D38C" }}>
          <Sparkles size={10} />
          Agora AI
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" ref={scrollRef}>
        {displayMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(120,96,255,0.1)", border: "1px solid rgba(120,96,255,0.18)" }}>
              {tab === "incident" ? <Database size={18} style={{ color: "#7C60FF" }} /> : <Sparkles size={18} style={{ color: "#7C60FF" }} />}
            </div>
            <p className="text-xs" style={{ color: "#3A4060" }}>
              {tab === "incident"
                ? "Run a demo scenario or speak into the voice channel\nAegis will classify everything in real time"
                : 'Ask Aegis anything:\n"What do we know so far?"\n"Who owns the rollback?"\n"What are the open risks?"'}
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {displayMessages.map((m, idx) => {
            const isAI = m.role === "ai";
            const dotColor = TYPE_DOT[m.type] || (isAI ? "#7C60FF" : "#3A4060");
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
                className={`flex items-end gap-2 group ${isAI ? "justify-start" : "justify-end"}`}>
                {isAI && (
                  <div className="h-7 w-7 rounded-xl flex items-center justify-center shrink-0 mb-0.5"
                    style={{ background: "linear-gradient(135deg,#7C60FF,#4B3BCE)", boxShadow: "0 0 12px rgba(124,96,255,0.4)" }}>
                    <Database size={12} color="white" />
                  </div>
                )}
                <div className="relative max-w-[83%]">
                  {/* Speaker label */}
                  {m.speakerName && m.speakerName !== "p1" && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: dotColor }} />
                      <span className="text-[10px] font-mono" style={{ color: dotColor }}>{m.speakerName}</span>
                    </div>
                  )}
                  <div className="px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed"
                    style={isAI
                      ? { background: "rgba(120,96,255,0.09)", border: "1px solid rgba(120,96,255,0.18)", color: "#BCC8E0", borderBottomLeftRadius: 4 }
                      : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "#E8EDF8", borderBottomRightRadius: 4 }}>
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <div className="flex items-center justify-between mt-1.5 gap-2">
                      <span className="text-[9px] font-mono" style={{ color: "#3A4060" }}>{m.time}</span>
                      {m.type && m.type !== "system_event" && (
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded tag-${m.type === "hypothesis" ? "hyp" : m.type}`}>
                          {m.type}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Copy button */}
                  <button onClick={() => copyMsg(m.id, m.text)}
                    className="absolute -top-2 right-1 h-6 w-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    style={{ background: "rgba(18,22,42,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {copied === m.id ? <Check size={10} style={{ color: "#22D38C" }} /> : <Copy size={10} style={{ color: "#6070A0" }} />}
                  </button>
                </div>
                {!isAI && (
                  <div className="h-7 w-7 rounded-xl flex items-center justify-center shrink-0 mb-0.5 text-[9px] font-bold"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#6070A0" }}>IC</div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {loading && (
          <div className="flex items-end gap-2">
            <div className="h-7 w-7 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#7C60FF,#4B3BCE)" }}>
              <Database size={12} color="white" />
            </div>
            <div className="px-4 py-3 rounded-2xl" style={{ background: "rgba(120,96,255,0.09)", border: "1px solid rgba(120,96,255,0.18)", borderBottomLeftRadius: 4 }}>
              <div className="flex items-center gap-1.5">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: "#7C60FF" }}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-3 pt-2 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <textarea value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKey}
            ref={inputRef} rows={1} placeholder={tab === "incident" ? "Ask about the incident…" : "Ask Aegis anything…"}
            className="flex-1 px-3.5 py-2.5 text-xs dark-input resize-none"
            style={{ lineHeight: "1.5", maxHeight: 80 }} />
          <button type="submit" disabled={!text.trim() || loading}
            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
            style={{ background: "linear-gradient(135deg,#7C60FF,#4B3BCE)", boxShadow: text.trim() ? "0 0 16px rgba(124,96,255,0.4)" : "none" }}>
            <Send size={13} color="white" />
          </button>
        </form>
        <p className="text-[9px] mt-1.5 font-mono" style={{ color: "#2A3050" }}>
          Enter to send · Shift+Enter for newline · Powered by Agora AI
        </p>
      </div>
    </div>
  );
}
