import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { redactPII } from "@/lib/redactPII";

export async function GET(req: NextRequest, context: any) {
  const { patientId } = await context.params;
  const redactHeader = req.headers.get("x-redact-pii") === "true";

  // Mock checking DB connection
  try {
    await connectToDatabase();
  } catch (e) {
    console.warn("DB not connected, using simulator.");
  }

  // ==== 1. Simulated Raw Data ====
  const patient = {
    patientId,
    firstName: "John",
    lastName: "Doe",
    dob: "1959-05-12",
    mrn: "882-114-001",
    admissionReason: "Suspected Pneumonia",
    currentProtocol: "Sepsis"
  };

  const clinicalNotes = [
    {
      id: "note-123",
      timestamp: new Date(Date.now() - 4 * 3600000), // 4 hours ago
      authorRole: "MD",
      content: "Patient febrile. Suspect worsening infection. Pending lactic acid and blood cultures."
    }
  ];

  const activeOrders = [
    {
      id: "ord-88",
      type: "lab",
      name: "CBC STAT",
      priority: "stat",
      status: "pending",
      orderedAt: new Date(Date.now() - 2 * 3600000) // 2 hours ago
    }
    // Missing 'lactic acid' and 'cultures' order intentionally to trigger Gap Insight
  ];

  const intelligenceFeed = [];

  // ==== 2. Discontinuity Engine ====
  for (const note of clinicalNotes) {
    const text = note.content.toLowerCase();
    
    // Gap 1: Missing Lab Order
    if (text.includes("lactic") || text.includes("cultures")) {
      const hasOrder = activeOrders.some(
        o => o.name.toLowerCase().includes("lactic") || o.name.toLowerCase().includes("culture")
      );
      if (!hasOrder) {
        intelligenceFeed.push({
          type: "gap",
          severity: "high",
          message: `Missing Order: ${note.authorRole} note mentions pending lactic/cultures, but no active order found in system.`,
          clinical_insight: "Prevent delay in Sepsis Bundle",
          timestamp: new Date(),
          source_anchor: note.id
        });
      }
    }
  }

  // ==== 3. Task & Timeline Manager ====
  for (const order of activeOrders) {
    if (order.status === "pending" && order.priority === "stat") {
      const minutesOverdue = (Date.now() - order.orderedAt.getTime()) / 60000;
      if (minutesOverdue > 60) {
        intelligenceFeed.push({
          type: "task",
          severity: "medium",
          message: `Missed Follow-up: ${order.name} ordered STAT ${Math.floor(minutesOverdue/60)} hours ago but still pending.`,
          clinical_insight: "Stat Labs Overdue",
          timestamp: new Date(),
          source_anchor: order.id
        });
      }
    }
  }

  // ==== 4. AI SBAR Synthesizer ====
  const sbar = {
    situation: {
      text: "64yo male admitted 2 days ago for Sepsis Protocol secondary to suspected pneumonia.",
      alerts: ["respiratory distress", "tachycardia"],
      source_anchor: "note-123"
    },
    background: {
      text: "History of COPD and hypertension. Initial lactic acid was 3.1 mmol/L. Placed on empiric Vancomycin and Zosyn. Last WBC was 16.5k down from 19k.",
      alerts: [],
      source_anchor: "lab-wbc"
    },
    assessment: {
      text: "Patient's hemodynamic stability is worsening. Discordant trend strongly suggests inadequate fluid resuscitation or worsening sepsis rather than primary pulmonary etiology.",
      delta_hr: "+35 bpm",
      delta_nibp: "-28 mmHg",
      risk_level: "High",
      clinical_insight: "Potential Hypovolemic Shock"
    },
    recommendation: {
      actions: [
        "Administer additional 500cc NS bolus and reassess hemodynamics.",
        "Maintain continuous tele-monitoring.",
        "Consider transition to levophed if MAP remains <65 post-bolus."
      ]
    }
  };

  // Construct Final JSON payload
  const rawResponse = {
    patient,
    sbar,
    intelligenceFeed
  };

  // ==== 5. PII Redaction Layer ====
  const finalResponse = redactPII(rawResponse, redactHeader);

  return NextResponse.json(finalResponse);
}
