import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

// Default parking slot configurations based on ESP32 code
const defaultParkingSlots = [
  {
    id: "slot-001",
    name: "Slot A1",
    position: { row: 1, col: 1 },
    gpsCoordinates: {
      latitude: 26.9124,
      longitude: 75.7873
    },
    sensorConfig: {
      trigPin: 4,   // GPIO 4 for trigger
      echoPin: 2,   // GPIO 2 for echo
      sensorId: 0   // First sensor in array
    },
    isOccupied: false,
    lastUpdate: Timestamp.now(),
    distance: null,
    minThreshold: 20,   // 20cm minimum
    maxThreshold: 200,  // 200cm maximum
    isActive: true,
    esp32Config: {
      deviceId: "ESP32-SMARTPARK-01",
      wifiSSID: "Your_WiFi_Name",
      serverURL: "http://localhost:3000/api/update",
      ledConfig: {
        led1Pin: 5,   // GPIO 5 for LED1
        led2Pin: 18   // GPIO 18 for LED2
      }
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: "slot-002", 
    name: "Slot A2",
    position: { row: 1, col: 2 },
    gpsCoordinates: {
      latitude: 26.9125,
      longitude: 75.7874
    },
    sensorConfig: {
      trigPin: 19,  // GPIO 19 for trigger
      echoPin: 21,  // GPIO 21 for echo  
      sensorId: 1   // Second sensor in array
    },
    isOccupied: false,
    lastUpdate: Timestamp.now(),
    distance: null,
    minThreshold: 20,
    maxThreshold: 200,
    isActive: true,
    esp32Config: {
      deviceId: "ESP32-SMARTPARK-01",
      wifiSSID: "Your_WiFi_Name", 
      serverURL: "http://localhost:3000/api/update",
      ledConfig: {
        led1Pin: 5,
        led2Pin: 18
      }
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: "slot-003",
    name: "Slot A3", 
    position: { row: 1, col: 3 },
    gpsCoordinates: {
      latitude: 26.9126,
      longitude: 75.7875
    },
    sensorConfig: {
      trigPin: 12,  // GPIO 12 for trigger
      echoPin: 14,  // GPIO 14 for echo
      sensorId: 2   // Third sensor in array
    },
    isOccupied: false,
    lastUpdate: Timestamp.now(),
    distance: null,
    minThreshold: 20,
    maxThreshold: 200,
    isActive: true,
    esp32Config: {
      deviceId: "ESP32-SMARTPARK-01",
      wifiSSID: "Your_WiFi_Name",
      serverURL: "http://localhost:3000/api/update", 
      ledConfig: {
        led1Pin: 5,
        led2Pin: 18
      }
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

export async function POST(req: NextRequest) {
  try {
    const { force = false } = await req.json();

    const slotsCollection = adminFirestore.collection('parking_spots');
    
    // Check if slots already exist
    const existingSlots = await slotsCollection.get();
    
    if (!existingSlots.empty && !force) {
      return NextResponse.json({ 
        message: "Parking slots already exist. Use force=true to reinitialize.",
        existingCount: existingSlots.size
      }, { status: 400 });
    }

    // Clear existing slots if force=true
    if (force && !existingSlots.empty) {
      const batch = adminFirestore.batch();
      existingSlots.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log("🗑️ Cleared existing parking slots");
    }

    // Create batch to add all default slots
    const batch = adminFirestore.batch();
    
    defaultParkingSlots.forEach(slot => {
      const docRef = slotsCollection.doc(slot.id);
      batch.set(docRef, slot);
    });

    await batch.commit();

    console.log("🅿️ Successfully initialized default parking slots");

    return NextResponse.json({
      message: "Successfully initialized default parking slots",
      slots: defaultParkingSlots.map(slot => ({
        id: slot.id,
        name: slot.name,
        sensorId: slot.sensorConfig?.sensorId,
        pins: {
          trig: slot.sensorConfig?.trigPin,
          echo: slot.sensorConfig?.echoPin
        }
      }))
    });

  } catch (error) {
    console.error("Error initializing parking slots:", error);
    return NextResponse.json(
      { error: "Failed to initialize parking slots" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const slotsCollection = adminFirestore.collection('parking_spots');
    const snapshot = await slotsCollection.get();
    
    const slots: Array<{id: string; [key: string]: unknown}> = [];
    snapshot.forEach(doc => {
      slots.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({
      count: slots.length,
      slots: slots.map(slot => ({
        id: slot.id,
        name: slot.name,
        isActive: slot.isActive,
        sensorConfig: slot.sensorConfig
      }))
    });

  } catch (error) {
    console.error("Error fetching parking slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch parking slots" },
      { status: 500 }
    );
  }
}