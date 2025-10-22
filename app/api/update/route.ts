import { NextRequest, NextResponse } from "next/server";

// In-memory state
let deviceState = {
  distances: [] as (number | null)[], // ✅ multiple sensors
  led1: 0,
  led2: 0,
  timestamp: 0,
};

// Called by ESP32 or dashboard
export async function POST(req: NextRequest) {
  const body = await req.json();

  // ✅ Update multiple distances if ESP32 sends
  if (body.distances !== undefined && Array.isArray(body.distances)) {
    deviceState.distances = body.distances;
    deviceState.timestamp = Date.now();
    console.log("ESP32 -> Distances:", body.distances);
  }

  // ✅ Update LED states if dashboard sends
  if (body.led1 !== undefined) {
    deviceState.led1 = body.led1;
  }
  if (body.led2 !== undefined) {
    deviceState.led2 = body.led2;
  }

  // Always return the full updated state
  return NextResponse.json(deviceState);
}

// Called by frontend dashboard
export async function GET() {
  const now = Date.now();
  const isFresh =
    deviceState.timestamp && now - deviceState.timestamp < 15000; // 15s freshness

  return NextResponse.json({
    distances: isFresh ? deviceState.distances : deviceState.distances.map(() => null), // ❌ no stale data
    led1: deviceState.led1,
    led2: deviceState.led2,
    active: isFresh,
  });
}
