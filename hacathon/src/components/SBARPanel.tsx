"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Link2, FilePlus, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function SBARPanel({ handoffData }: any) {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Follow up on generic Sputum culture results", done: false },
    { id: 2, text: "Review PRN Pain Medication effectiveness", done: true }
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const sbar = handoffData?.sbar;
  if (!sbar) return null;

  return (
    <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden flex flex-col h-full">
      <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-400" />
          <h2 className="text-white font-semibold flex items-center gap-2 tracking-tight">AI-Generated SBAR Handoff</h2>
        </div>
        <span className="text-xs text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md font-medium font-mono border border-slate-800">Synced: Just now</span>
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-6 bg-slate-900">
        
        <SBARSection title="Situation" color="indigo">
          <p className="text-slate-300 leading-relaxed text-sm">
            {sbar.situation.text}
          </p>
        </SBARSection>

        <SBARSection title="Background" color="slate">
          <p className="text-slate-300 leading-relaxed text-sm">
            {sbar.background.text}
          </p>
        </SBARSection>

        <SBARSection title="Assessment" color="amber">
          <p className="text-slate-300 leading-relaxed text-sm">
            {sbar.assessment.text}
          </p>
          <div className="flex gap-4 mt-2">
            <span className="text-xs text-amber-500 font-bold bg-amber-950/50 border border-amber-900/50 px-2 py-1 rounded">Delta HR: {sbar.assessment.delta_hr}</span>
            <span className="text-xs text-crimson-400 font-bold bg-red-950/50 border border-red-900/50 px-2 py-1 rounded">Delta BP: {sbar.assessment.delta_nibp}</span>
          </div>
        </SBARSection>

        <SBARSection title="Recommendation" color="emerald">
          <ul className="text-slate-300 leading-relaxed text-sm list-disc pl-4 space-y-2">
            {sbar.recommendation.actions.map((action: string, i: number) => (
              <li key={i}>{action}</li>
            ))}
          </ul>
        </SBARSection>

      </div>

      {/* Unresolved Actions embedded in SBAR context */}
      <div className="bg-slate-800 border-t border-slate-700 p-4">
        <h3 className="text-sm font-semibold tracking-tight text-white mb-3 flex items-center gap-2">
          <FilePlus className="h-4 w-4 text-slate-400" />
          Unresolved Discontinuity Actions
        </h3>
        <div className="space-y-2">
          {tasks.map((task) => (
            <label key={task.id} className={cn("flex items-start gap-3 p-2 rounded-lg transition-colors cursor-pointer border", task.done ? "opacity-60 bg-slate-900 border-transparent" : "hover:bg-slate-700 border-slate-700 bg-slate-800")}>
              <Checkbox 
                checked={task.done} 
                onCheckedChange={() => toggleTask(task.id)} 
                className="mt-0.5 border-slate-500"
              />
              <span className={cn("text-sm font-medium", task.done ? "text-slate-500 line-through" : "text-slate-200")}>
                {task.text}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function SBARSection({ title, color, children }: { title: string, color: string, children: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-400 bg-indigo-900/40 border-indigo-500/30",
    amber: "text-amber-400 bg-amber-900/40 border-amber-500/30",
    slate: "text-slate-300 bg-slate-800 border-slate-700",
    emerald: "text-emerald-400 bg-emerald-900/40 border-emerald-500/30",
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-2">
        <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border", colorMap[color])}>
          {title}
        </span>
      </div>
      <div className="pl-2 border-l-2 border-slate-700 ml-2">
        {children}
      </div>
    </div>
  );
}
