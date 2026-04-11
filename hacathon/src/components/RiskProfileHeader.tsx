"use client";

import { Activity, ShieldAlert, ArrowUpRight, ArrowDownRight, ArrowUp, ArrowDown, EyeOff, Eye, User, PhoneCall, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/DashboardContext";

export function RiskProfileHeader({ vitalsData, handoffData, timeout }: any) {
  const { phiRedacted, setPhiRedacted } = useDashboard();

  const patientFallback = { patientId: "123", mrn: "882-114-001", firstName: "John", lastName: "Doe", dob: "1959-05-12", currentProtocol: "Sepsis" };
  const patient = handoffData?.patient || patientFallback;

  const shiftRange = Array.from({ length: 16 }).map((_, index) => index);
  const hrDemoData = shiftRange.map(index => ({
    time: `${index}:00`,
    value: 80 + Math.round(index * 2 + (index % 3 === 0 ? 1 : 0)),
  }));
  hrDemoData[hrDemoData.length - 1].value = 111;

  const bpDemoData = shiftRange.map(index => ({
    time: `${index}:00`,
    systolic: Math.max(103, 120 - Math.round(index * 1.2 + (index % 4 === 0 ? 1 : 0))),
    diastolic: Math.max(70, 86 - Math.round(index * 1.0 + (index % 5 === 0 ? 1 : 0))),
  }));
  bpDemoData[bpDemoData.length - 1].systolic = 103;
  bpDemoData[bpDemoData.length - 1].diastolic = 70;

  const spo2DemoData = shiftRange.map(index => ({
    time: `${index}:00`,
    value: 96 + (index % 5 === 0 ? -1 : 0),
  }));

  const fallbackVitals = Array.from({ length: 7 }).map((_, index) => ({
    timestamp: new Date(Date.now() - (6 - index) * 60000).toISOString(),
    heartRate: 82,
    nibpSystolic: 120,
    nibpDiastolic: 76,
    spo2: 96,
  }));

  const vitals = vitalsData?.vitals?.length ? vitalsData.vitals : fallbackVitals;
  const analysis = vitalsData?.analysis || { deltas: { hrDeltaPct: 32.5, nibpDeltaPct: -13.5 }, flaggedInsights: [] };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const hrData = vitalsData?.vitals?.length ? vitals.map((v: any) => ({ time: formatTime(v.timestamp), value: v.heartRate })) : hrDemoData;
  const bpData = vitalsData?.vitals?.length ? vitals.map((v: any) => ({ time: formatTime(v.timestamp), systolic: v.nibpSystolic, diastolic: v.nibpDiastolic })) : bpDemoData;
  const spo2Data = vitalsData?.vitals?.length ? vitals.map((v: any) => ({ time: formatTime(v.timestamp), value: v.spo2 })) : spo2DemoData;

  const currentHr = vitalsData?.vitals?.length ? hrData[hrData.length - 1]?.value : 111;
  const currentBp = vitalsData?.vitals?.length ? `${bpData[bpData.length - 1]?.systolic ?? "--"}/${bpData[bpData.length - 1]?.diastolic ?? "--"}` : '103/70';
  const currentSpo2 = vitalsData?.vitals?.length ? spo2Data[spo2Data.length - 1]?.value : 96;

  const hrDelta = Number(analysis?.deltas?.hrDeltaPct || 32.5);
  const bpDelta = Number(analysis?.deltas?.nibpDeltaPct || -13.5);

  const getDirection = (delta: number) => delta > 0 ? "up" : delta < 0 ? "down" : "neutral";

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-4 md:p-6 shadow-sm z-10 flex flex-col xl:flex-row gap-6 xl:items-start justify-between relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-slate-800/50 to-transparent pointer-events-none" />

      {/* Identity & Demographics */}
      <div className="flex items-start gap-4 flex-shrink-0 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xl font-semibold shadow-inner border border-indigo-400/20">
          {phiRedacted ? "XX" : `${patient.firstName[0]}${patient.lastName[0]}`}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {phiRedacted ? `Patient XYZ-${patient.patientId}` : `${patient.firstName} ${patient.lastName}`}
            </h1>
            <div className="px-2.5 py-0.5 rounded-full bg-indigo-900/40 text-indigo-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              बेड 4A
            </div>
            {/* Risk Indicator */}
            {analysis?.flaggedInsights?.length > 0 && (
              <div className="px-2.5 py-0.5 rounded-full bg-amber-900/40 text-amber-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-amber-700/50">
                <AlertTriangle className="w-3 h-3 animate-pulse" />
                Elevated Risk
              </div>
            )}
          </div>
          <div className="text-slate-400 font-medium text-sm mt-1 flex items-center gap-x-3 flex-wrap">
            <span>{phiRedacted ? "DOB Hidden" : `DOB: ${patient.dob}`}</span>
            <span className="text-slate-700">|</span>
            <span>MRN: {phiRedacted ? "***-***-***" : patient.mrn}</span>
            <span className="text-slate-700">|</span>
            <span>Protocol: {patient.currentProtocol}</span>
            <span className="text-slate-700">|</span>
            <span>Last Updated: {vitals[0] ? formatTime(vitals[0].timestamp) : "N/A"}</span>
          </div>
          
          <div className="mt-3 flex gap-2">
            <button 
              onClick={() => setPhiRedacted(!phiRedacted)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors px-2 py-1 rounded-md"
            >
              {phiRedacted ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {phiRedacted ? "Show PII" : "Redact PII"}
            </button>
            <button className="flex items-center gap-1.5 text-xs font-bold text-white bg-crimson-600 hover:bg-crimson-500 transition-colors px-3 py-1 rounded-md shadow-sm">
              <PhoneCall className="w-3.5 h-3.5" />
              EMERGENCY RESPONSE
            </button>
          </div>
        </div>
      </div>

      {/* Vitals & Deltas */}
      <div className="flex gap-4 md:gap-8 xl:ml-auto relative z-10 flex-wrap lg:flex-nowrap">
        {/* Heart Rate */}
        <VitalBox 
          label="Heart Rate" 
          value={currentHr} 
          unit="bpm"
          delta="↑ +32.5% SHIFT"
          deltaDirection="up"
          data={hrData}
          timeout={timeout}
          auditor="Auto"
          time="Just now"
        />
        {/* Blood Pressure */}
        <VitalBox 
          label="NIBP" 
          value={currentBp} 
          unit="mmHg"
          delta="↓ 13.5% SHIFT"
          deltaDirection="down"
          data={bpData}
          timeout={timeout}
          auditor="Auto"
          time="Just now"
        />
        {/* SpO2 */}
        <VitalBox 
          label="SpO2" 
          value={currentSpo2} 
          unit="%"
          delta="Stable"
          deltaDirection="neutral"
          secondaryTag="↓ 1% SHIFT"
          data={spo2Data}
          timeout={timeout}
          auditor="Auto"
          time="Just now"
        />
      </div>
    </div>
  );
}

function VitalBox({ label, value, unit, delta, deltaDirection, data, auditor, time, secondaryTag }: any) {
  const isUpward = deltaDirection === 'up';
  const isDownward = deltaDirection === 'down';
  const isNeutral = !isUpward && !isDownward;
  const isBloodPressure = label === 'NIBP';
  
  const strokeColor = isUpward ? "#f59e0b" : isDownward ? "#dc2626" : "#94a3b8";
  const fillColor = isUpward ? "rgba(245,158,11,0.15)" : isDownward ? "rgba(220,38,38,0.15)" : "rgba(148,163,184,0.15)";
  const badgeBg = isUpward ? "bg-amber-900/30 border-amber-500/20" : isDownward ? "bg-crimson-900/30 border-crimson-500/20" : "bg-slate-800 border-slate-700";
  const badgeText = isUpward ? "text-crimson-400" : isDownward ? "text-crimson-300" : "text-slate-300";

  return (
    <div 
      className={cn(
        "flex flex-col rounded-xl border flex-grow min-h-[150px] bg-slate-800 overflow-hidden shadow-sm",
        isUpward ? "border-amber-900/50" : isDownward ? "border-crimson-900/50" : "border-slate-700"
      )}
      style={{ minWidth: 0 }}
    >
      {/* Top half: Data & Metadata */}
      <div className="p-3 flex flex-col gap-2">
        <div className="flex justify-between items-start w-full gap-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
          
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
              <User className="w-2.5 h-2.5" />
              <span title={`Recorded by ${auditor} at ${time}`}>{auditor}</span>
            </div>
            
            {/* Numeric Trend Indicator (Trend Badge) */}
            <div className={cn(
              "px-1.5 py-0.5 rounded border flex items-center font-bold text-[11px] uppercase tracking-wide",
              badgeBg, badgeText
            )}>
              {isUpward ? <ArrowUp className="w-3 h-3 mr-0.5" strokeWidth={3} /> : isDownward ? <ArrowDown className="w-3 h-3 mr-0.5" strokeWidth={3} /> : null}
              <span>{delta}</span>
            </div>
          </div>
        </div>
        
        {/* Numerical Value - Clean, high contrast */}
        <div className="flex items-baseline gap-1 mt-1">
          <span className={cn(
            "text-4xl font-extrabold tracking-tight",
            isUpward ? "text-amber-400" : isDownward ? "text-crimson-400" : "text-white"
          )}>
            {value}
          </span>
          <span className="text-sm font-semibold text-slate-400">{unit}</span>
        </div>
        {secondaryTag && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 mt-1">{secondaryTag}</span>
        )}
      </div>

      {/* Bottom 1/3: Sparkline */}
      <div className="w-full mt-auto" style={{ height: '120px', minWidth: 0 }}>
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${label.replace(/\s+/g,'-')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4}/>
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0}/>
                </linearGradient>
                {isBloodPressure && (
                  <linearGradient id={`gradient-diastolic-${label.replace(/\s+/g,'-')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb7185" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="#fb7185" stopOpacity={0}/>
                  </linearGradient>
                )}
              </defs>
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip 
                content={<CustomTooltip labelText={label} data={data} />} 
                cursor={{ stroke: strokeColor, strokeWidth: 1, strokeDasharray: "3 3" }}
              />
              {isBloodPressure ? (
                <>
                  <Area 
                    type="stepAfter" 
                    dataKey="systolic" 
                    stroke="#dc2626" 
                    strokeWidth={2} 
                    fill="url(#gradient-NIBP)"
                    isAnimationActive={false}
                  />
                  <Area 
                    type="stepAfter" 
                    dataKey="diastolic" 
                    stroke="#fb7185" 
                    strokeWidth={2} 
                    fill="url(#gradient-diastolic-NIBP)"
                    isAnimationActive={false}
                  />
                </>
              ) : (
                <Area 
                  type="stepAfter" 
                  dataKey="value" 
                  stroke={strokeColor} 
                  strokeWidth={2} 
                  fill={`url(#gradient-${label.replace(/\s+/g,'-')})`} 
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-slate-900/50 border-t border-slate-800 flex items-center justify-center">
            <span className="text-[10px] text-slate-500 font-medium">Loading Baseline...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, labelText, data }: any) {
  if (active && payload && payload.length && data && data.length > 0) {
    const time = payload[0].payload.time;
    let startVal = data[0].value;
    let endVal = data[data.length - 1].value;
    let currentVal = payload[0].value;

    if (labelText === 'NIBP') {
      const systolicStart = data[0].systolic;
      const diastolicStart = data[0].diastolic;
      const systolicEnd = data[data.length - 1].systolic;
      const diastolicEnd = data[data.length - 1].diastolic;
      const systolicCurrent = payload.find((item: any) => item.dataKey === 'systolic')?.value;
      const diastolicCurrent = payload.find((item: any) => item.dataKey === 'diastolic')?.value;

      return (
        <div className="bg-slate-900 border border-slate-700 shadow-lg rounded-md p-2 flex flex-col gap-1 z-50 pointer-events-none">
          <span className="font-mono text-[10px] text-indigo-300 font-bold mb-1">Time: {time}</span>
          <div className="flex justify-between items-center text-[10px] gap-3 border-t border-slate-700 pt-1">
            <span className="text-slate-400">Shift Start:</span>
            <span className="text-slate-200 font-bold">{systolicStart}/{diastolicStart}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] gap-3">
            <span className="text-slate-400">Shift End:</span>
            <span className="text-slate-200 font-bold">{systolicEnd}/{diastolicEnd}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] gap-3 border-t border-slate-700 pt-1 mt-0.5">
            <span className="text-indigo-400">Current:</span>
            <span className="text-white font-bold">{systolicCurrent}/{diastolicCurrent}</span>
          </div>
        </div>
      );
    }

    startVal = data[0].value;
    endVal = data[data.length - 1].value;
    currentVal = payload[0].value;

    return (
      <div className="bg-slate-900 border border-slate-700 shadow-lg rounded-md p-2 flex flex-col gap-1 z-50 pointer-events-none">
        <span className="font-mono text-[10px] text-indigo-300 font-bold mb-1">Time: {time}</span>
        <div className="flex justify-between items-center text-[10px] gap-3 border-t border-slate-700 pt-1">
          <span className="text-slate-400">Shift Start {labelText}:</span>
          <span className="text-slate-200 font-bold">{startVal}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] gap-3">
          <span className="text-slate-400">Shift End {labelText}:</span>
          <span className="text-slate-200 font-bold">{endVal}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] gap-3 border-t border-slate-700 pt-1 mt-0.5">
          <span className="text-indigo-400">Current Pts:</span>
          <span className="text-white font-bold">{currentVal}</span>
        </div>
      </div>
    );
  }
  return null;
}
