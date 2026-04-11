"use client";

import { MessageSquare, Syringe, Activity, Pill, User } from "lucide-react";
import { cn } from "@/lib/utils";

const timelineEvents = [
  { time: "06:00", type: "vitals", desc: "Vitals stable. HR 78, BP 110/70", user: "RN. J" },
  { time: "07:30", type: "med", desc: "Administered PO Metoprolol 25mg", user: "RN. J" },
  { time: "08:15", type: "vitals", desc: "HR trending up (92). BP 105/65", user: "Auto" },
  { time: "09:00", type: "note", desc: "MD Note: Patient reports chills. Suspect worsening infection. Orders pending.", user: "Dr. L" },
  { time: "10:00", type: "vitals", desc: "HR 110, BP 95/60. Temp 38.5C", user: "RN. K", alert: true },
  { time: "10:30", type: "lab", desc: "Lactic Acid collected", user: "Phleb. T" },
  { time: "11:15", type: "med", desc: "Started IV NS Bolus 500cc", user: "RN. K" },
  { time: "12:00", type: "vitals", desc: "HR 115, BP 92/58. No improvement post bolus.", user: "Auto", alert: true },
];

export function InteractiveTimeline() {
  return (
    <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-4 overflow-hidden relative">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-indigo-400" />
        Clinical Timeline (Last 6 Hours)
      </h3>
      
      <div className="relative pt-6 pb-2 overflow-x-auto custom-scrollbar">
        {/* The horizontal line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0 min-w-[800px]" />

        <div className="flex justify-between items-center min-w-[800px] relative z-10 px-4">
          {timelineEvents.map((ev, i) => (
            <TimelineNode key={i} event={ev} index={i} total={timelineEvents.length} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineNode({ event, index, total }: any) {
  const isTop = index % 2 === 0;

  const iconMap: Record<string, any> = {
    vitals: Activity,
    note: MessageSquare,
    med: Pill,
    lab: Syringe,
  };
  const Icon = iconMap[event.type] || Activity;

  return (
    <div className="relative flex flex-col items-center group cursor-pointer w-32" style={{ minWidth: "120px" }}>
      {/* Content Top */}
      {isTop && (
        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-40 opacity-80 group-hover:opacity-100 transition-opacity">
          <EventCard event={event} />
        </div>
      )}

      {/* Node Marker */}
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center border-2 bg-slate-900 relative z-10 transition-transform group-hover:scale-110",
        event.alert ? "border-red-500 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]" : "border-indigo-500 text-indigo-400"
      )}>
        <Icon className="w-3 h-3" />
      </div>

      {/* Connecting Stem */}
      <div className={cn(
        "absolute left-1/2 w-0.5 bg-slate-700 -translate-x-1/2",
        isTop ? "bottom-1/2 h-8" : "top-1/2 h-8"
      )} />

      {/* Content Bottom */}
      {!isTop && (
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-40 opacity-80 group-hover:opacity-100 transition-opacity">
          <EventCard event={event} />
        </div>
      )}
      
      {/* Time Label */}
      <div className={cn(
        "absolute text-[10px] font-bold text-slate-400 font-mono tracking-wider",
        isTop ? "top-full mt-2" : "bottom-full mb-2"
      )}>
        {event.time}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  return (
    <div className={cn(
      "bg-slate-800 p-2 rounded border shadow-sm text-xs relative",
      event.alert ? "border-red-900/50 bg-red-900/30" : "border-slate-700"
    )}>
      <div className="text-slate-300 font-medium leading-snug break-words">
        {event.desc}
      </div>
      <div className="flex items-center gap-1 mt-1.5 text-[9px] text-slate-500 font-semibold uppercase">
        <User className="w-2.5 h-2.5" />
        {event.user}
      </div>
    </div>
  );
}
