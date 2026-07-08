"use client";

import React, { useState, useMemo } from "react";
import { GlobalState, AtomicConcept } from "../lib/stateVault";
import {
  Brain,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

interface MemoryBankSidebarProps {
  state: GlobalState;
}

export const MemoryBankSidebar: React.FC<MemoryBankSidebarProps> = ({ state }) => {
  const { knowledge_vault, student_profile, session } = state;
  const { knowledge_graph, history } = student_profile;
  const { mastered_nodes, struggling_nodes } = knowledge_graph;

  // Expanded module IDs in the syllabus tree
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(knowledge_vault.hierarchical_syllabus.map((m) => m.module_id))
  );

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Derived stats
  const allConcepts = useMemo<AtomicConcept[]>(() => {
    return knowledge_vault.hierarchical_syllabus.flatMap((m) => m.atomic_concepts);
  }, [knowledge_vault.hierarchical_syllabus]);

  const totalConcepts = allConcepts.length;
  const masteredCount = mastered_nodes.length;
  const progressPct = totalConcepts > 0 ? Math.round((masteredCount / totalConcepts) * 100) : 0;

  const totalAttempts = history.length;
  const correctAttempts = history.filter((h) => h.score >= 0.8).length;
  const accuracyPct = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  // Mastered concept objects
  const masteredConcepts = allConcepts.filter((c) => mastered_nodes.includes(c.concept_id));
  // Struggling concept objects
  const struggleConcepts = allConcepts.filter((c) => struggling_nodes.includes(c.concept_id));

  // Current milestone
  const milestone =
    progressPct === 0
      ? "Starting Out"
      : progressPct < 30
      ? "Foundation Builder"
      : progressPct < 60
      ? "Concept Explorer"
      : progressPct < 90
      ? "Advanced Learner"
      : "Knowledge Master";

  const milestoneColor =
    progressPct === 0
      ? "text-zinc-400"
      : progressPct < 30
      ? "text-blue-400"
      : progressPct < 60
      ? "text-indigo-400"
      : progressPct < 90
      ? "text-violet-400"
      : "text-emerald-400";

  return (
    <aside className="flex flex-col h-full bg-slate-950 border-r border-zinc-800/70 w-[360px] shrink-0 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4 border-b border-zinc-800/70 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 leading-tight">Learner Core Memory</h2>
              <p className="text-[10px] text-zinc-500 font-mono">{session.student_id}</p>
            </div>
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-semibold text-emerald-400 font-mono">LIVE</span>
          </div>
        </div>
        <p className="text-[10.5px] text-zinc-500 mt-1 leading-relaxed truncate">{session.course_title}</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-5">

        {/* ── Progress Section ── */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" /> Syllabus Progress
            </span>
            <span className="text-xs font-bold text-indigo-400 font-mono">{progressPct}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Attempted", value: totalAttempts, icon: <Target className="w-3 h-3" />, color: "text-blue-400" },
              { label: "Accuracy", value: `${accuracyPct}%`, icon: <Zap className="w-3 h-3" />, color: "text-indigo-400" },
              {
                label: "Milestone",
                value: milestone,
                icon: <TrendingUp className="w-3 h-3" />,
                color: milestoneColor,
                small: true,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/60 gap-0.5"
              >
                <span className={`${stat.color}`}>{stat.icon}</span>
                <span className={`font-bold leading-tight text-center ${stat.small ? "text-[9px]" : "text-sm"} ${stat.color}`}>
                  {stat.value}
                </span>
                <span className="text-[8px] text-zinc-600 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mastered Concepts ── */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Mastered</span>
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {masteredConcepts.length}
            </span>
          </div>
          {masteredConcepts.length === 0 ? (
            <p className="text-[10.5px] text-zinc-600 italic pl-1">No concepts mastered yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {masteredConcepts.map((c) => (
                <span
                  key={c.concept_id}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {c.name}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ── Target Improvement Areas ── */}
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Target Areas</span>
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              {struggleConcepts.length}
            </span>
          </div>
          {struggleConcepts.length === 0 ? (
            <p className="text-[10.5px] text-zinc-600 italic pl-1">No flagged areas — great work!</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {struggleConcepts.map((c) => (
                <span
                  key={c.concept_id}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20"
                >
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {c.name}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ── Syllabus Hierarchy Tree ── */}
        <section>
          <div className="flex items-center gap-1.5 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Syllabus Map</span>
          </div>

          <div className="space-y-2">
            {knowledge_vault.hierarchical_syllabus.map((module) => {
              const isExpanded = expandedModules.has(module.module_id);
              const moduleMastered = module.atomic_concepts.every((c) =>
                mastered_nodes.includes(c.concept_id)
              );
              const moduleProgress = module.atomic_concepts.length > 0
                ? Math.round(
                    (module.atomic_concepts.filter((c) => mastered_nodes.includes(c.concept_id)).length /
                      module.atomic_concepts.length) *
                      100
                  )
                : 0;

              return (
                <div key={module.module_id} className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden">
                  {/* Module header */}
                  <button
                    type="button"
                    onClick={() => toggleModule(module.module_id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-zinc-800/30 transition-colors text-left group"
                  >
                    <span className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""} text-zinc-500 group-hover:text-zinc-300`}>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-zinc-200 truncate">{module.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1 rounded-full bg-zinc-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${moduleMastered ? "bg-emerald-500" : "bg-indigo-600"}`}
                            style={{ width: `${moduleProgress}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-zinc-600 shrink-0">{moduleProgress}%</span>
                      </div>
                    </div>
                  </button>

                  {/* Concept list */}
                  {isExpanded && (
                    <div className="border-t border-zinc-800/60 divide-y divide-zinc-800/40">
                      {module.atomic_concepts.map((concept) => {
                        const isMastered = mastered_nodes.includes(concept.concept_id);
                        const isStruggling = struggling_nodes.includes(concept.concept_id);
                        const isFocus = knowledge_graph.current_focus_node === concept.concept_id;

                        return (
                          <div
                            key={concept.concept_id}
                            className={`flex items-center gap-2 px-4 py-2 transition-colors ${
                              isFocus ? "bg-indigo-500/10" : "hover:bg-zinc-800/20"
                            }`}
                          >
                            {/* Status dot */}
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isMastered
                                  ? "bg-emerald-500"
                                  : isStruggling
                                  ? "bg-amber-500"
                                  : isFocus
                                  ? "bg-indigo-500 ring-2 ring-indigo-500/20 animate-pulse"
                                  : "bg-zinc-700"
                              }`}
                            />
                            <span
                              className={`text-[11px] leading-tight ${
                                isMastered
                                  ? "text-emerald-400 line-through decoration-emerald-600"
                                  : isFocus
                                  ? "text-indigo-300 font-semibold"
                                  : "text-zinc-400"
                              }`}
                            >
                              {concept.name}
                            </span>
                            {isFocus && (
                              <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-mono shrink-0">
                                FOCUS
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer status bar */}
      <div className="shrink-0 border-t border-zinc-800/70 px-4 py-2.5 flex items-center justify-between">
        <span className="text-[10px] font-mono text-zinc-600">
          {masteredCount}/{totalConcepts} nodes mastered
        </span>
        <span
          className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${
            session.current_status === "COMPLETED"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : session.current_status === "ROUTING_GAP"
              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
              : session.current_status === "ACTIVE_ASSESSMENT"
              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
              : "bg-zinc-500/10 text-zinc-500 border-zinc-700/30"
          }`}
        >
          {session.current_status}
        </span>
      </div>
    </aside>
  );
};
