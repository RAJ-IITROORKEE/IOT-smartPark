// Alternative simple implementation
import { NextResponse } from "next/server";
import { collection, getDocs } from "firebase/firestore";
import { clientDb } from "@/lib/firebaseClient";

export async function GET() {
  try {
    console.log("🔍 Simple fetch test...");
    
    const spotsRef = collection(clientDb, "parking_spots");
    const snapshot = await getDocs(spotsRef);
    
    console.log(`📊 Documents found: ${snapshot.size}`);
    
    const spots: Array<{ id: string; [key: string]: unknown }> = [];
    for (const doc of snapshot.docs) {
      spots.push({
        id: doc.id,
        ...doc.data()
      });
    }

    return NextResponse.json({
      success: true,
      count: spots.length,
      spots
    });

  } catch (error) {
    console.error("❌ Simple fetch error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : String(error),
        success: false 
      },
      { status: 500 }
    );
  }
}