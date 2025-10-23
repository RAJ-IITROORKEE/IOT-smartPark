"use client";

import ParkingCard from "./ParkingCard";
import { ParkingSpot } from "@/lib/types";

type Slot = {
  id: string;
  name: string;
  installed: boolean;
  active: boolean;
  occupied: boolean;
  gps?: string;
  distance?: number | null;
  spotData?: ParkingSpot;
};

export default function ParkingGrid({
  distances,
  active,
  spots = [],
}: Readonly<{
  distances: (number | null)[];
  active: boolean;
  spots?: ParkingSpot[];
}>) {
  // Convert Firebase spots to legacy slot format for backward compatibility
  const slots: Slot[] = spots.length > 0 
    ? spots.map((spot, index) => {
        const sensorIndex = spot.sensorConfig?.sensorId ?? index;
        const currentDistance = distances[sensorIndex];
        const isOccupiedBySensor = currentDistance !== null && 
          currentDistance >= (spot.minThreshold || 20) && 
          currentDistance <= (spot.maxThreshold || 200);
        
        return {
          id: spot.id,
          name: spot.name,
          installed: true,
          active: spot.isActive && active, // Combined with ESP32 connection status
          occupied: spot.isOccupied || isOccupiedBySensor,
          gps: spot.gpsCoordinates 
            ? `${spot.gpsCoordinates.latitude},${spot.gpsCoordinates.longitude}`
            : `26.91${20 + spot.position.row},75.78${70 + spot.position.col}`, // Generate GPS if not set
          distance: currentDistance ?? spot.distance ?? null,
          spotData: spot,
        };
      })
    : [
        // Fallback to legacy slots if no Firebase data
        {
          id: "legacy-A1",
          name: "A1",
          installed: true,
          active: active && distances[0] !== null,
          occupied: distances[0] !== null && distances[0] >= 20 && distances[0] <= 200,
          gps: "26.9124,75.7873",
          distance: distances[0] ?? null,
        },
        {
          id: "legacy-A2", 
          name: "A2",
          installed: true,
          active: active && distances[1] !== null,
          occupied: distances[1] !== null && distances[1] >= 20 && distances[1] <= 200,
          gps: "26.9126,75.7875",
          distance: distances[1] ?? null,
        },
        {
          id: "legacy-A3",
          name: "A3", 
          installed: true,
          active: active && distances[2] !== null,
          occupied: distances[2] !== null && distances[2] >= 20 && distances[2] <= 200,
          gps: "26.9128,75.7877",
          distance: distances[2] ?? null,
        },
        {
          id: "legacy-B1",
          name: "B1",
          installed: false,
          active: false,
          occupied: distances[3] !== null && distances[3] >= 20 && distances[3] <= 200,
          gps: "26.9130,75.7879",
          distance: distances[3] ?? null,
        },
        {
          id: "legacy-B2",
          name: "B2",
          installed: false,
          active: false,
          occupied: distances[4] !== null && distances[4] >= 20 && distances[4] <= 200,
          gps: "26.9132,75.7881", 
          distance: distances[4] ?? null,
        },
        {
          id: "legacy-B3",
          name: "B3",
          installed: false,
          active: false,
          occupied: distances[5] !== null && distances[5] >= 20 && distances[5] <= 200,
          gps: "26.9134,75.7883",
          distance: distances[5] ?? null,
        },
      ];

  // Organize spots into a grid layout
  const maxRow = Math.max(...slots.map(s => s.spotData?.position?.row || 1));
  const maxCol = Math.max(...slots.map(s => s.spotData?.position?.col || 1));
  
  const gridLayout = spots.length > 0 && maxRow > 1;

  return (
    <div className={gridLayout 
      ? `grid gap-4 grid-cols-${Math.min(maxCol, 6)}`
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    }>
      {slots.map((slot) => (
        <ParkingCard
          key={slot.id}
          slotId={slot.name}
          installed={slot.installed}
          active={slot.active}
          occupied={slot.occupied}
          gps={slot.gps}
          distanceCm={slot.distance ?? null}
          spotData={slot.spotData}
        />
      ))}
    </div>
  );
}
