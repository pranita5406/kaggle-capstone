"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface Task {
  id: string;
  type: "nursing" | "lab" | "medication" | "order";
  text: string;
  status: "pending" | "completed" | "overdue";
  dueTime?: Date;
}

export interface Order {
  id: string;
  name: string;
  type: string;
  status: "pending" | "active" | "completed";
  priority: "routine" | "stat";
  createdAt: Date;
}

export interface PatientInfo {
  id: string;
  firstName: string;
  lastName: string;
  mrn: string;
  dob: string;
  admissionReason: string;
}

interface DashboardContextType {
  // Patient Navigation
  patientId: string;
  setPatientId: (id: string) => void;
  patients: PatientInfo[];
  currentPatient: PatientInfo | null;
  switchPatient: (patientId: string) => void;

  // Global State Sync
  phiRedacted: boolean;
  setPhiRedacted: (val: boolean) => void;
  
  // Cross-Page Action Tracking
  actionStates: Record<string, { status: string; timestamp: number; metadata?: Record<string, any> }>;
  markActionCompleted: (id: string, status?: string, metadata?: Record<string, any>) => void;
  getActionStatus: (id: string) => string | null;
  
  // Tasks & Orders Management
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  
  // Demo Mode & Presentation
  demoMode: boolean;
  enableDemoMode: () => void;
  discordantTrendActive: boolean;
  triggerDiscordantTrend: () => void;
  
  // Intelligence Feed Live Updates
  lastIntelligenceUpdate: number;
  notifyIntelligenceUpdate: () => void;

  // Alert Thresholds (Customizable)
  alertThresholds: {
    hrHigh: number;
    hrLow: number;
    bpSystolicHigh: number;
    bpSystolicLow: number;
    spo2Low: number;
  };
  updateAlertThreshold: (key: keyof DashboardContextType['alertThresholds'], value: number) => void;
  resetThresholds: () => void;

  // Notification Settings
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Mock patient directory
const MOCK_PATIENTS: PatientInfo[] = [
  { id: "123", firstName: "John", lastName: "Doe", mrn: "882-114-001", dob: "1959-05-12", admissionReason: "Suspected Pneumonia" },
  { id: "124", firstName: "Emily", lastName: "Clark", mrn: "882-114-002", dob: "1965-08-23", admissionReason: "Post-op Recovery" },
  { id: "125", firstName: "Michael", lastName: "Johnson", mrn: "882-114-003", dob: "1972-03-15", admissionReason: "Acute Coronary Syndrome" },
  { id: "126", firstName: "Sarah", lastName: "Williams", mrn: "882-114-004", dob: "1968-11-08", admissionReason: "Sepsis Bundle Protocol" },
];

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [patientId, setPatientId] = useState("123");
  const [phiRedacted, setPhiRedacted] = useState(false);
  const [actionStates, setActionStates] = useState<Record<string, { status: string; timestamp: number; metadata?: Record<string, any> }>>({});
  const [demoMode, setDemoMode] = useState(false);
  const [discordantTrendActive, setDiscordantTrendActive] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastIntelligenceUpdate, setLastIntelligenceUpdate] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Alert thresholds - load from localStorage or use defaults
  const [alertThresholds, setAlertThresholds] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sentinel-thresholds");
      if (saved) try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      hrHigh: 115,
      hrLow: 50,
      bpSystolicHigh: 160,
      bpSystolicLow: 90,
      spo2Low: 92,
    };
  });

  const currentPatient = MOCK_PATIENTS.find(p => p.id === patientId) || MOCK_PATIENTS[0];

  // Cross-page actions synchronization
  const markActionCompleted = useCallback((id: string, status = 'completed', metadata?: Record<string, any>) => {
    setActionStates(prev => ({
      ...prev,
      [id]: {
        status,
        timestamp: Date.now(),
        metadata
      }
    }));
    // Notify intelligence feed of update
    notifyIntelligenceUpdate();
  }, []);

  const getActionStatus = useCallback((id: string) => {
    return actionStates[id]?.status || null;
  }, [actionStates]);

  // Patient navigation with context reset
  const switchPatient = useCallback((newPatientId: string) => {
    setPatientId(newPatientId);
    // Reset action states for new patient
    setActionStates({});
    setTasks([]);
    setOrders([]);
  }, []);

  // Task management
  const addTask = useCallback((task: Task) => {
    setTasks(prev => [...prev, task]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    markActionCompleted(id, 'completed', { type: 'task', updatedAt: new Date() });
  }, [markActionCompleted]);

  // Order management
  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [...prev, order]);
    markActionCompleted(`order-${order.id}`, 'pending', { type: 'order', orderId: order.id });
  }, [markActionCompleted]);

  // Demo mode management
  const enableDemoMode = useCallback(() => {
    setDemoMode(true);
    setTimeout(() => setDemoMode(false), 8000);
  }, []);

  const triggerDiscordantTrend = useCallback(() => {
    setDiscordantTrendActive(true);
    notifyIntelligenceUpdate();
    setTimeout(() => setDiscordantTrendActive(false), 6000);
  }, []);

  const notifyIntelligenceUpdate = useCallback(() => {
    setLastIntelligenceUpdate(Date.now());
  }, []);

  // Alert threshold management
  const updateAlertThreshold = useCallback((key: keyof typeof alertThresholds, value: number) => {
    setAlertThresholds((prev: typeof alertThresholds) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem("sentinel-thresholds", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetThresholds = useCallback(() => {
    const defaults = {
      hrHigh: 115,
      hrLow: 50,
      bpSystolicHigh: 160,
      bpSystolicLow: 90,
      spo2Low: 92,
    };
    setAlertThresholds(defaults);
    localStorage.setItem("sentinel-thresholds", JSON.stringify(defaults));
  }, []);

  return (
    <DashboardContext.Provider value={{
      patientId,
      setPatientId,
      patients: MOCK_PATIENTS,
      currentPatient,
      switchPatient,
      phiRedacted,
      setPhiRedacted,
      actionStates,
      markActionCompleted,
      getActionStatus,
      tasks,
      addTask,
      updateTask,
      orders,
      addOrder,
      demoMode,
      enableDemoMode,
      discordantTrendActive,
      triggerDiscordantTrend,
      lastIntelligenceUpdate,
      notifyIntelligenceUpdate,
      alertThresholds,
      updateAlertThreshold,
      resetThresholds,
      notificationsEnabled,
      setNotificationsEnabled,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
