"use client";

import { cn } from "@/lib/utils";
import { Activity, ShieldAlert, FileText, CheckSquare, Clock, Settings, Users, LogOut, Zap, Eye } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/context/AuthContext";
import { SettingsModal } from "@/components/SettingsModal";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function SidebarNav({ activeTab, setActiveTab }: SidebarNavProps) {
  const { phiRedacted, setPhiRedacted, enableDemoMode, triggerDiscordantTrend } = useDashboard();
  const { logout } = useAuth();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setIsLogoutDialogOpen(false);
    router.push("/login");
  };

  return (
    <>
      <div className="w-16 lg:w-64 bg-slate-900 border-r border-slate-800 text-slate-400 flex flex-col h-full z-10 transition-all duration-300">
        <div 
          className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition"
          onClick={() => setActiveTab('home')}
        >
          <Activity className="h-8 w-8 text-indigo-400" />
          <span className="hidden lg:block ml-3 font-semibold text-white tracking-tight text-lg hover:text-indigo-200 transition-colors">Sentinel.</span>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-2 relative overflow-y-auto">
          <NavItem icon={ShieldAlert} label="Intelligence Feed" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={FileText} label="SBAR Summary" active={activeTab === 'sbar'} onClick={() => setActiveTab('sbar')} />
          <NavItem icon={CheckSquare} label="Tasks & Orders" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
          <NavItem icon={Clock} label="Timeline" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
          <NavItem icon={Users} label="Patient Directory" active={activeTab === 'directory'} onClick={() => setActiveTab('directory')} />
        </div>

        <div className="py-4 border-t border-slate-800 flex flex-col gap-2">
          {/* PII Redaction Toggle */}
          <button
            onClick={() => setPhiRedacted(!phiRedacted)}
            className={cn(
              "flex w-full items-center justify-center lg:justify-start px-0 lg:px-6 py-3 ml-2 lg:ml-0 transition-colors duration-200 group relative",
              phiRedacted 
                ? "text-emerald-300 bg-emerald-950/30 border-r-2 border-emerald-400"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            )}
            title={phiRedacted ? "PII Redaction Active" : "Click to Redact PII"}
          >
            <Eye className="h-5 w-5" />
            <span className="hidden lg:block ml-4 text-sm font-medium">
              {phiRedacted ? "PII Hidden" : "Show PII"}
            </span>
            <span className="lg:hidden absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              {phiRedacted ? "PII Hidden" : "Show PII"}
            </span>
          </button>

          {/* Demo Mode Trigger */}
          <button
            onClick={() => {
              enableDemoMode();
              triggerDiscordantTrend();
            }}
            className={cn(
              "flex w-full items-center justify-center lg:justify-start px-0 lg:px-6 py-3 ml-2 lg:ml-0 transition-colors duration-200 group relative",
              "text-purple-300 bg-purple-950/30 border-r-2 border-purple-400 hover:bg-purple-950/50"
            )}
            title="Trigger Demo Alert"
          >
            <Zap className="h-5 w-5 animate-pulse" />
            <span className="hidden lg:block ml-4 text-sm font-medium">Demo Mode</span>
            <span className="lg:hidden absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              Demo Alert
            </span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={cn(
              "flex w-full items-center justify-center lg:justify-start px-0 lg:px-6 py-3 ml-2 lg:ml-0 transition-colors duration-200 group relative",
              isSettingsOpen
                ? "text-slate-100 bg-slate-800/50 border-r-2 border-indigo-400"
                : "hover:text-slate-200 hover:bg-slate-800/30 text-slate-400"
            )}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
            <span className="hidden lg:block ml-4 text-sm font-medium">Settings</span>
            <span className="lg:hidden absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              Settings
            </span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center justify-center lg:justify-start px-0 lg:px-6 py-3 ml-2 lg:ml-0 transition-colors duration-200 group relative",
              "text-red-400 hover:text-red-300 hover:bg-red-950/30"
            )}
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden lg:block ml-4 text-sm font-medium">Sign Out</span>
            <span className="lg:hidden absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              Sign Out
            </span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        title="Sign Out"
        message="Are you sure you want to sign out? All clinical data will be securely erased from your session for HIPAA compliance."
        confirmText="Sign Out"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />
    </>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-center lg:justify-start px-0 lg:px-6 py-3 ml-2 lg:ml-0 transition-colors duration-200 group relative",
        active ? "text-white bg-slate-800/50 border-r-2 border-indigo-400" : "hover:text-indigo-200 hover:bg-slate-800/30"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="hidden lg:block ml-4 text-sm font-medium">{label}</span>
      {/* Tooltip for mobile sidebar */}
      <span className="lg:hidden absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
        {label}
      </span>
    </button>
  );
}
