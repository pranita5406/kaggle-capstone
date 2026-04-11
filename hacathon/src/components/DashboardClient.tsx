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

  const [streamOffline, setStreamOffline] = useState(false);

  const { data: vitalsData, error: vitalsError, isLoading: vitalsLoading, refetch: refetchVitals } = useQuery({
    queryKey: ['vitals', patientId, phiRedacted],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/vitals/${patientId}`, { 
          headers: { 'x-redact-pii': phiRedacted.toString() } 
        });

        if (!res.ok) {
          throw new Error('Clinical Data Stream Offline');
        }

        const text = await res.text();
        const json = JSON.parse(text);
        return json;
      } catch (e: any) {
        throw new Error('Clinical Data Stream Offline');
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

  useEffect(() => {
    if (vitalsError) {
      setStreamOffline(true);
      const timer = window.setTimeout(() => setStreamOffline(false), 5000);
      return () => window.clearTimeout(timer);
    }
  }, [vitalsError]);

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
    <div className={"flex h-screen max-h-screen overflow-hidden bg-slate-950 text-slate-200 animate-in fade-in duration-700 zoom-in-95" + (demoAlertVisible ? " ring-2 ring-purple-500" : "")}>
      {/* Demo Mode Alert Overlay */}
      {demoAlertVisible && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-purple-600 border border-purple-400 text-white px-6 py-3 rounded-lg shadow-2xl font-bold flex items-center gap-2 z-[100] animate-in slide-in-from-top-4">
          <Zap className="w-5 h-5 animate-pulse" /> 
          CRITICAL ALERT: Discordant Trend Detected!
        </div>
      )}

      <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden justify-start items-stretch">
        {activeTab === 'home' && (
          <div className="flex h-full min-h-0 overflow-hidden">
            <div className="flex-1 min-w-0 h-full overflow-hidden">
              <div className="h-full overflow-y-auto p-4 md:p-6 custom-scrollbar min-h-0">
                <div className="mx-auto flex h-full min-h-[0] max-w-[1600px] flex-col gap-6">
                  <RiskProfileHeader
                    vitalsData={vitalsData}
                    handoffData={effectiveHandoffData}
                    timeout={showTimeoutMessage}
                    isLoading={vitalsLoading}
                    error={vitalsError}
                  />

                  <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_350px] items-start">
                    <div className="flex min-w-0 flex-col gap-6">
                      <div className="min-h-[400px]">
                        <SBARPanel handoffData={effectiveHandoffData} />
                      </div>
                      <div className="shrink-0">
                        <InteractiveTimeline />
                      </div>
                    </div>

                    <div className="w-full lg:sticky lg:top-6 lg:border-l lg:border-slate-800 lg:pl-6">
                      <IntelligenceFeed
                        vitalsData={effectiveVitalsData}
                        handoffData={effectiveHandoffData}
                        isLoading={isLoading}
                        timedOut={showTimeoutMessage}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sbar' && <SBARFullView handoffData={handoffData} />}
        {activeTab === 'tasks' && <TasksOrdersView handoffData={handoffData} />}
        {activeTab === 'timeline' && <TimelineFullView handoffData={handoffData} />}
        {activeTab === 'directory' && <PatientDirectoryView />}
        
      </main>

      {(showSyncBadge || showTimeoutMessage || streamOffline) && (
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
          {streamOffline && (
            <div className="rounded-2xl border border-red-500 bg-red-950/95 px-4 py-3 text-sm font-semibold text-red-100 shadow-2xl shadow-red-950/20 backdrop-blur-md">
              Clinical Data Stream Offline
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-slate-950 relative">
      <div className="absolute inset-0 opacity-30 pointer-events-none flex">
        <div className="w-[260px] min-w-[260px] bg-slate-900 border-r border-slate-800" />
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
          <div className="h-full overflow-hidden">
            <div className="h-full overflow-y-auto p-6 custom-scrollbar min-h-0">
              <div className="mx-auto flex h-full min-h-[0] max-w-[1600px] flex-col gap-6">
                <div className="h-28 bg-slate-900 rounded-3xl border border-slate-800" />
                <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_350px] items-start">
                  <div className="flex min-w-0 flex-col gap-6">
                    <div className="h-[420px] bg-slate-900 rounded-3xl border border-slate-800" />
                    <div className="h-80 bg-slate-900 rounded-3xl border border-slate-800" />
                  </div>
                  <div className="w-full lg:sticky lg:top-6 lg:border-l lg:border-slate-800 lg:pl-6">
                    <div className="h-[600px] bg-slate-900 rounded-3xl border border-slate-800" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
