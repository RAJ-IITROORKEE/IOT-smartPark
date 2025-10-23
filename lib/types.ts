// lib/types.ts
import { Timestamp } from "firebase/firestore";

export interface ParkingSpot {
  id: string;
  name: string;
  position: {
    row: number;
    col: number;
  };
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  sensorConfig?: {
    trigPin: number;
    echoPin: number;
    sensorId: number; // Which sensor index (0, 1, 2, etc.)
  };
  isOccupied: boolean;
  lastUpdate: Timestamp;
  distance?: number;
  minThreshold: number; // Minimum distance for occupancy (20cm)
  maxThreshold: number; // Maximum distance for occupancy (200cm)
  isActive: boolean;
  esp32Config?: {
    deviceId?: string;
    wifiSSID?: string;
    serverURL?: string;
    ledConfig?: {
      led1Pin: number;
      led2Pin: number;
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SensorReading {
  id: string;
  spotId: string;
  distance: number;
  timestamp: Timestamp;
  isOccupied: boolean;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: Timestamp;
  lastLogin?: Timestamp;
}

export interface SystemConfig {
  id: string;
  maxParkingSpots: number;
  defaultThreshold: number;
  updateInterval: number; // in milliseconds
  adminSessionTimeout: number; // in milliseconds
}

export interface HistoryPoint {
  time: string;
  distance: number;
  timestamp: Timestamp;
  spotId: string;
}