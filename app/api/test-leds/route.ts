import { NextRequest, NextResponse } from "next/server";

// Simple LED control for testing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Send LED commands to the main update endpoint
    const response = await fetch(`${req.nextUrl.origin}/api/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        led1: body.led1,
        led2: body.led2,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: `LEDs updated: LED1=${data.led1}, LED2=${data.led2}`,
        data
      });
    } else {
      return NextResponse.json(
        { error: "Failed to update LEDs" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("LED control error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}