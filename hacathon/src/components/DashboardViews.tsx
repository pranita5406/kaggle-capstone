"use client";

import { Activity, ShieldAlert, FileText, CheckSquare, Clock, Users, FilePlus, Zap, Printer, AlertTriangle, Syringe, Plus, X, CheckCircle, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/DashboardContext";
import { HighlightedText, SBARKeywordMap } from "@/components/HighlightedKeywords";
import { EmptyTasksState, PatientLoadingState, ErrorState } from "@/components/EmptyStates";

// ----- SBAR FULL VIEW -----
export function SBARFullView({ handoffData }: any) {
  const { phiRedacted } = useDashboard();
  const sbar = handoffData?.sbar;
  const [note, setNote] = useState("");
  const [hoveredVital, setHoveredVital] = useState<string | null>(null);
  
  if (!sbar) return <PatientLoadingState />;

  return (
    <div className="flex flex-col h-full bg-slate-950 p-6">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="text-indigo-400" /> Deep Dive SBAR
          </h2>
          <p className="text-slate-400 text-sm mt-1">Full Clinical Summary with Keyword Intelligence</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium border border-slate-700 transition"
        >
          <Printer className="w-4 h-4" /> Print / Export
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6">
        {/* SITUATION */}
        <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-xl hover:border-indigo-500/50 transition">
          <h3 className="text-indigo-400 font-bold uppercase tracking-wider text-xs mb-3">Situation</h3>
          <HighlightedText 
            text={sbar.situation.text} 
            onHover={(kw) => setHoveredVital(kw?.word || null)}
          />
          {phiRedacted && (
            <div className="mt-3 text-xs bg-slate-950/50 border border-slate-800 p-2 rounded text-slate-400">
              🔒 PII Redaction Active
            </div>
          )}
        </div>

        {/* BACKGROUND */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl hover:border-slate-600 transition">
          <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-3">Background</h3>
          <HighlightedText 
            text={sbar.background.text}
            onHover={(kw) => setHoveredVital(kw?.word || null)}
          />
        </div>

        {/* ASSESSMENT */}
        <div className="bg-amber-900/20 border border-amber-500/30 p-6 rounded-xl hover:border-amber-500/50 transition">
          <h3 className="text-amber-400 font-bold uppercase tracking-wider text-xs mb-3">Assessment</h3>
          <HighlightedText 
            text={sbar.assessment.text}
            onHover={(kw) => setHoveredVital(kw?.word || null)}
          />
          <div className="flex flex-wrap gap-3 mt-4">
            <div 
              onMouseEnter={() => setHoveredVital('delta_hr')}
              onMouseLeave={() => setHoveredVital(null)}
              className={cn(
                "text-sm font-bold px-3 py-2 rounded border transition",
                hoveredVital === 'delta_hr'
                  ? "bg-amber-600 border-amber-400 scale-105"
                  : "bg-amber-950/50 border-amber-900/50"
              )}
            >
              <span className="text-amber-200">Delta HR: </span>
              <span className="text-amber-400">{sbar.assessment?.delta_hr || 'N/A'}</span>
            </div>
            <div 
              onMouseEnter={() => setHoveredVital('delta_bp')}
              onMouseLeave={() => setHoveredVital(null)}
              className={cn(
                "text-sm font-bold px-3 py-2 rounded border transition",
                hoveredVital === 'delta_bp'
                  ? "bg-red-600 border-red-400 scale-105"
                  : "bg-red-950/50 border-red-900/50"
              )}
            >
              <span className="text-red-200">Delta BP: </span>
              <span className="text-red-400">{sbar.assessment?.delta_nibp || 'N/A'}</span>
            </div>
            <div className="text-sm font-bold px-3 py-2 rounded border bg-slate-800/50 border-slate-700">
              <span className="text-slate-300">Risk Level: </span>
              <span className="text-crimson-400">{sbar.assessment?.risk_level || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* RECOMMENDATION */}
        <div className="bg-emerald-900/20 border border-emerald-500/30 p-6 rounded-xl hover:border-emerald-500/50 transition">
          <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-3">Recommendation</h3>
          <ul className="text-slate-200 text-base list-disc pl-5 space-y-2">
            {sbar.recommendation?.actions?.map((action: string, i: number) => (
              <li key={i} className="hover:text-emerald-300 transition">{action}</li>
            ))}
          </ul>
        </div>

        {/* Keyword Map */}
        <SBARKeywordMap />
        
        {/* Clinician Note Input */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 sticky bottom-0">
          <h3 className="text-slate-300 font-semibold mb-3 flex items-center gap-2">
            <CheckSquare className="w-4 h-4" /> Incoming Nurse Acknowledgment Notes
          </h3>
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add handover details, pending follow-ups, or shift goals..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <div className="mt-3 flex justify-end">
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-medium transition">
              Save Note appended to Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- TASKS & ORDERS VIEW -----
export function TasksOrdersView({ handoffData }: any) {
  const [toastMessage, setToastMessage] = useState("");
  const { actionStates, markActionCompleted, demoMode, enableDemoMode } = useDashboard();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  
  // Scrape missing orders from intelligence feed
  const missingOrders = handoffData?.intelligenceFeed?.filter((i: any) => i.type === "gap" && i.message.includes("Missing")) || [];
  
  // Tasks with cross-page sync state
  const mockTasks = [
    { id: "task-1", type: "Nursing Task", text: "Turn patient every 2 hours", priority: "routine" },
    { id: "task-2", type: "Lab Follow-up", text: "Follow up on Sputum culture results", priority: "stat" },
    { id: "task-3", type: "Medication Review", text: "Review PRN Pain Medication effectiveness", priority: "routine" },
    { id: "task-4", type: "Vital Monitoring", text: "Continuous tele-monitoring per protocol", priority: "stat" },
  ];

  const handleTaskClick = (id: string, isDone: boolean) => {
    markActionCompleted(id, !isDone ? 'completed' : 'pending');
    if (!isDone) showToast("✓ Task marked complete globally across all pages");
  };

  const handleCreateOrder = async (orderName: string) => {
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: handoffData?.patient?.patientId,
          orderName,
          orderType: 'lab',
          priority: 'stat'
        })
      });
      
      const data = await response.json();
      markActionCompleted(`order-${orderName}`, 'pending');
      showToast(`✓ Lab Order: ${orderName} - Created and sent to CPOE`);
    } catch (error) {
      showToast("✗ Error creating order. Please retry.");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-6 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg font-medium animate-in fade-in slide-in-from-top-4 z-50">
          {toastMessage}
        </div>
      )}

      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="mb-4 bg-purple-900/40 border border-purple-500/50 p-4 rounded-lg flex items-start gap-3">
          <Zap className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-purple-300 font-semibold">Demo Mode Active</p>
            <p className="text-purple-400 text-sm">Presentation features enabled. Dramatic alerts will trigger automatically.</p>
          </div>
        </div>
      )}

      <div className="mb-6 border-b border-slate-800 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <CheckSquare className="text-indigo-400" /> Tasks & Action Center
            </h2>
            <p className="text-slate-400 text-sm mt-1">Cross-page synchronized action tracking</p>
          </div>
          <button
            onClick={() => enableDemoMode()}
            className="flex items-center gap-2 bg-purple-600/40 hover:bg-purple-600/60 border border-purple-500/50 text-purple-300 px-4 py-2 rounded-lg font-medium transition"
          >
            <Zap className="w-4 h-4" /> Demo Mode
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-4">
        {/* Missing Orders - Action Center */}
        {missingOrders.length > 0 && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-crimson-400 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Immediate Action Required
            </h3>
            <div className="space-y-3">
              {missingOrders.map((order: any, i: number) => {
                const orderKey = `create-order-${i}`;
                const isCompleted = actionStates[orderKey]?.status === 'completed';
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "border p-4 rounded-lg flex items-center justify-between transition",
                      isCompleted 
                        ? "bg-emerald-950/50 border-emerald-900/50" 
                        : "bg-red-950/50 border-red-900/50 hover:border-red-700/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                      ) : (
                        <Activity className="w-5 h-5 text-red-400 mt-0.5 animate-pulse" />
                      )}
                      <div>
                        <h4 className={cn(
                          "font-semibold",
                          isCompleted ? "text-emerald-300 line-through" : "text-red-300"
                        )}>
                          {order.message.split(":")[0]}
                        </h4>
                        <p className={cn(
                          "text-sm mt-1",
                          isCompleted ? "text-emerald-400/60" : "text-red-400/80"
                        )}>
                          {order.message.split(":").slice(1).join(":")}
                        </p>
                      </div>
                    </div>
                    {!isCompleted && (
                      <button 
                        onClick={() => handleCreateOrder(order.message.split(":")[0].replace("Missing Order: ", "").trim())}
                        className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition shrink-0"
                      >
                        <Plus className="w-4 h-4" /> Create
                      </button>
                    )}
                    {isCompleted && (
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Completed</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Shift Tasks with Global Sync */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Shift Tasks</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800">
            {mockTasks.map(task => {
              const isDone = actionStates[task.id]?.status === 'completed';
              return (
                <label 
                  key={task.id} 
                  className={cn(
                    "flex items-center justify-between p-4 cursor-pointer transition",
                    isDone ? "bg-slate-900/50 opacity-60" : "hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                      isDone ? "bg-emerald-600 border-emerald-600" : "border-slate-500 hover:border-indigo-500"
                    )}>
                      {isDone && <CheckSquare className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <span className={cn(
                        "font-medium",
                        isDone ? "text-slate-500 line-through" : "text-slate-200"
                      )}>
                        {task.text}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      "text-xs font-semibold px-2 py-1 rounded uppercase tracking-wider",
                      task.priority === 'stat' 
                        ? "bg-red-900/30 text-red-400 border border-red-900/50"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    )}>
                      {task.priority}
                    </span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={isDone} 
                    onChange={() => handleTaskClick(task.id, isDone)} 
                    className="sr-only" 
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Empty State */}
        {missingOrders.length === 0 && Object.values(actionStates).every(s => s?.status !== 'completed') && (
          <div className="mt-12">
            <EmptyTasksState />
          </div>
        )}
      </div>
    </div>
  );
}

// ----- TIMELINE FULL VIEW -----
export function TimelineFullView({ handoffData }: any) {
  return (
    <div className="flex flex-col h-full bg-slate-950 p-6 overflow-hidden">
      <div className="mb-6 border-b border-slate-800 pb-4 shrink-0">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Clock className="text-indigo-400" /> Clinical Timeline (24 Hour Trace)
        </h2>
        <p className="text-slate-400 text-sm mt-1">Scroll down to view historical cascade of alerts and administrations.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Vertical Timeline implementation */}
        <div className="relative border-l-2 border-slate-800 ml-4 lg:ml-20 space-y-8 py-4">
          
          <TimelineRow 
            time="11:15 AM" user="RN. K" icon={Syringe} color="indigo"
            title="Medication Administration" desc="Started IV NS Bolus 500cc (1st Liter)"
          />
          <TimelineRow 
            time="10:00 AM" user="Auto" icon={Activity} color="red"
            title="Vitals Alert" desc="HR rose to 110. MAP dropped below 65. High Risk."
          />
          <TimelineRow 
            time="09:00 AM" user="Dr. L" icon={FileText} color="amber"
            title="MD Note Published" desc="Patient reports chills. Suspect worsening infection. Pending orders."
          />
          <TimelineRow 
            time="07:30 AM" user="RN. J" icon={Syringe} color="indigo"
            title="Scheduled Med" desc="Administered PO Metoprolol 25mg"
          />
          <TimelineRow 
            time="06:00 AM" user="RN. J" icon={Activity} color="slate"
            title="Vitals Recorded" desc="Shift start vitals. Stable. HR 78, BP 110/70"
          />
          <TimelineRow 
            time="01:00 AM" user="Dr. S" icon={FileText} color="slate"
            title="Admission Note" desc="Admitted for Sepsis Protocol secondary to suspected pneumonia."
          />

        </div>
      </div>
    </div>
  );
}

function TimelineRow({ time, user, icon: Icon, color, title, desc }: any) {
  const colorMap: any = {
    indigo: "bg-indigo-900/50 text-indigo-400 border-indigo-500/30",
    red: "bg-red-900/50 text-crimson-400 border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]",
    amber: "bg-amber-900/50 text-amber-400 border-amber-500/30",
    slate: "bg-slate-800 text-slate-300 border-slate-700",
  };

  return (
    <div className="relative pl-8 lg:pl-16">
       <span className="absolute -left-[45px] lg:-left-[100px] top-1 text-slate-400 text-sm font-bold font-mono tracking-wider">{time}</span>
       <div className={cn("absolute -left-3.5 top-0 w-7 h-7 rounded-full border-2 border-slate-950 flex items-center justify-center", colorMap[color])}>
         <Icon className="w-3.5 h-3.5" />
       </div>
       <div className={cn("bg-slate-900 border p-4 rounded-xl", colorMap[color])}>
         <h3 className="font-semibold">{title}</h3>
         <p className="text-sm mt-1 opacity-90">{desc}</p>
         <div className="flex items-center gap-1.5 mt-3 text-xs opacity-70 font-semibold uppercase tracking-wider">
           Authored by: {user}
         </div>
       </div>
    </div>
  );
}

// ----- PATIENT DIRECTORY VIEW -----
export function PatientDirectoryView() {
  const { patients, switchPatient, currentPatient, triggerDiscordantTrend, enableDemoMode } = useDashboard();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handlePatientSwitch = (patientId: string) => {
    setSelectedPatientId(patientId);
    switchPatient(patientId);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-6">
      <div className="mb-6 border-b border-slate-800 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="text-indigo-400" /> Unit Patient Directory
            </h2>
            <p className="text-slate-400 text-sm mt-1">Click to switch patient context - all pages will auto-update</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { enableDemoMode(); triggerDiscordantTrend(); }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Zap className="w-4 h-4" /> Demo Alert
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {patients.map((patient, i) => (
            <div
              key={patient.id}
              onClick={() => handlePatientSwitch(patient.id)}
              className={cn(
                "p-5 rounded-lg border-2 transition-all cursor-pointer group",
                currentPatient?.id === patient.id
                  ? "bg-indigo-900/40 border-indigo-500  scale-105"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">
                      {patient.firstName} {patient.lastName}
                    </h3>
                    {currentPatient?.id === patient.id && (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono">MRN: {patient.mrn}</p>
                </div>
                <div className={cn(
                  "text-2xl font-bold px-3 py-2 rounded-lg",
                  i % 3 === 0 ? "bg-red-900/50 text-red-400" :
                  i % 3 === 1 ? "bg-amber-900/50 text-amber-400" :
                  "bg-slate-800 text-slate-400"
                )}>
                  Bed {String.fromCharCode(65 + i)}{i + 1}
                </div>
              </div>

              <div className="mb-3 text-sm">
                <p className="text-slate-300 mb-1">
                  <span className="font-semibold">Protocol: </span>
                  <span className="text-slate-400">{patient.admissionReason}</span>
                </p>
                <p className="text-slate-400 text-xs">
                  <span className="font-semibold">Admission: </span>
                  {new Date(patient.dob).toLocaleDateString()}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">ID: {patient.id}</span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

