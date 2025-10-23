"use client";

import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ParkingGrid from "@/components/ParkingGrid";
import ParkingOccupancyChart from "@/components/ParkingOccupancyChart";
import { ParkingSpot, HistoryPoint } from "@/lib/types";

export default function Page() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [distances, setDistances] = useState<(number | null)[]>([null, null, null]);
  const [lastValidDistances, setLastValidDistances] = useState<(number | null)[]>([null, null, null]);
  // Used for anti-blinking logic
  const [active, setActive] = useState(false);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const lastUpdateTime = useRef<number>(Date.now());

  // Load parking spots from API
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const response = await fetch("/api/parking-spots");
        if (response.ok) {
          const data = await response.json();
          setSpots(data.spots || []);
        }
      } catch (error) {
        console.error("Error fetching spots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
    
    // Refresh data every 10 seconds for spots
    const interval = setInterval(fetchSpots, 10000);
    return () => clearInterval(interval);
  }, []);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("parking-history");
    if (saved) {
      try {
        const savedHistory = JSON.parse(saved);
        setHistory(savedHistory);
      } catch {
        localStorage.removeItem("parking-history");
      }
    }
  }, []);

  // Get sensor data updates with anti-blinking logic
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const res = await fetch("/api/update");
        if (!res.ok) return;

        const json = await res.json();
        const isActive = !!json.active;
        const currentTime = Date.now();
        
        setActive(isActive);
        lastUpdateTime.current = currentTime;

        // Smart distance updating to prevent blinking
        if (Array.isArray(json.distances)) {
          setDistances(prevDistances => {
            const newDistances = [...prevDistances];
            
            json.distances.forEach((newDistance: number | null, index: number) => {
              if (newDistance !== null) {
                // Valid reading - always update
                newDistances[index] = newDistance;
                setLastValidDistances(prev => {
                  const updated = [...prev];
                  updated[index] = newDistance;
                  return updated;
                });
              } else {
                // Null reading - check if we should maintain previous value
                const timeSinceUpdate = currentTime - lastUpdateTime.current;
                if (timeSinceUpdate < 8000 && prevDistances[index] !== null) {
                  // Keep previous value for 8 seconds to prevent blinking
                  // newDistances[index] already has previous value
                } else {
                  // After 8 seconds, accept null value
                  newDistances[index] = null;
                }
              }
            });
            
            return newDistances;
          });
        }

        // Update history for first sensor (legacy compatibility)
        if (isActive && Array.isArray(json.distances) && typeof json.distances[0] === "number") {
          const d = json.distances[0];
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          setHistory((prev) => {
            const newHistory = [...prev, { 
              time: timeStr, 
              distance: d, 
              timestamp: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
              spotId: "A1" 
            }].slice(-50);
            localStorage.setItem("parking-history", JSON.stringify(newHistory));
            return newHistory;
          });
        }
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    fetchSensorData();
    const id = setInterval(fetchSensorData, 3000); // Fast polling for smooth experience
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading parking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100">
      <Header />
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-indigo-300">Parking Slots</h2>
            <p className="text-sm text-gray-400">
              Real-time overview of {spots.length || 3} configured parking spots
            </p>
          </div>
          <div className="flex justify-between sm:justify-end sm:text-right">
            <div className="text-sm text-gray-400 grid grid-cols-3 sm:block gap-4 sm:gap-0">
              <div className="text-center sm:text-right">
                <div className="text-xs text-gray-500 sm:hidden">Total</div>
                <div className="sm:hidden text-gray-300">{spots.length || 3}</div>
                <div className="hidden sm:block">Total: {spots.length || 3}</div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-xs text-gray-500 sm:hidden">Available</div>
                <div className="text-green-400">
                  <span className="hidden sm:inline">Available: </span>
                  {!active ? 0 : spots.length ? spots.filter(s => s.isActive && !s.isOccupied).length : 
                    distances.filter((d, i) => {
                      if (d === null) return false;
                      const spot = spots.find(s => s.sensorConfig?.sensorId === i);
                      const minThreshold = spot?.minThreshold || 20;
                      const maxThreshold = spot?.maxThreshold || 200;
                      return d < minThreshold || d > maxThreshold;
                    }).length}
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-xs text-gray-500 sm:hidden">Occupied</div>
                <div className="text-red-400">
                  <span className="hidden sm:inline">Occupied: </span>
                  {!active ? 0 : spots.length ? spots.filter(s => s.isActive && s.isOccupied).length : 
                    distances.filter((d, i) => {
                      if (d === null) return false;
                      const spot = spots.find(s => s.sensorConfig?.sensorId === i);
                      const minThreshold = spot?.minThreshold || 20;
                      const maxThreshold = spot?.maxThreshold || 200;
                      return d >= minThreshold && d <= maxThreshold;
                    }).length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Updated ParkingGrid with stable distances */}
        <ParkingGrid 
          distances={distances} 
          active={active} 
          spots={spots}
        />

        <div className="mt-8 sm:mt-10">
          {/* Chart for first active spot */}
          {(spots.length > 0 || distances.some(d => d !== null)) && (
            <div className="w-full overflow-hidden">
              <ParkingOccupancyChart 
                slotId={spots.find(s => s.isActive)?.name || "A1"} 
                data={history} 
              />
            </div>
          )}
          
          {spots.length === 0 && distances.every(d => d === null) && (
            <div className="text-center py-8 text-gray-400 px-4">
              <p className="text-base sm:text-lg">No parking spots configured or active.</p>
              <p className="text-sm mt-2">
                Visit the <a href="/admin" className="text-indigo-400 hover:underline">admin dashboard</a> to set up parking spots.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}