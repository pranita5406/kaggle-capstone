import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientId, orderName, orderType, priority } = body;

    // Simulate order creation in CPOE
    const newOrder = {
      id: `ord-${Date.now()}`,
      patientId,
      name: orderName,
      type: orderType,
      priority: priority || 'routine',
      status: 'pending',
      createdAt: new Date().toISOString(),
      createdBy: 'Incoming Nurse',
    };

    // In a real app, this would persist to DB
    console.log('Order created:', newOrder);

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: `Lab Order: ${orderName} - Created and sent to CPOE`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 400 }
    );
  }
}
