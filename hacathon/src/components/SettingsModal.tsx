"use client";

import { X, Palette, Sliders, Bell } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/DashboardContext";
import { useTheme } from "@/context/ThemeContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { alertThresholds, updateAlertThreshold, resetThresholds, notificationsEnabled, setNotificationsEnabled } = useDashboard();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"theme" | "thresholds" | "notifications">("theme");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99] flex items-end md:items-center justify-end md:justify-center overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full md:w-[500px] bg-slate-900 border border-slate-800 rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 md:zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 shrink-0">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 shrink-0 px-6 pt-4">
          <button
            onClick={() => setActiveTab("theme")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition whitespace-nowrap",
              activeTab === "theme"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            )}
          >
            <Palette className="w-4 h-4" /> Theme
          </button>
          <button
            onClick={() => setActiveTab("thresholds")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition whitespace-nowrap",
              activeTab === "thresholds"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            )}
          >
            <Sliders className="w-4 h-4" /> Alerts
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition whitespace-nowrap",
              activeTab === "notifications"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-300"
            )}
          >
            <Bell className="w-4 h-4" /> Notify
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Theme Tab */}
          {activeTab === "theme" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Display Mode</h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Midnight Mode */}
                  <button
                    onClick={() => setTheme("midnight")}
                    className={cn(
                      "p-4 rounded-lg border-2 transition text-left",
                      theme === "midnight"
                        ? "bg-indigo-900/40 border-indigo-500"
                        : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 mb-2" />
                    <p className="text-sm font-semibold text-slate-200">Midnight</p>
                    <p className="text-xs text-slate-500 mt-1">Dark clinical mode</p>
                    {theme === "midnight" && (
                      <div className="mt-2 text-xs font-bold text-indigo-400">✓ Active</div>
                    )}
                  </button>

                  {/* High-Contrast Mode */}
                  <button
                    onClick={() => setTheme("high-contrast")}
                    className={cn(
                      "p-4 rounded-lg border-2 transition text-left",
                      theme === "high-contrast"
                        ? "bg-indigo-900/40 border-indigo-500"
                        : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border-2 border-slate-900 mb-2" />
                    <p className="text-sm font-semibold text-slate-200">High-Contrast</p>
                    <p className="text-xs text-slate-500 mt-1">Light, accessible mode</p>
                    {theme === "high-contrast" && (
                      <div className="mt-2 text-xs font-bold text-indigo-400">✓ Active</div>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg">
                <p className="text-xs text-indigo-300">
                  💡 Your theme preference is saved to localStorage and will persist across sessions.
                </p>
              </div>
            </div>
          )}

          {/* Alert Thresholds Tab */}
          {activeTab === "thresholds" && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-300">Heart Rate High</label>
                  <span className="text-lg font-bold text-amber-400">{alertThresholds.hrHigh} bpm</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="140"
                  value={alertThresholds.hrHigh}
                  onChange={(e) => updateAlertThreshold("hrHigh", parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-xs text-slate-500 mt-2">Trigger alert when HR exceeds this value</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-300">Heart Rate Low</label>
                  <span className="text-lg font-bold text-blue-400">{alertThresholds.hrLow} bpm</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="70"
                  value={alertThresholds.hrLow}
                  onChange={(e) => updateAlertThreshold("hrLow", parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-xs text-slate-500 mt-2">Trigger alert when HR falls below this value</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-300">BP Systolic High</label>
                  <span className="text-lg font-bold text-red-400">{alertThresholds.bpSystolicHigh} mmHg</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="200"
                  value={alertThresholds.bpSystolicHigh}
                  onChange={(e) => updateAlertThreshold("bpSystolicHigh", parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <p className="text-xs text-slate-500 mt-2">Hypertension threshold</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-300">BP Systolic Low</label>
                  <span className="text-lg font-bold text-cyan-400">{alertThresholds.bpSystolicLow} mmHg</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="110"
                  value={alertThresholds.bpSystolicLow}
                  onChange={(e) => updateAlertThreshold("bpSystolicLow", parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <p className="text-xs text-slate-500 mt-2">Hypotension threshold</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-300">SpO₂ Low</label>
                  <span className="text-lg font-bold text-green-400">{alertThresholds.spo2Low}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="96"
                  value={alertThresholds.spo2Low}
                  onChange={(e) => updateAlertThreshold("spo2Low", parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <p className="text-xs text-slate-500 mt-2">Oxygen saturation threshold</p>
              </div>

              <button
                onClick={resetThresholds}
                className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg border border-slate-700 transition"
              >
                Reset to Defaults
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Alert Notifications</h3>
                <label className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800 transition">
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="w-5 h-5 rounded accent-indigo-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-200">Desktop Notifications</p>
                    <p className="text-xs text-slate-500 mt-1">Receive browser alerts for critical sepsis warnings</p>
                  </div>
                </label>
              </div>

              <div className={cn(
                "p-4 rounded-lg border transition",
                notificationsEnabled
                  ? "bg-amber-900/20 border-amber-500/30"
                  : "bg-slate-800/50 border-slate-700"
              )}>
                <p className={cn(
                  "text-sm font-semibold mb-2",
                  notificationsEnabled ? "text-amber-300" : "text-slate-400"
                )}>
                  {notificationsEnabled ? "✓ Notifications Enabled" : "✕ Notifications Disabled"}
                </p>
                <p className="text-xs text-slate-400">
                  {notificationsEnabled
                    ? "You'll receive browser notifications when critical thresholds are exceeded."
                    : "Turn on notifications to stay informed about patient alerts."
                  }
                </p>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                <p className="text-xs text-blue-300">
                  ℹ️ After enabling notifications, you may need to grant browser permissions in your notification center.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4 bg-slate-950/50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
