// lib/firebase-service.ts
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  where,
  Timestamp 
} from "firebase/firestore";
import { clientDb } from "./firebaseClient";
import { ParkingSpot, SensorReading, SystemConfig } from "./types";

// Collections
const PARKING_SPOTS_COLLECTION = "parking_spots";
const SENSOR_READINGS_COLLECTION = "sensor_readings";
const ADMIN_USERS_COLLECTION = "admin_users";
const SYSTEM_CONFIG_COLLECTION = "system_config";

// Parking Spots CRUD
export class ParkingSpotService {
  static async getAllSpots(): Promise<ParkingSpot[]> {
    try {
      const spotsQuery = query(
        collection(clientDb, PARKING_SPOTS_COLLECTION),
        orderBy("position.row"),
        orderBy("position.col")
      );
      const snapshot = await getDocs(spotsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ParkingSpot));
    } catch (error) {
      console.error("Error fetching parking spots:", error);
      return [];
    }
  }

  static async getSpotById(id: string): Promise<ParkingSpot | null> {
    try {
      const docRef = doc(clientDb, PARKING_SPOTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as ParkingSpot;
      }
      return null;
    } catch (error) {
      console.error("Error fetching parking spot:", error);
      return null;
    }
  }

  static async createSpot(spotData: Omit<ParkingSpot, "id" | "createdAt" | "updatedAt">): Promise<string | null> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(clientDb, PARKING_SPOTS_COLLECTION), {
        ...spotData,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating parking spot:", error);
      return null;
    }
  }

  static async updateSpot(id: string, updates: Partial<ParkingSpot>): Promise<boolean> {
    try {
      const docRef = doc(clientDb, PARKING_SPOTS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error("Error updating parking spot:", error);
      return false;
    }
  }

  static async deleteSpot(id: string): Promise<boolean> {
    try {
      const docRef = doc(clientDb, PARKING_SPOTS_COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error deleting parking spot:", error);
      return false;
    }
  }

  static async updateSpotOccupancy(id: string, distance: number, minThreshold: number = 20, maxThreshold: number = 200): Promise<boolean> {
    try {
      const isOccupied = distance >= minThreshold && distance <= maxThreshold;
      const docRef = doc(clientDb, PARKING_SPOTS_COLLECTION, id);
      await updateDoc(docRef, {
        distance,
        isOccupied,
        lastUpdate: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error("Error updating spot occupancy:", error);
      return false;
    }
  }
}

// Sensor Readings Service
export class SensorReadingService {
  static async recordReading(reading: Omit<SensorReading, "id">): Promise<string | null> {
    try {
      const docRef = await addDoc(collection(clientDb, SENSOR_READINGS_COLLECTION), reading);
      return docRef.id;
    } catch (error) {
      console.error("Error recording sensor reading:", error);
      return null;
    }
  }

  static async getRecentReadings(spotId: string, limitCount: number = 50): Promise<SensorReading[]> {
    try {
      const readingsQuery = query(
        collection(clientDb, SENSOR_READINGS_COLLECTION),
        where("spotId", "==", spotId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(readingsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SensorReading));
    } catch (error) {
      console.error("Error fetching sensor readings:", error);
      return [];
    }
  }
}

// Note: Admin User Service moved to API routes only (server-side)
// This avoids importing firebase-admin on client-side

// System Configuration Service
export class SystemConfigService {
  static async getConfig(): Promise<SystemConfig | null> {
    try {
      const configQuery = query(collection(clientDb, SYSTEM_CONFIG_COLLECTION));
      const snapshot = await getDocs(configQuery);
      
      if (!snapshot.empty) {
        const configDoc = snapshot.docs[0];
        return {
          id: configDoc.id,
          ...configDoc.data()
        } as SystemConfig;
      }
      
      // Create default config if none exists
      const defaultConfig = {
        maxParkingSpots: 10,
        defaultThreshold: 10,
        updateInterval: 5000,
        adminSessionTimeout: 3600000 // 1 hour
      };
      
      const docRef = await addDoc(collection(clientDb, SYSTEM_CONFIG_COLLECTION), defaultConfig);
      return {
        id: docRef.id,
        ...defaultConfig
      };
    } catch (error) {
      console.error("Error fetching system config:", error);
      return null;
    }
  }

  static async updateConfig(updates: Partial<SystemConfig>): Promise<boolean> {
    try {
      const config = await this.getConfig();
      if (!config) return false;
      
      const docRef = doc(clientDb, SYSTEM_CONFIG_COLLECTION, config.id);
      await updateDoc(docRef, updates);
      return true;
    } catch (error) {
      console.error("Error updating system config:", error);
      return false;
    }
  }
}