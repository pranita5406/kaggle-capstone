"use client";

import React from "react";
import { GlobalState, AtomicConcept } from "../lib/stateVault";

interface ConceptGraphProps {
  state: GlobalState;
  onSelectNode: (nodeId: string) => void;
}

export const ConceptGraph: React.FC<ConceptGraphProps> = ({ state, onSelectNode }) => {
  const { knowledge_vault, student_profile } = state;
  const { knowledge_graph } = student_profile;
  const { unlocked_nodes, mastered_nodes, struggling_nodes, current_focus_node } = knowledge_graph;

  // Flatten all concepts from the syllabus
  const concepts: AtomicConcept[] = [];
  knowledge_vault.hierarchical_syllabus.forEach(mod => {
    mod.atomic_concepts.forEach(concept => {
      concepts.push(concept);
    });
  });

  // Fixed layout coordinates for static nodes to keep it clean and beautiful
  const positions: Record<string, { x: number; y: number }> = {
    "CON_001_AND": { x: 150, y: 80 },
    "CON_002_OR": { x: 350, y: 80 },
    "CON_003_XOR": { x: 250, y: 220 },
    "CON_004_VAR": { x: 550, y: 80 },
    "CON_005_LOOP": { x: 550, y: 220 }
  };

  // Dynamically position extracted/new concepts
  let extCount = 0;
  concepts.forEach(c => {
    if (!positions[c.concept_id]) {
      positions[c.concept_id] = {
        x: 150 + extCount * 200,
        y: 360
      };
      extCount++;
    }
  });

  const getNodeStatus = (id: string): "locked" | "unlocked" | "mastered" | "struggling" | "focus" => {
    if (current_focus_node === id) return "focus";
    if (mastered_nodes.includes(id)) return "mastered";
    if (struggling_nodes.includes(id)) return "struggling";
    if (unlocked_nodes.includes(id)) return "unlocked";
    return "locked";
  };

  // Generate connection links
  const links: { from: { x: number; y: number }; to: { x: number; y: number }; key: string; isUnlocked: boolean }[] = [];
  concepts.forEach(c => {
    c.prerequisites.forEach(prereqId => {
      const fromPos = positions[prereqId];
      const toPos = positions[c.concept_id];
      if (fromPos && toPos) {
        links.push({
          from: fromPos,
          to: toPos,
          key: `${prereqId}-${c.concept_id}`,
          isUnlocked: unlocked_nodes.includes(c.concept_id)
        });
      }
    });
  });

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          Interactive Knowledge Graph
        </h2>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Mastered
          </span>
          <span className="flex items-center gap-1.5 text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> Focus
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Struggling
          </span>
          <span className="flex items-center gap-1.5 text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-zinc-700" /> Locked
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[300px] border border-zinc-800/80 bg-zinc-950/70 rounded-xl relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full min-h-[380px]" viewBox="0 0 700 420">
          <defs>
            <filter id="glow-focus" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-struggle" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#3f3f46" />
            </marker>
            <marker id="arrow-unlocked" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
            </marker>
          </defs>

          {/* Links/Edges */}
          {links.map(link => (
            <line
              key={link.key}
              x1={link.from.x}
              y1={link.from.y}
              x2={link.to.x}
              y2={link.to.y}
              stroke={link.isUnlocked ? "#4f46e5" : "#27272a"}
              strokeWidth={link.isUnlocked ? 2.5 : 1.5}
              strokeDasharray={link.isUnlocked ? "none" : "4 4"}
              markerEnd={link.isUnlocked ? "url(#arrow-unlocked)" : "url(#arrow)"}
              className="transition-all duration-500"
            />
          ))}

          {/* Nodes */}
          {concepts.map(concept => {
            const pos = positions[concept.concept_id] || { x: 350, y: 200 };
            const status = getNodeStatus(concept.concept_id);
            
            let color = "fill-zinc-800 stroke-zinc-700 text-zinc-500";
            let filter = "";
            let pulseClass = "";

            if (status === "focus") {
              color = "fill-indigo-950 stroke-indigo-500 text-indigo-200 font-bold";
              filter = "url(#glow-focus)";
              pulseClass = "animate-pulse";
            } else if (status === "mastered") {
              color = "fill-emerald-950 stroke-emerald-500 text-emerald-300";
            } else if (status === "struggling") {
              color = "fill-rose-950 stroke-rose-500 text-rose-300";
              filter = "url(#glow-struggle)";
            } else if (status === "unlocked") {
              color = "fill-blue-950 stroke-blue-500 text-blue-300";
            }

            return (
              <g
                key={concept.concept_id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => status !== "locked" && onSelectNode(concept.concept_id)}
                className={`cursor-pointer group transition-all duration-300 select-none ${status === "locked" ? "opacity-40 cursor-not-allowed" : "hover:scale-105"}`}
              >
                {/* Node Outer Circle Glow */}
                <circle
                  r={22}
                  className={`transition-all duration-300 ${color}`}
                  strokeWidth={2}
                  filter={filter}
                />
                
                {/* Inner decorative circle for focus node */}
                {status === "focus" && (
                  <circle
                    r={26}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth={1}
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Node Text Label */}
                <text
                  y={40}
                  textAnchor="middle"
                  className={`text-[11px] transition-colors duration-300 ${
                    status === "focus" ? "fill-indigo-300 font-semibold" : "fill-zinc-400 group-hover:fill-zinc-200"
                  }`}
                >
                  {concept.name}
                </text>

                {/* Node Symbol/ID */}
                <text
                  dy=".3em"
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-zinc-300 select-none pointer-events-none"
                >
                  {concept.concept_id.replace("CON_", "").substring(0, 5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
