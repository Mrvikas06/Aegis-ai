import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  Mail,
  Briefcase,
  IdCard,
  Shield,
  Save,
  Check,
  Bell,
  Building,
  Sparkles,
  Camera,
  BadgeCheck,
  Lock,
  Globe,
  Sliders,
  Zap,
} from "lucide-react";

export default function SettingsView() {
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState({
    name: "Vikas Sharma",
    postTitle: "Lead Incident Commander",
    postId: "IC-8942-AEGIS",
    email: "vikas.sharma@aegis-security.io",
    department: "Site Reliability & Core Platform",
    timeZone: "UTC+05:30 (Asia/Kolkata)",
    phone: "+91 98765 43210",
  });

  const [autoMitigateEnabled, setAutoMitigateEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pagerDutySync, setPagerDutySync] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (field, val) => {
    setProfile((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="space-y-6 pb-10 max-w-5xl">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white font-sans tracking-tight">
              Settings & Preferences
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">
              v2.4 PRO
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-sans mt-1">
            Manage your Incident Commander profile, notification dispatch channels, and autonomous mitigation policies
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="btn-primary text-xs h-9 px-5 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        >
          {saved ? <Check size={14} className="text-emerald-300" /> : <Save size={14} />}
          <span>{saved ? "Changes Saved!" : "Save Profile Settings"}</span>
        </motion.button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-1 overflow-x-auto">
        {[
          { id: "profile", label: "Profile & Identity", icon: User },
          { id: "notifications", label: "Alert Dispatch & Channels", icon: Bell },
          { id: "mitigation", label: "Mitigation Policies", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-sans transition-all shrink-0 ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={14} className={isActive ? "text-indigo-400" : "text-zinc-500"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: PROFILE & IDENTITY */}
        {activeTab === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Profile Header Box */}
            <div className="bg-[#121624]/60 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Avatar Ring */}
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[2px] shadow-[0_0_25px_rgba(99,102,241,0.35)]">
                    <div className="w-full h-full rounded-[14px] bg-[#0C0E17] flex items-center justify-center text-2xl font-bold text-white font-mono tracking-wider">
                      VK
                    </div>
                  </div>
                  <button className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-indigo-600 text-white border border-white/20 shadow-md hover:bg-indigo-500 transition-all">
                    <Camera size={12} />
                  </button>
                </div>

                {/* Profile Identity Details */}
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-base font-bold text-white font-sans">{profile.name}</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
                      <BadgeCheck size={11} />
                      <span>ON-CALL COMMANDER</span>
                    </span>
                  </div>

                  <p className="text-xs font-mono text-indigo-300 font-medium">
                    {profile.postTitle}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] font-mono text-zinc-400 pt-1">
                    <span className="bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                      ID: <strong className="text-zinc-200">{profile.postId}</strong>
                    </span>
                    <span className="bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                      Dept: <strong className="text-zinc-200">{profile.department}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Input Grid Settings Box */}
            <div className="bg-[#121624]/60 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-md space-y-6">
              <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-4">
                <Sliders size={16} className="text-indigo-400" />
                <h3 className="text-sm font-bold text-white font-sans">Personal Information & Role</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} className="text-indigo-400" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full bg-[#0C0E17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none transition-all font-sans"
                    placeholder="e.g. Vikas Sharma"
                  />
                </div>

                {/* Post Title */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase size={13} className="text-indigo-400" />
                    <span>Post / Designation Title</span>
                  </label>
                  <input
                    type="text"
                    value={profile.postTitle}
                    onChange={(e) => handleChange("postTitle", e.target.value)}
                    className="w-full bg-[#0C0E17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none transition-all font-sans"
                    placeholder="e.g. Lead Incident Commander / Principal SRE"
                  />
                </div>

                {/* Employee / Post ID */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <IdCard size={13} className="text-indigo-400" />
                    <span>Post / Staff ID</span>
                  </label>
                  <input
                    type="text"
                    value={profile.postId}
                    onChange={(e) => handleChange("postId", e.target.value)}
                    className="w-full bg-[#0C0E17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none transition-all font-mono"
                    placeholder="e.g. IC-8942-AEGIS"
                  />
                </div>

                {/* Official Email */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={13} className="text-indigo-400" />
                    <span>Official Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full bg-[#0C0E17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none transition-all font-sans"
                    placeholder="e.g. vikas@aegis-security.io"
                  />
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building size={13} className="text-indigo-400" />
                    <span>Department / Team</span>
                  </label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="w-full bg-[#0C0E17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none transition-all font-sans"
                    placeholder="e.g. Site Reliability & Core Platform"
                  />
                </div>

                {/* Operational Time Zone */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe size={13} className="text-indigo-400" />
                    <span>Operational Time Zone</span>
                  </label>
                  <input
                    type="text"
                    value={profile.timeZone}
                    onChange={(e) => handleChange("timeZone", e.target.value)}
                    className="w-full bg-[#0C0E17] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ALERT DISPATCH & CHANNELS */}
        {activeTab === "notifications" && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-[#121624]/60 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-md space-y-6"
          >
            <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-4">
              <Bell size={16} className="text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-sans">Emergency Alerting & Incident Dispatch</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#0C0E17] border border-white/10 hover:border-white/20 transition-all">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white">Emergency Email Postmortems</div>
                  <div className="text-[11px] text-zinc-400">
                    Send automated incident timeline exports and root cause summaries to <strong className="text-indigo-300">{profile.email}</strong>
                  </div>
                </div>
                <button
                  onClick={() => setEmailAlerts((p) => !p)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    emailAlerts ? "bg-indigo-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                      emailAlerts ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#0C0E17] border border-white/10 hover:border-white/20 transition-all">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white">PagerDuty On-Call Escalation</div>
                  <div className="text-[11px] text-zinc-400">
                    Automatically trigger high-priority alerts to Incident Commander <strong className="text-zinc-200">{profile.name}</strong> ({profile.postId})
                  </div>
                </div>
                <button
                  onClick={() => setPagerDutySync((p) => !p)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    pagerDutySync ? "bg-indigo-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                      pagerDutySync ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[#0C0E17] border border-white/10 hover:border-white/20 transition-all">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white">Slack War Room Bridge Sync</div>
                  <div className="text-[11px] text-zinc-400">
                    Broadcast real-time Aegis AI classification events into #incident-war-room channel
                  </div>
                </div>
                <button
                  onClick={() => setSlackNotifications((p) => !p)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    slackNotifications ? "bg-indigo-600" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                      slackNotifications ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: MITIGATION POLICIES */}
        {activeTab === "mitigation" && (
          <motion.div
            key="mitigation"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-[#121624]/60 border border-white/[0.08] rounded-2xl p-6 backdrop-blur-md space-y-6"
          >
            <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-4">
              <Shield size={16} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-sans">Autonomous Mitigation & Safeguards</h3>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#0C0E17] border border-white/10 hover:border-white/20 transition-all">
              <div className="space-y-1">
                <div className="text-xs font-bold text-white">Enable Automated Scaling & Patch Execution</div>
                <div className="text-[11px] text-zinc-400">
                  Allow Aegis AI Automation Agent to execute pre-approved Kubernetes replica scaling and DB connection pool adjustments automatically.
                </div>
              </div>
              <button
                onClick={() => setAutoMitigateEnabled((p) => !p)}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  autoMitigateEnabled ? "bg-indigo-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                    autoMitigateEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
