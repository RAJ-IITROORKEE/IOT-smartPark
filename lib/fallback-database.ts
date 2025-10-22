// lib/fallback-database.ts
import { ParkingSpot } from "./types";

// In-memory fallback database when Firebase is not available
class FallbackDatabase {
  private parkingSpots: Map<string, ParkingSpot> = new Map();
  private sensorReadings: any[] = [];
  private isFirebaseConnected: boolean = false;

  constructor() {
    // Initialize with default parking spots
    this.initializeDefaultSpots();
  }

  private initializeDefaultSpots() {
    const defaultSpots: ParkingSpot[] = [
      {
        id: "slot1",
        name: "Parking Slot 1",
        isActive: true,
        isOccupied: false,
        distance: null,
        lastUpdated: new Date(),
        ledPin: 2,
        sensorPin: 4,
        gpsCoordinates: { lat: 0, lng: 0 },
        sensorConfig: {
          triggerPin: 4,
          echoPin: 5,
          threshold: 10,
          maxDistance: 400
        }
      },
      {
        id: "slot2", 
        name: "Parking Slot 2",
        isActive: true,
        isOccupied: false,
        distance: null,
        lastUpdated: new Date(),
        ledPin: 3,
        sensorPin: 6,
        gpsCoordinates: { lat: 0, lng: 0 },
        sensorConfig: {
          triggerPin: 6,
          echoPin: 7,
          threshold: 10,
          maxDistance: 400
        }
      },
      {
        id: "slot3",
        name: "Parking Slot 3", 
        isActive: true,
        isOccupied: false,
        distance: null,
        lastUpdated: new Date(),
        ledPin: 4,
        sensorPin: 8,
        gpsCoordinates: { lat: 0, lng: 0 },
        sensorConfig: {
          triggerPin: 8,
          echoPin: 9,
          threshold: 10,
          maxDistance: 400
        }
      }
    ];

    defaultSpots.forEach(spot => {
      this.parkingSpots.set(spot.id, spot);
    });
  }

  setFirebaseStatus(connected: boolean) {
    this.isFirebaseConnected = connected;
  }

  getFirebaseStatus(): boolean {
    return this.isFirebaseConnected;
  }

  async getAllParkingSpots(): Promise<ParkingSpot[]> {
    return Array.from(this.parkingSpots.values());
  }

  async getParkingSpot(id: string): Promise<ParkingSpot | null> {
    return this.parkingSpots.get(id) || null;
  }

  async createParkingSpot(spot: Omit<ParkingSpot, 'id'>): Promise<string> {
    const id = `slot${Date.now()}`;
    const newSpot: ParkingSpot = {
      ...spot,
      id,
      lastUpdated: new Date()
    };
    this.parkingSpots.set(id, newSpot);
    return id;
  }

  async updateParkingSpot(id: string, updates: Partial<ParkingSpot>): Promise<void> {
    const existing = this.parkingSpots.get(id);
    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        lastUpdated: new Date()
      };
      this.parkingSpots.set(id, updated);
    }
  }

  async deleteParkingSpot(id: string): Promise<void> {
    this.parkingSpots.delete(id);
  }

  async updateParkingSpotStatus(id: string, isOccupied: boolean, distance?: number): Promise<void> {
    const spot = this.parkingSpots.get(id);
    if (spot) {
      spot.isOccupied = isOccupied;
      if (distance !== undefined) {
        spot.distance = distance;
      }
      spot.lastUpdated = new Date();
      this.parkingSpots.set(id, spot);
    }
  }

  async saveSensorReading(reading: any): Promise<string> {
    const id = `reading${Date.now()}`;
    this.sensorReadings.push({
      id,
      ...reading,
      timestamp: new Date()
    });
    
    // Keep only last 1000 readings
    if (this.sensorReadings.length > 1000) {
      this.sensorReadings = this.sensorReadings.slice(-1000);
    }
    
    return id;
  }

  async getSensorReadings(spotId?: string, limit: number = 100): Promise<any[]> {
    let readings = this.sensorReadings;
    
    if (spotId) {
      readings = readings.filter(r => r.spotId === spotId);
    }
    
    return readings
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getSystemConfig(): Promise<any> {
    return {
      id: "default",
      maxSensors: 4,
      pollInterval: 3000,
      connectionTimeout: 5000,
      ledStates: [false, false, false, false],
      lastUpdated: new Date()
    };
  }
}

// Singleton instance
export const fallbackDb = new FallbackDatabase();
export default fallbackDb;