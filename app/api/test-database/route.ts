// app/api/test-database/route.ts
import { NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebaseAdmin";
import { clientDb } from "@/lib/firebaseClient";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

export async function GET() {
  try {
    const testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        adminFirestoreConnected: false,
        clientFirestoreConnected: false,
        canWrite: false,
        canRead: false,
        canDelete: false
      }
    };

    // Test 1: Admin Firestore Connection
    try {
      const adminTestCollection = adminFirestore.collection("connection_test");
      const adminTestDoc = await adminTestCollection.add({
        test: "admin_connection",
        timestamp: new Date(),
        message: "Admin Firestore connection test"
      });
      
      testResults.tests.push({
        name: "Admin Firestore Connection",
        status: "✅ SUCCESS",
        details: `Document created with ID: ${adminTestDoc.id}`
      });
      testResults.summary.adminFirestoreConnected = true;

      // Clean up admin test doc
      await adminTestDoc.delete();
      
    } catch (error: any) {
      testResults.tests.push({
        name: "Admin Firestore Connection",
        status: "❌ FAILED",
        error: error.message
      });
    }

    // Test 2: Client Firestore Connection & Write
    try {
      const clientTestCollection = collection(clientDb, "connection_test");
      const clientTestDoc = await addDoc(clientTestCollection, {
        test: "client_connection",
        timestamp: new Date(),
        message: "Client Firestore connection test"
      });

      testResults.tests.push({
        name: "Client Firestore Write",
        status: "✅ SUCCESS", 
        details: `Document created with ID: ${clientTestDoc.id}`
      });
      testResults.summary.clientFirestoreConnected = true;
      testResults.summary.canWrite = true;

      // Test 3: Client Firestore Read
      try {
        const snapshot = await getDocs(clientTestCollection);
        const docCount = snapshot.size;
        
        testResults.tests.push({
          name: "Client Firestore Read",
          status: "✅ SUCCESS",
          details: `Read ${docCount} documents from collection`
        });
        testResults.summary.canRead = true;

        // Test 4: Client Firestore Delete
        try {
          await deleteDoc(doc(clientDb, "connection_test", clientTestDoc.id));
          
          testResults.tests.push({
            name: "Client Firestore Delete",
            status: "✅ SUCCESS",
            details: "Test document deleted successfully"
          });
          testResults.summary.canDelete = true;

        } catch (error: any) {
          testResults.tests.push({
            name: "Client Firestore Delete",
            status: "❌ FAILED",
            error: error.message
          });
        }

      } catch (error: any) {
        testResults.tests.push({
          name: "Client Firestore Read",
          status: "❌ FAILED",
          error: error.message
        });
      }

    } catch (error: any) {
      testResults.tests.push({
        name: "Client Firestore Write",
        status: "❌ FAILED",
        error: error.message
      });
    }

    // Test 5: Parking Spots Collection Test
    try {
      const parkingSpotsCollection = collection(clientDb, "parking_spots");
      const parkingSnapshot = await getDocs(parkingSpotsCollection);
      
      testResults.tests.push({
        name: "Parking Spots Collection",
        status: "✅ SUCCESS",
        details: `Found ${parkingSnapshot.size} parking spots in database`
      });

    } catch (error: any) {
      testResults.tests.push({
        name: "Parking Spots Collection",
        status: "❌ FAILED",
        error: error.message
      });
    }

    // Overall Status
    const allTestsPassed = testResults.tests.every(test => test.status.includes("SUCCESS"));
    testResults.summary.overallStatus = allTestsPassed ? "✅ ALL TESTS PASSED" : "⚠️ SOME TESTS FAILED";

    return NextResponse.json(testResults, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: "Database test failed", 
        details: error.message,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Initialize default parking spots if database is empty
    const parkingSpotsCollection = collection(clientDb, "parking_spots");
    const snapshot = await getDocs(parkingSpotsCollection);
    
    if (snapshot.empty) {
      const defaultSpots = [
        {
          name: "Parking Slot 1",
          isActive: true,
          isOccupied: false,
          distance: undefined,
          lastUpdate: new Date(),
          ledPin: 2,
          sensorPin: 4,
          gpsCoordinates: { latitude: 0, longitude: 0 },
          sensorConfig: {
            trigPin: 4,
            echoPin: 5,
            sensorId: 0
          }
        },
        {
          name: "Parking Slot 2", 
          isActive: true,
          isOccupied: false,
          distance: undefined,
          lastUpdate: new Date(),
          ledPin: 3,
          sensorPin: 6,
          gpsCoordinates: { latitude: 0, longitude: 0 },
          sensorConfig: {
            trigPin: 6,
            echoPin: 7,
            sensorId: 1
          }
        },
        {
          name: "Parking Slot 3",
          isActive: true,
          isOccupied: false,
          distance: undefined,
          lastUpdate: new Date(),
          ledPin: 4,
          sensorPin: 8,
          gpsCoordinates: { latitude: 0, longitude: 0 },
          sensorConfig: {
            trigPin: 8,
            echoPin: 9,
            sensorId: 2
          }
        }
      ];

      const createdSpots = [];
      for (const spot of defaultSpots) {
        const docRef = await addDoc(parkingSpotsCollection, spot);
        createdSpots.push({ id: docRef.id, ...spot });
      }

      return NextResponse.json({
        message: "✅ Default parking spots created successfully",
        spotsCreated: createdSpots.length,
        spots: createdSpots
      });
    } else {
      return NextResponse.json({
        message: "✅ Database already has parking spots",
        existingSpots: snapshot.size
      });
    }

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: "Failed to initialize database", 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}