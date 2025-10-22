import { NextRequest, NextResponse } from "next/server";

// In-memory historical data storage
interface ParkingDataPoint {
  timestamp: number;
  slotId: number;
  distance: number | null;
  isOccupied: boolean;
  date: string;
  time: string;
}

const historicalData: ParkingDataPoint[] = [];
const MAX_HISTORY_SIZE = 1000; // Keep last 1000 data points

// Store current sensor data into historical records
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { distances } = body;

    if (distances && Array.isArray(distances)) {
      const now = new Date();
      const timestamp = now.getTime();
      const date = now.toISOString().split('T')[0];
      const time = now.toTimeString().split(' ')[0];

      // Save each sensor reading
      distances.forEach((distance: number | null, index: number) => {
        const dataPoint: ParkingDataPoint = {
          timestamp,
          slotId: index + 1,
          distance,
          isOccupied: distance !== null && distance < 10,
          date,
          time
        };

        historicalData.push(dataPoint);
      });

      // Keep only the most recent data points
      if (historicalData.length > MAX_HISTORY_SIZE) {
        historicalData.splice(0, historicalData.length - MAX_HISTORY_SIZE);
      }

      console.log(`📊 Saved ${distances.length} data points. Total history: ${historicalData.length}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving parking data:", error);
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    );
  }
}

// Retrieve historical data for charts and analysis
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hours = parseInt(searchParams.get('hours') || '24');
    const slotId = searchParams.get('slotId');

    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    
    let filteredData = historicalData.filter(point => point.timestamp > cutoffTime);
    
    if (slotId) {
      filteredData = filteredData.filter(point => point.slotId === parseInt(slotId));
    }

    // Group data by 5-minute intervals for better chart performance
    const groupedData = groupDataByInterval(filteredData, 5 * 60 * 1000); // 5 minutes

    return NextResponse.json({
      data: groupedData,
      totalPoints: filteredData.length,
      timeRange: `${hours} hours`,
      lastUpdate: historicalData.length > 0 ? historicalData[historicalData.length - 1].timestamp : null
    });
  } catch (error) {
    console.error("Error retrieving parking data:", error);
    return NextResponse.json(
      { error: "Failed to retrieve data" },
      { status: 500 }
    );
  }
}

// Group data points by time intervals
function groupDataByInterval(data: ParkingDataPoint[], intervalMs: number) {
  const grouped: { [key: string]: ParkingDataPoint[] } = {};

  data.forEach(point => {
    const intervalKey = Math.floor(point.timestamp / intervalMs) * intervalMs;
    const key = `${intervalKey}`;
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(point);
  });

  // Convert to chart-friendly format
  return Object.keys(grouped).map(key => {
    const points = grouped[key];
    const timestamp = parseInt(key);
    const slots: { [slotId: number]: { distance: number | null; occupied: boolean } } = {};

    // Get the latest reading for each slot in this interval
    points.forEach(point => {
      if (!slots[point.slotId] || point.timestamp > slots[point.slotId].distance!) {
        slots[point.slotId] = {
          distance: point.distance,
          occupied: point.isOccupied
        };
      }
    });

    return {
      timestamp,
      time: new Date(timestamp).toLocaleTimeString(),
      date: new Date(timestamp).toLocaleDateString(),
      slot1: slots[1] || { distance: null, occupied: false },
      slot2: slots[2] || { distance: null, occupied: false },
      slot3: slots[3] || { distance: null, occupied: false },
      totalOccupied: Object.values(slots).filter(slot => slot.occupied).length
    };
  }).sort((a, b) => a.timestamp - b.timestamp);
}