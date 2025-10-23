import { NextRequest, NextResponse } from "next/server";
import { ParkingSpotService } from "@/lib/firebase-service";
import { Timestamp } from "firebase/firestore";

export async function GET() {
  try {
    const spots = await ParkingSpotService.getAllSpots();
    return NextResponse.json({ spots });
  } catch (error) {
    console.error("Error fetching parking spots:", error);
    return NextResponse.json(
      { error: "Failed to fetch parking spots" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      row, 
      col, 
      latitude,
      longitude,
      trigPin,
      echoPin,
      sensorId,
      minThreshold = 20, 
      maxThreshold = 200,
      isActive = true 
    } = body;

    if (!name || !row || !col) {
      return NextResponse.json(
        { error: "Missing required fields: name, row, col" },
        { status: 400 }
      );
    }

    const spotData = {
      name,
      position: { row: Number(row), col: Number(col) },
      gpsCoordinates: latitude && longitude ? {
        latitude: Number(latitude),
        longitude: Number(longitude)
      } : undefined,
      sensorConfig: trigPin && echoPin && sensorId !== undefined ? {
        trigPin: Number(trigPin),
        echoPin: Number(echoPin),
        sensorId: Number(sensorId)
      } : undefined,
      isOccupied: false,
      lastUpdate: Timestamp.now(),
      minThreshold: Number(minThreshold),
      maxThreshold: Number(maxThreshold),
      isActive: Boolean(isActive),
    };

    const spotId = await ParkingSpotService.createSpot(spotData);
    
    if (spotId) {
      return NextResponse.json({ success: true, id: spotId });
    } else {
      return NextResponse.json(
        { error: "Failed to create parking spot" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating parking spot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}