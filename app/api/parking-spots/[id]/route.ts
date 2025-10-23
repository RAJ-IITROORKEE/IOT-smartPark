import { NextRequest, NextResponse } from "next/server";
import { ParkingSpotService } from "@/lib/firebase-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const spot = await ParkingSpotService.getSpotById(params.id);
    
    if (!spot) {
      return NextResponse.json(
        { error: "Parking spot not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ spot });
  } catch (error) {
    console.error("Error fetching parking spot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updates: Record<string, any> = {
      name: body.name,
      position: body.row && body.col ? { row: Number(body.row), col: Number(body.col) } : undefined,
      gpsCoordinates: body.latitude && body.longitude ? {
        latitude: Number(body.latitude),
        longitude: Number(body.longitude)
      } : undefined,
      sensorConfig: body.trigPin && body.echoPin && body.sensorId !== undefined ? {
        trigPin: Number(body.trigPin),
        echoPin: Number(body.echoPin),
        sensorId: Number(body.sensorId)
      } : undefined,
      minThreshold: body.threshold ? Number(body.threshold) : undefined,
      maxThreshold: body.maxThreshold ? Number(body.maxThreshold) : undefined,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
    };

    // Remove undefined fields
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    const success = await ParkingSpotService.updateSpot(params.id, updates);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to update parking spot" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating parking spot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await ParkingSpotService.deleteSpot(params.id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to delete parking spot" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting parking spot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}