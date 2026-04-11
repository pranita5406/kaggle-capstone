"use client";

import { useQuery } from "@tanstack/react-query";
import { SidebarNav } from "@/components/SidebarNav";
import { RiskProfileHeader } from "@/components/RiskProfileHeader";
import { IntelligenceFeed } from "@/components/IntelligenceFeed";
import { SBARPanel } from "@/components/SBARPanel";
import { InteractiveTimeline } from "@/components/InteractiveTimeline";
import { AlertCircle, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { SBARFullView, TasksOrdersView, TimelineFullView, PatientDirectoryView } from "@/components/DashboardViews";
import { ErrorState, PatientLoadingState } from "@/components/EmptyStates";
import { LoginScreen } from "@/components/LoginScreen";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/context/AuthContext";

// Wrapper component that handles auth check
export function DashboardClient() {
  const { isAuthenticated } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only render content after hydration
  if (!isMounted) {
    return <DashboardSkeleton />;
  }

  // Check auth after hydration
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // After auth check passed, render the actual dashboard
  return <DashboardContent />;
}

// Main dashboard component with all data queries
function DashboardContent() {
  const { patientId, phiRedacted, discordantTrendActive, demoMode } = useDashboard();
  const [activeTab, setActiveTab] = useState('home');
  const [demoAlertVisible, setDemoAlertVisible] = useState(false);
  const [cachedPatient, setCachedPatient] = useState<any>(null);
  const [didTimeout, setDidTimeout] = useState(false);

  // Trigger demo alert when discordantTrendActive changes
  useEffect(() => {
    if (discordantTrendActive) {
      setDemoAlertVisible(true);
      const timer = setTimeout(() => setDemoAlertVisible(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [discordantTrendActive]);

  // Hydrate cached patient info from local storage
  useEffect(() => {
    const cache = localStorage.getItem("sentinel-last-patient");
    if (cache) {
      try {
        setCachedPatient(JSON.parse(cache));
      } catch {
        setCachedPatient(null);
      }
    }
  }, []);

  const { data: vitalsData, error: vitalsError, isLoading: vitalsLoading, refetch: refetchVitals } = useQuery({
    queryKey: ['vitals', patientId, phiRedacted],
    queryFn: async () => {
      const res = await fetch(`/api/vitals/${patientId}`, { 
        headers: { 'x-redact-pii': phiRedacted.toString() } 
      });
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        return json;
      } catch (e) {
        throw new Error("Data Stream Interrupted: Check Clinical Data Source.");
      }
    },
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60,
  });

  const { data: handoffData, error: handoffError, isLoading: handoffLoading } = useQuery({
    queryKey: ['handoff', patientId, phiRedacted],
    queryFn: async () => {
      const res = await fetch(`/api/handoff/${patientId}`, { 
        headers: { 'x-redact-pii': phiRedacted.toString() } 
      });
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        return json;
      } catch (e) {
        throw new Error("Data Stream Interrupted: Check Clinical Data Source.");
      }
    },
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60,
  });

  const isLoading = vitalsLoading || handoffLoading;
  const hasData = !!vitalsData?.vitals?.length;
  const timedOut = didTimeout || !!vitalsError || !!handoffError;

  // Store the most recent patient for optimistic header rendering
  useEffect(() => {
    if (handoffData?.patient) {
      try {
        localStorage.setItem("sentinel-last-patient", JSON.stringify(handoffData.patient));
        setCachedPatient(handoffData.patient);
      } catch {
        // ignore
      }
    }
  }, [handoffData]);

  useEffect(() => {
    if (isLoading) {
      const timer = window.setTimeout(() => setDidTimeout(true), 10000);
      return () => window.clearTimeout(timer);
    }
    setDidTimeout(false);
  }, [isLoading]);

  const patientFallback = {
    patientId: "123",
    mrn: "882-114-001",
    firstName: "John",
    lastName: "Doe",
    dob: "1959-05-12",
    currentProtocol: "Sepsis",
  };

  const optimisticVitals = Array.from({ length: 7 }).map((_, index) => ({
    timestamp: new Date(Date.now() - (6 - index) * 60000).toISOString(),
    heartRate: 82,
    nibpSystolic: 120,
    nibpDiastolic: 76,
    spo2: 96,
  }));

  const optimisticAnalysis = {
    deltas: { hrDeltaPct: 0, nibpDeltaPct: 0 },
    flaggedInsights: [],
  };

  const effectiveVitalsData = vitalsData ?? { vitals: optimisticVitals, analysis: optimisticAnalysis };
  const effectiveHandoffData = handoffData ?? { patient: cachedPatient || patientFallback, intelligenceFeed: [] };

  const showSyncBadge = isLoading && !timedOut;
  const showTimeoutMessage = timedOut && !hasData;

  return (
    <div className={"flex h-screen overflow-hidden bg-slate-950 text-slate-200 animate-in fade-in duration-700 zoom-in-95" + (demoAlertVisible ? " ring-2 ring-purple-500" : "")}>
      {/* Demo Mode Alert Overlay */}
      {demoAlertVisible && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-purple-600 border border-purple-400 text-white px-6 py-3 rounded-lg shadow-2xl font-bold flex items-center gap-2 z-[100] animate-in slide-in-from-top-4">
          <Zap className="w-5 h-5 animate-pulse" /> 
          CRITICAL ALERT: Discordant Trend Detected!
        </div>
      )}

      <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {activeTab === 'home' && (
          <>
            <RiskProfileHeader
              vitalsData={effectiveVitalsData}
              handoffData={effectiveHandoffData}
              timeout={showTimeoutMessage}
            />
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
              <div className="max-w-[1600px] mx-auto h-full flex flex-col xl:flex-row gap-6">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                  <div className="flex-1 min-h-[400px]">
                    <SBARPanel handoffData={effectiveHandoffData} />
                  </div>
                  <div className="shrink-0">
                    <InteractiveTimeline />
                  </div>
                </div>

                {/* Right Sidebar - Intelligence Feed */}
                <div className="w-full xl:w-96 shrink-0 h-[600px] xl:h-auto">
                  <IntelligenceFeed
                    vitalsData={effectiveVitalsData}
                    handoffData={effectiveHandoffData}
                    isLoading={isLoading}
                    timedOut={showTimeoutMessage}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'sbar' && <SBARFullView handoffData={handoffData} />}
        {activeTab === 'tasks' && <TasksOrdersView handoffData={handoffData} />}
        {activeTab === 'timeline' && <TimelineFullView handoffData={handoffData} />}
        {activeTab === 'directory' && <PatientDirectoryView />}
        
      </main>

      {(showSyncBadge || showTimeoutMessage) && (
        <div className="absolute bottom-6 right-6 z-40 flex flex-col items-end gap-2">
          {showSyncBadge && (
            <div className="rounded-full border border-slate-700 bg-slate-950/95 px-3 py-2 text-[11px] uppercase tracking-[0.2em] font-semibold text-slate-300 shadow-xl shadow-slate-950/40 backdrop-blur-md">
              Synchronizing Stream...
            </div>
          )}
          {showTimeoutMessage && (
            <div className="rounded-2xl border border-crimson-500 bg-crimson-950/95 px-4 py-3 text-sm font-semibold text-crimson-100 shadow-2xl shadow-crimson-950/20 backdrop-blur-md">
              Connection Time-out: Please Check Clinical Source.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 relative">
      <div className="absolute inset-0 opacity-30 pointer-events-none flex">
        <div className="w-16 lg:w-64 bg-slate-900 border-r border-slate-800" />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="h-32 bg-slate-900 border-b border-slate-800 p-6 flex gap-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-800" />
            <div className="flex flex-col gap-3 flex-1">
               <div className="h-6 bg-slate-800 rounded w-48" />
               <div className="h-4 bg-slate-800 rounded w-64" />
            </div>
            <div className="flex gap-4">
               <div className="w-40 h-24 bg-slate-800 rounded-xl" />
               <div className="w-40 h-24 bg-slate-800 rounded-xl" />
               <div className="w-40 h-24 bg-slate-800 rounded-xl" />
            </div>
          </div>
          <div className="flex-1 p-6 flex gap-6">
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex-1 bg-slate-900 rounded-xl border border-slate-800" />
              <div className="h-40 bg-slate-900 rounded-xl border border-slate-800" />
            </div>
            <div className="w-96 bg-slate-900 rounded-xl border border-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
