"use client";

import React, { useState, useEffect, useRef } from "react";
import { stateVault } from "../lib/stateVault";
import { Terminal, Trash2 } from "lucide-react";

export const AgentConsole: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = stateVault.subscribeLogs((newLogs) => {
      setLogs(newLogs);
    });
    return unsubscribe;
  }, []);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleClear = () => {
    stateVault.clearLogs();
  };

  const getLogColor = (log: string): string => {
    if (log.includes("[Vault Mutation]")) return "text-amber-400/90";
    if (log.includes("[Parser Agent]")) return "text-sky-400/90";
    if (log.includes("[Assessor Agent]")) return "text-emerald-400/90";
    if (log.includes("[Router Agent]")) return "text-purple-400/90";
    if (log.includes("[Orchestrator]")) return "text-indigo-400/90";
    return "text-zinc-400/90";
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-400" />
          Orchestration Agent Console
        </h2>
        <button
          type="button"
          onClick={handleClear}
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors text-[11px] font-mono flex items-center gap-1"
          title="Clear Console Logs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
        Real-time execution log of the Antigravity ADK agent mesh choreography showing agent negotiations and actions.
      </p>

      <div 
        ref={scrollRef}
        className="flex-1 min-h-[200px] p-4 rounded-xl border border-zinc-800/80 bg-black/80 overflow-y-auto font-mono text-[10.5px] leading-relaxed flex flex-col gap-1.5 scrollbar-thin"
      >
        {logs.map((log, idx) => (
          <div key={idx} className={getLogColor(log)}>
            {log}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-zinc-700 italic text-center my-auto">Console is empty. Perform an action to see logs.</div>
        )}
      </div>
    </div>
  );
};
