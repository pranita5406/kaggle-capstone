"use client";

import { CheckCircle, Calendar, Users, TrendingDown, FileText, Zap } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-4 text-slate-400">
        {icon || <FileText className="w-12 h-12 mx-auto opacity-50" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function EmptyTasksState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-4">
        <CheckCircle className="w-12 h-12 mx-auto text-emerald-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-2">All Tasks Complete</h3>
      <p className="text-sm text-slate-500 max-w-md mb-4">
        Great work! No overdue tasks for this patient. Continue monitoring vital trends.
      </p>
      <div className="inline-block px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium border border-emerald-500/30">
        ✓ Handoff Ready
      </div>
    </div>
  );
}

export function EmptyTimelineState() {
  return (
    <EmptyState
      title="No Timeline Events"
      description="Timeline events will appear here as clinical actions are taken during this shift."
      icon={<Calendar className="w-12 h-12 mx-auto text-slate-600" />}
    />
  );
}

export function EmptyTrendsState() {
  return (
    <EmptyState
      title="Stable Vital Trends"
      description="No concerning trends detected. Vital signs remain within expected parameters."
      icon={<TrendingDown className="w-12 h-12 mx-auto text-emerald-600 rotate-180" />}
    />
  );
}

export function EmptyDirectoryState() {
  return (
    <EmptyState
      title="No Patients Available"
      description="Patient directory is currently empty. New admissions will appear here."
      icon={<Users className="w-12 h-12 mx-auto text-slate-600" />}
    />
  );
}

export function PatientLoadingState() {
  const { currentPatient } = useDashboard();
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="mb-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">Loading Clinical Data</h3>
      <p className="text-sm text-slate-500">
        Retrieving data for {currentPatient?.firstName} {currentPatient?.lastName}...
      </p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-red-950/20 border border-red-900/30 rounded-lg">
      <div className="mb-4">
        <Zap className="w-12 h-12 mx-auto text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-red-300 mb-2">Data Stream Error</h3>
      <p className="text-sm text-slate-400 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition"
        >
          Retry
        </button>
      )}
    </div>
  );
}
