import { useState } from "react";
import { Send } from "lucide-react";

export default function LiveInputConsole({ onSend, participants = [] }) {
  const [text, setText] = useState("");
  const [speaker, setSpeaker] = useState("p2");
  const display = participants.length ? participants.filter(p => p.id !== "p1") : [
    { id: "p2", name: "Priya" },
    { id: "p3", name: "Meera" },
    { id: "p4", name: "Rahul" },
  ];
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend?.(speaker, text.trim());
    setText("");
  };
  return (
    <div className="glass p-4 flex flex-col gap-3">
      <div className="text-xs font-medium" style={{ color: "#4A5280" }}>Simulate voice input</div>
      <div className="flex gap-2">
        <select value={speaker} onChange={(e) => setSpeaker(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs dark-input"
          style={{ background: "rgba(255,255,255,0.04)", color: "#8892B0", border: "1px solid rgba(255,255,255,0.08)" }}>
          {display.map((p) => <option key={p.id} value={p.id} style={{ background: "#111420" }}>{p.name}</option>)}
        </select>
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Speak as participant..."
            className="flex-1 px-3 py-2 text-xs dark-input" />
          <button type="submit" disabled={!text.trim()}
            className="h-9 w-9 rounded-xl flex items-center justify-center disabled:opacity-30 transition-all"
            style={{ background: "linear-gradient(135deg, #7C6FFF, #5B4FE8)" }}>
            <Send size={13} color="white" />
          </button>
        </form>
      </div>
    </div>
  );
}
