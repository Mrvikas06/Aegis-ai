import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  BrainCircuit,
  AlertTriangle,
  Network,
  SearchCode,
  Clock,
  Server,
  Bell,
  BarChart3,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  Cloud,
  CheckCircle2,
} from "lucide-react";
import AegisLogo from "./AegisLogo";

const NAV_ITEMS = [
  { id: "overview", icon: LayoutDashboard, label: "Overview", badge: null },
  { id: "commander", icon: BrainCircuit, label: "AI Commander", badge: "AI" },
  { id: "incidents", icon: AlertTriangle, label: "Live Incidents", badge: "3" },
  { id: "orchestration", icon: Network, label: "Orchestration", badge: "Live" },
  { id: "investigations", icon: SearchCode, label: "Investigations", badge: null },
  { id: "timeline", icon: Clock, label: "Incident Timeline", badge: null },
  { id: "services", icon: Server, label: "Services", badge: null },
  { id: "alerts", icon: Bell, label: "Alerts", badge: "5" },
  { id: "analytics", icon: BarChart3, label: "Analytics", badge: null },
  { id: "integrations", icon: Boxes, label: "Integrations", badge: null },
];

export default function SideNav({
  activeTab = "commander",
  onSelectTab,
  connected = true,
  collapsed = false,
  onToggleCollapse,
}) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen flex flex-col fixed left-0 top-0 bottom-0 z-40 select-none overflow-hidden"
      style={{
        background: "rgba(18, 22, 36, 0.94)",
        backdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Top Logo Container */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <AegisLogo collapsed={collapsed} />
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Main Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div key={item.id} className="relative group">
              <motion.button
                whileHover={{ x: collapsed ? 0 : 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectTab?.(item.id)}
                className={`w-full h-10 px-3 rounded-xl flex items-center gap-3 transition-all relative ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-transparent text-white border border-indigo-500/30 shadow-[0_0_16px_rgba(99,102,241,0.2)]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                }`}
              >
                {/* Active left bar glow indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeSideBar"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-indigo-400 to-cyan-400 shadow-[0_0_8px_#6366F1]"
                  />
                )}

                <Icon
                  size={18}
                  className={`shrink-0 transition-colors ${
                    isActive ? "text-indigo-400" : "text-zinc-400 group-hover:text-zinc-200"
                  }`}
                />

                {!collapsed && (
                  <span className="text-xs font-medium font-sans truncate flex-1 text-left">
                    {item.label}
                  </span>
                )}

                {!collapsed && item.badge && (
                  <span
                    className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full ${
                      item.badge === "AI"
                        ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-300 border border-indigo-500/30"
                        : item.badge === "Live"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse"
                        : "bg-white/10 text-zinc-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.button>

              {/* Tooltip for Collapsed State */}
              {collapsed && (
                <div className="absolute left-16 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-white/10 text-white shadow-xl whitespace-nowrap flex items-center gap-2">
                    {item.label}
                    {item.badge && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-2 border-t border-white/[0.06] space-y-1 shrink-0 bg-surface-primary/50">
        {/* Workspace Switcher */}
        <div className="relative group">
          <button
            className={`w-full h-9 px-3 rounded-lg flex items-center gap-2 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <Cloud size={16} className="text-cyan-400 shrink-0" />
            {!collapsed && (
              <div className="flex-1 text-left truncate">
                <div className="text-[11px] font-medium text-zinc-200">Acme Cloud</div>
                <div className="text-[9px] font-mono text-zinc-500">us-east-1 (Prod)</div>
              </div>
            )}
          </button>
          {collapsed && (
            <div className="absolute left-16 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-white/10 text-white shadow-xl whitespace-nowrap">
                Acme Cloud (Prod)
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="relative group">
          <button
            onClick={() => onSelectTab?.("settings")}
            className={`w-full h-9 px-3 rounded-lg flex items-center gap-2 text-xs text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <Settings size={16} className="shrink-0" />
            {!collapsed && <span className="font-medium">Settings</span>}
          </button>
          {collapsed && (
            <div className="absolute left-16 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
              <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-white/10 text-white shadow-xl whitespace-nowrap">
                Settings
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative group pt-1">
          <div
            className={`w-full p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                VK
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${
                  connected ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
            </div>
            {!collapsed && (
              <div className="flex-1 truncate">
                <div className="text-[11px] font-semibold text-white leading-tight">Vikas</div>
                <div className="text-[9px] text-indigo-400 font-mono">Lead IC</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
