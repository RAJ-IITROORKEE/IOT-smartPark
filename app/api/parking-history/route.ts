import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";

interface ParkingDataPoint {
  timestamp: number;
  slotId: number;
  distance: number | null;
  isOccupied: boolean;
  date: string;
  time: string;
}

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

      // Create batch operations for all sensor readings
      const batch = adminFirestore.batch();
      const historyRef = adminFirestore.collection('parking-history');

      distances.forEach((distance: number | null, index: number) => {
        const dataPoint: ParkingDataPoint = {
          timestamp,
          slotId: index + 1,
          distance,
          isOccupied: distance !== null && distance >= 20 && distance <= 200,
          date,
          time
        };

        // Create a document for each data point
        const docRef = historyRef.doc();
        batch.set(docRef, dataPoint);
      });

      // Execute the batch write to Firebase
      await batch.commit();

      console.log(`📊 Saved ${distances.length} data points to Firebase Firestore`);

      // Clean up old data (keep last 7 days)
      const weekAgo = timestamp - (7 * 24 * 60 * 60 * 1000);
      const oldDataQuery = historyRef.where('timestamp', '<', weekAgo).limit(100);
      const oldDataSnapshot = await oldDataQuery.get();

      if (!oldDataSnapshot.empty) {
        const deleteBatch = adminFirestore.batch();
        oldDataSnapshot.docs.forEach(doc => {
          deleteBatch.delete(doc.ref);
        });
        await deleteBatch.commit();
        console.log(`🗑️ Cleaned up ${oldDataSnapshot.size} old data points`);
      }
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
    
    // Query Firebase for historical data
    const historyRef = adminFirestore.collection('parking-history');
    let query = historyRef
      .where('timestamp', '>', cutoffTime)
      .orderBy('timestamp', 'desc')
      .limit(1000); // Limit to prevent large responses

    if (slotId) {
      query = historyRef
        .where('timestamp', '>', cutoffTime)
        .where('slotId', '==', parseInt(slotId))
        .orderBy('timestamp', 'desc')
        .limit(1000);
    }

    const snapshot = await query.get();
    const filteredData: ParkingDataPoint[] = [];

    snapshot.forEach(doc => {
      const data = doc.data() as ParkingDataPoint;
      filteredData.push(data);
    });

    // Sort by timestamp ascending for proper chart display
    filteredData.sort((a, b) => a.timestamp - b.timestamp);

    // Group data by 5-minute intervals for better chart performance
    const groupedData = groupDataByInterval(filteredData, 5 * 60 * 1000); // 5 minutes

    // Get the latest timestamp
    const latestSnapshot = await historyRef
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();
    
    const lastUpdate = !latestSnapshot.empty 
      ? latestSnapshot.docs[0].data().timestamp 
      : null;

    return NextResponse.json({
      data: groupedData,
      totalPoints: filteredData.length,
      timeRange: `${hours} hours`,
      lastUpdate
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