"use client";

import { AlertTriangle, Clock, Activity, FileWarning, Search, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/DashboardContext";
import { useEffect, useState } from "react";

export function IntelligenceFeed({ vitalsData, handoffData, isLoading, timedOut }: any) {
  const { lastIntelligenceUpdate, discordantTrendActive, actionStates } = useDashboard();
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());

  // Collect all gaps from both sources
  const fallbackTrend = {
    id: 'demo-discordant-trend',
    type: 'trend',
    severity: 'high',
    timestamp: new Date().toISOString(),
    message: 'Discordant Trend Detected: HR rising while NIBP dropping. Clinical insight: Potential Hypovolemic Shock or Uncompensated Sepsis.',
    clinical_insight: 'Potential Hypovolemic Shock or Uncompensated Sepsis.',
    isDemoAlert: true,
  };

  const rawGaps = [
    ...(vitalsData?.analysis?.flaggedInsights || []),
    ...(handoffData?.intelligenceFeed || [])
  ];
  const gaps = rawGaps.length ? rawGaps : [fallbackTrend];
  const isAnalyzing = isLoading && !timedOut;

  // Trigger animation when new gaps appear
  useEffect(() => {
    gaps.forEach(gap => {
      if (!animatingCards.has(gap.id)) {
        setAnimatingCards(prev => new Set(prev).add(gap.id));
        setTimeout(() => {
          setAnimatingCards(prev => {
            const updated = new Set(prev);
            updated.delete(gap.id);
            return updated;
          });
        }, 1000);
      }
    });
  }, [gaps, animatingCards]);

  // Trigger demo alert animation
  useEffect(() => {
    if (discordantTrendActive) {
      // Pulse effect for demo mode
    }
  }, [discordantTrendActive]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden shadow-xl">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 backdrop-blur top-0 sticky z-10">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Search className="w-4 h-4 text-amber-400" />
          Intelligence Feed
        </h2>
        <div className="flex items-center gap-2">
          {discordantTrendActive && (
            <div className="flex items-center gap-1 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              <Zap className="w-3 h-3" /> ALERT
            </div>
          )}
          <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">
            {gaps.length} Items
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {timedOut ? (
          <div className="rounded-3xl border border-crimson-700 bg-crimson-950/90 p-6 text-center">
            <AlertTriangle className="w-7 h-7 mx-auto text-crimson-300 mb-3" />
            <h3 className="text-sm font-semibold text-crimson-100">Connection Time-out</h3>
            <p className="text-xs text-slate-400 mt-2">Unable to sync clinical source. Verify network and data feed.</p>
          </div>
        ) : isAnalyzing ? (
          <div className="rounded-3xl border border-purple-700/80 bg-slate-900/90 p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-200">System Analyzing</p>
                <p className="text-[11px] text-slate-500 mt-1">0 Gaps found</p>
              </div>
              <div className="h-8 px-3 rounded-full bg-purple-800/90 text-purple-100 text-[11px] uppercase tracking-[0.15em] flex items-center justify-center">Pending</div>
            </div>
            <div className="h-24 rounded-3xl bg-gradient-to-r from-violet-700 via-purple-800 to-violet-700/40 relative overflow-hidden">
              <div className="absolute inset-y-0 left-4 w-[55%] rounded-full bg-violet-500/20 blur-xl" />
              <div className="absolute bottom-4 left-6 h-1.5 w-4/5 rounded-full bg-violet-400/40" />
            </div>
          </div>
        ) : gaps.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <Activity className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-xs">No active alerts</p>
              <p className="text-slate-600 text-xs">All systems nominal</p>
            </div>
          </div>
        ) : (
          gaps.map((gap, i) => (
            <GapCard 
              key={gap.id || i} 
              gap={gap} 
              isAnimating={animatingCards.has(gap.id)}
              isDemoAlert={gap.isDemoAlert}
              isCompletionUpdate={lastIntelligenceUpdate > 0}
            />
          ))
        )}
      </div>
    </div>
  );
}

function GapCard({ 
  gap, 
  isAnimating,
  isDemoAlert,
  isCompletionUpdate
}: { 
  gap: any;
  isAnimating: boolean; 
  isDemoAlert?: boolean;
  isCompletionUpdate?: boolean;
}) {
  const isCritical = gap.severity === "high" || gap.severity === "critical";
  
  const getIcon = (type: string) => {
    switch (type) {
      case "trend": return Activity;
      case "gap": return FileWarning;
      case "task": return Clock;
      default: return AlertTriangle;
    }
  };
  const Icon = getIcon(gap.type);

  return (
    <div 
      className={cn(
        "group relative p-4 rounded-lg border transition-all cursor-pointer animate-in",
        isDemoAlert && "ring-2 ring-purple-500 ring-inset",
        isAnimating && "scale-105",
        isCritical 
          ? "bg-red-950/20 border-red-900/50 hover:bg-red-950/40 hover:border-red-500/50" 
          : "bg-amber-950/20 border-amber-900/50 hover:bg-amber-950/40 hover:border-amber-500/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-md shrink-0 mt-0.5",
          isDemoAlert && "animate-pulse",
          isCritical ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
        )}>
          <Icon className={cn("w-4 h-4", isDemoAlert && "animate-bounce")} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1 gap-2">
            <h3 className={cn(
              "text-sm font-semibold tracking-tight leading-tight",
              isCritical ? "text-red-300" : "text-amber-300"
            )}>
              {gap.type === "trend" ? "Discordant Trend Detected" : gap.message.split(":")[0]}
            </h3>
            <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0 whitespace-nowrap">
              {new Date(gap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed mt-1.5 line-clamp-2">
            {gap.type === "trend" ? gap.message : gap.message.split(":").slice(1).join(":")}
          </p>
          
          {gap.clinical_insight && (
            <div className={cn(
              "mt-2 p-2 rounded border text-[11px]",
              isDemoAlert 
                ? "bg-purple-950/80 border-purple-800 animate-pulse"
                : "bg-slate-950/50 border-slate-800"
            )}>
              <span className="text-slate-400 block mb-0.5 uppercase font-bold text-[9px]">Insight:</span>
              <span className={cn(
                "font-semibold",
                isCritical ? "text-crimson-400" : "text-amber-400",
                isDemoAlert && "text-purple-400"
              )}>
                {gap.clinical_insight}
              </span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button className={cn(
              "text-xs font-medium px-2 py-1 rounded",
              isCritical ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
            )}>
              View Details
            </button>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Status badges */}
      {gap.type === "gap" && (
        <div className="absolute -top-2.5 right-3 bg-indigo-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm border border-indigo-600">
          Pending
        </div>
      )}
      {gap.type === "task" && (
        <div className="absolute -top-2.5 right-3 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm border border-amber-600 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" /> Overdue
        </div>
      )}
      {isDemoAlert && (
        <div className="absolute -top-2.5 left-3 bg-purple-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm border border-purple-500 flex items-center gap-1 animate-pulse">
          <Zap className="w-2.5 h-2.5" /> Demo
        </div>
      )}
    </div>
  );
}
