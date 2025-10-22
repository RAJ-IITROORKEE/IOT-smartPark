import { NextRequest, NextResponse } from "next/server";

// Simple test endpoint for ESP32 connection
export async function GET() {
  return NextResponse.json({
    message: "ESP32 connection test successful!",
    timestamp: new Date().toISOString(),
    server: "SmartPark API",
    status: "online"
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("ESP32 Test Data Received:", body);
    
    return NextResponse.json({
      message: "Data received successfully!",
      receivedData: body,
      timestamp: new Date().toISOString(),
      status: "success"
    });
  } catch (error) {
    console.error("ESP32 Test Error:", error);
    
    return NextResponse.json({
      message: "Error processing data",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      status: "error"
    }, { status: 400 });
  }
}