"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeywordHighlight {
  word: string;
  relevance: "critical" | "high" | "medium";
  tooltip: string;
  sourceData?: string;
  timestamp?: Date;
}

// Define critical clinical keywords
const CLINICAL_KEYWORDS: Record<string, KeywordHighlight> = {
  sepsis: {
    word: "sepsis",
    relevance: "critical",
    tooltip: "Systemic inflammatory response to infection. Requires immediate intervention.",
    sourceData: "Lab: Lactic Acid 3.1 mmol/L",
    timestamp: new Date(Date.now() - 4 * 3600000)
  },
  pneumonia: {
    word: "pneumonia",
    relevance: "high",
    tooltip: "Lower respiratory tract infection. Monitor SpO2 and respiratory rate.",
    sourceData: "CXR: Infiltrate RLL"
  },
  tachycardia: {
    word: "tachycardia",
    relevance: "high",
    tooltip: "Heart rate elevated. Associated with hemodynamic instability.",
    sourceData: "Latest HR: 115 bpm (↑35 from baseline)"
  },
  "lactic acid": {
    word: "lactic acid",
    relevance: "critical",
    tooltip: "Marker of tissue hypoperfusion and anaerobic metabolism.",
    sourceData: "Lab Value: 3.1 mmol/L (normal <2.0)"
  },
  hypotension: {
    word: "hypotension",
    relevance: "critical",
    tooltip: "Low blood pressure. Requires aggressive fluid resuscitation.",
    sourceData: "SBP: 92 mmHg (↓28 from baseline)"
  },
  "bolus": {
    word: "bolus",
    relevance: "high",
    tooltip: "Rapid administration of medication/fluid. Critical intervention for shock.",
    sourceData: "Ordered: 500cc NS bolus"
  },
  resuscitation: {
    word: "resuscitation",
    relevance: "critical",
    tooltip: "Emergency intervention to restore perfusion. Sepsis Bundle Protocol",
    sourceData: "Time-Sensitive: SEP-1 Bundles"
  },
};

interface HighlightedTextProps {
  text: string;
  onHover?: (keyword: KeywordHighlight | null) => void;
}

export function HighlightedText({ text, onHover }: HighlightedTextProps) {
  const [hoveredKeyword, setHoveredKeyword] = useState<KeywordHighlight | null>(null);

  const words = text.split(/(\s+)/).map((word, idx) => {
    const lowerWord = word.toLowerCase();
    const keyword = Object.values(CLINICAL_KEYWORDS).find(
      k => lowerWord.includes(k.word)
    );

    if (keyword && word.toLowerCase().includes(keyword.word)) {
      const baseWord = word.substring(0, word.indexOf(keyword.word));
      const afterWord = word.substring(word.indexOf(keyword.word) + keyword.word.length);

      return (
        <span key={idx}>
          {baseWord}
          <KeywordBadge
            keyword={keyword}
            onHover={(kw) => {
              setHoveredKeyword(kw);
              onHover?.(kw);
            }}
          />
          {afterWord}
        </span>
      );
    }

    return <span key={idx}>{word}</span>;
  });

  return <div className="relative">{words}</div>;
}

function KeywordBadge({
  keyword,
  onHover,
}: {
  keyword: KeywordHighlight;
  onHover: (kw: KeywordHighlight | null) => void;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const colorScheme = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
    high: "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30",
    medium: "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30",
  };

  return (
    <span
      onMouseEnter={() => {
        setShowTooltip(true);
        onHover(keyword);
      }}
      onMouseLeave={() => {
        setShowTooltip(false);
        onHover(null);
      }}
      className={cn(
        "relative inline-block px-1.5 py-0.5 rounded border transition-colors cursor-help font-semibold",
        colorScheme[keyword.relevance]
      )}
    >
      {keyword.word}
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start gap-2 mb-2">
            <div className={cn(
              "p-1 rounded",
              keyword.relevance === "critical" ? "bg-red-500/20" : keyword.relevance === "high" ? "bg-amber-500/20" : "bg-blue-500/20"
            )}>
              {keyword.relevance === "critical" && <AlertTriangle className="w-4 h-4 text-red-400" />}
              {keyword.relevance === "high" && <TrendingUp className="w-4 h-4 text-amber-400" />}
              {keyword.relevance === "medium" && <CheckCircle className="w-4 h-4 text-blue-400" />}
            </div>
            <h4 className="font-semibold text-white capitalize">{keyword.word}</h4>
          </div>
          
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">{keyword.tooltip}</p>
          
          {keyword.sourceData && (
            <div className="bg-slate-950/50 border border-slate-800 rounded p-2 text-[11px]">
              <span className="text-slate-400">Source: </span>
              <span className="text-emerald-400 font-mono">{keyword.sourceData}</span>
              {keyword.timestamp && (
                <div className="text-slate-500 mt-1">
                  {keyword.timestamp.toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </span>
  );
}

export function SBARKeywordMap() {
  const [activeKeyword, setActiveKeyword] = useState<string>("");

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mt-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
        Critical Keywords Found:
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {Object.values(CLINICAL_KEYWORDS).map((kw) => (
          <div
            key={kw.word}
            onMouseEnter={() => setActiveKeyword(kw.word)}
            onMouseLeave={() => setActiveKeyword("")}
            className={cn(
              "px-2 py-1.5 rounded text-xs font-semibold border transition-all cursor-pointer",
              activeKeyword === kw.word
                ? "bg-slate-700 border-slate-600 scale-105"
                : "bg-slate-900/50 border-slate-800 hover:bg-slate-800"
            )}
          >
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                kw.relevance === "critical"
                  ? "bg-red-500"
                  : kw.relevance === "high"
                  ? "bg-amber-500"
                  : "bg-blue-500"
              }`}
            />
            {kw.word}
          </div>
        ))}
      </div>
    </div>
  );
}
