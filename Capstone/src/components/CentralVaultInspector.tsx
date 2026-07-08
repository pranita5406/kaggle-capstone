"use client";

import React, { useState } from "react";
import { GlobalState } from "../lib/stateVault";
import { Copy, Database, Eye, EyeOff } from "lucide-react";

interface CentralVaultInspectorProps {
  state: GlobalState;
}

export const CentralVaultInspector: React.FC<CentralVaultInspectorProps> = ({ state }) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(state, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          Central JSON Vault
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors"
            title={isVisible ? "Hide Vault Data" : "Show Vault Data"}
          >
            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors text-[11px] font-mono flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      
      <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
        The centralized session state machine holds all learner profile matrices, unlocked knowledge nodes, and assessment logs. It is mutated by validated agent transactions.
      </p>

      <div className="flex-1 min-h-[250px] relative rounded-xl border border-zinc-800/80 bg-zinc-950/70 overflow-hidden flex flex-col">
        {isVisible ? (
          <pre className="flex-1 p-4 text-[10px] font-mono text-indigo-300/90 overflow-y-auto leading-relaxed select-text select-all whitespace-pre-wrap select-none scrollbar-thin">
            {JSON.stringify(state, null, 2)}
          </pre>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-2">
            <Database className="w-8 h-8 opacity-25" />
            <span className="text-xs font-mono">JSON VAULT HIDDEN</span>
          </div>
        )}
      </div>
    </div>
  );
};
