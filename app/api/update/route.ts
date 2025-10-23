import { NextRequest, NextResponse } from "next/server";

// In-memory state
const deviceState = {
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
    
    // Smart parking logic: distance between 20cm to 200cm = occupied
    const occupiedSlots = body.distances.map((distance: number | null) => {
      if (distance === null) return false;
      return distance >= 20 && distance <= 200; // 20-200cm threshold for occupied
    });
    
    // Update LEDs based on parking status
    const anyOccupied = occupiedSlots.some(Boolean);
    const multipleOccupied = occupiedSlots.filter(Boolean).length > 1;
    
    deviceState.led1 = anyOccupied ? 1 : 0;       // LED1: Any slot occupied
    deviceState.led2 = multipleOccupied ? 1 : 0;  // LED2: Multiple slots occupied
    
    console.log("Parking Status:", occupiedSlots.map((occupied: boolean, i: number) => 
      `Slot ${i+1}: ${occupied ? 'OCCUPIED' : 'FREE'}`
    ).join(', '));

    // Save to historical data (async, don't wait)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      fetch(`${baseUrl}/api/parking-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distances: body.distances })
      }).catch(error => console.error('History save error:', error));
    } catch (error) {
      console.error('History save error:', error);
    }
  }

  // ✅ Update LED states if dashboard sends
  if (body.led1 !== undefined) {
    deviceState.led1 = body.led1;
  }
  if (body.led2 !== undefined) {
    deviceState.led2 = body.led2;
  }

  // Always return the full updated state  
  const response = NextResponse.json(deviceState);
  // Add CORS headers for ESP32
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return response;
}

// Called by frontend dashboard
export async function GET() {
  const now = Date.now();
  const isFresh = deviceState.timestamp && now - deviceState.timestamp < 5000; // 5s freshness (was 15s)

  return NextResponse.json({
    distances: isFresh ? deviceState.distances : deviceState.distances.map(() => null), // No stale data
    led1: deviceState.led1,
    led2: deviceState.led2,
    active: isFresh ? 1 : 0, // Change to number for consistency
    timestamp: deviceState.timestamp,
    lastUpdate: isFresh ? "Connected" : "Disconnected",
    secondsSinceUpdate: deviceState.timestamp ? Math.floor((now - deviceState.timestamp) / 1000) : 0
  });
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
