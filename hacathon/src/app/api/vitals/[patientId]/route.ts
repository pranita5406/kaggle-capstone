import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Vital, IntelligenceFeed } from "@/models/Schemas";

// Mock Data Generator for Hackathon
function generateSimulatedVitals(patientId: string) {
  const readings = [];
  let currentHR = 80;
  let currentSBP = 120;
  let currentDBP = 80;
  
  // Generating 24 readings (every 30 mins) simulating worsening sepsis
  for (let i = 24; i >= 0; i--) {
    const time = new Date(Date.now() - i * 30 * 60000);
    
    // Simulate gradual deterioration in the last 8 hours (last 16 readings)
    if (i <= 16) {
      currentHR += Math.floor(Math.random() * 4); // HR drifts up
      currentSBP -= Math.floor(Math.random() * 3); // BP drifts down
      currentDBP -= Math.floor(Math.random() * 2);
    }

    readings.push({
      patientId,
      timestamp: time,
      heartRate: currentHR,
      nibpSystolic: currentSBP,
      nibpDiastolic: currentDBP,
      spo2: 95 + Math.floor(Math.random() * 3), // stable spo2
    });
  }
  return readings;
}

export async function GET(req: NextRequest, context: any) {
  const { patientId } = await context.params;
  const demoMode = req.nextUrl.searchParams.get('demo') === 'true';
  
  try {
    await connectToDatabase();
  } catch (e) {
    // If Mongo is not running locally, return simulated data seamlessly.
    console.warn("DB not connected, using simulator.");
  }
  
  // Simulate fetching the last 24 readings
  const vitals = generateSimulatedVitals(patientId);

  // Trend Analysis Engine Logic
  // Delta: current vs 8 hours ago (16 readings ago)
  const current = vitals[vitals.length - 1];
  const baseline = vitals[vitals.length - 17]; // 8 hours ago = 16 intervals of 30m

  const hrDeltaPct = ((current.heartRate - baseline.heartRate) / baseline.heartRate) * 100;
  const nibpTotalCurrent = current.nibpSystolic + current.nibpDiastolic;
  const nibpTotalBaseline = baseline.nibpSystolic + baseline.nibpDiastolic;
  const nibpDeltaPct = ((nibpTotalCurrent - nibpTotalBaseline) / nibpTotalBaseline) * 100;

  let flaggedInsights = [];

  // Demo mode: force dramatic discordant trend
  if (demoMode) {
    flaggedInsights.push({
      type: "trend",
      severity: "high",
      message: "⚠️ DEMO MODE: Discordant Trend Detected - HR rising while NIBP dropping. Patient pain stable.",
      clinical_insight: "DEMO: Potential Hypovolemic Shock or Uncompensated Sepsis - IMMEDIATE ATTENTION REQUIRED",
      timestamp: new Date(),
      isDemoAlert: true
    });
  } else if (hrDeltaPct > 20 && nibpDeltaPct < -10) {
    flaggedInsights.push({
      type: "trend",
      severity: "high",
      message: "Discordant Trend: HR rising while NIBP dropping. Patient pain stable.",
      clinical_insight: "Potential Hypovolemic Shock or Uncompensated Sepsis",
      timestamp: new Date()
    });
  }

  return NextResponse.json({
    vitals,
    analysis: {
      deltas: {
        hrDeltaPct: hrDeltaPct.toFixed(1),
        nibpDeltaPct: nibpDeltaPct.toFixed(1)
      },
      flaggedInsights
    }
  });
}
