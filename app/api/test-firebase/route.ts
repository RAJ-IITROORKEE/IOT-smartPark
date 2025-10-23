import { NextResponse } from "next/server";
import { clientDb } from "@/lib/firebaseClient";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";

export async function GET() {
  try {
    // Test basic Firebase connection
    console.log("Testing Firebase connection...");
    
    // Try to read from parking_spots collection
    const spotsCollection = collection(clientDb, "parking_spots");
    const snapshot = await getDocs(spotsCollection);
    
    console.log(`Found ${snapshot.size} documents in parking_spots collection`);
    
    const spots = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'N/A',
        isActive: data.isActive || false,
        position: data.position,
        ...data
      };
    });

    return NextResponse.json({
      success: true,
      message: "Firebase connection successful",
      spotCount: snapshot.size,
      spots: spots.map(spot => ({
        id: spot.id,
        name: spot.name,
        isActive: spot.isActive
      }))
    });
    
  } catch (error) {
    console.error("Firebase test error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Firebase connection failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Test creating a document
    const spotsCollection = collection(clientDb, "parking_spots");
    
    const testData = {
      name: "Test Spot",
      position: { row: 99, col: 99 },
      isActive: true,
      isOccupied: false,
      minThreshold: 20,
      maxThreshold: 200,
      lastUpdate: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(spotsCollection, testData);
    
    return NextResponse.json({
      success: true,
      message: "Test document created successfully",
      docId: docRef.id
    });
    
  } catch (error) {
    console.error("Firebase create test error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create test document",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}