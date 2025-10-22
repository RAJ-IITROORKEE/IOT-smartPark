"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ParkingGrid from "@/components/ParkingGrid";
import ParkingOccupancyChart from "@/components/ParkingOccupancyChart";

type HistoryPoint = {
  time: string;
  distance: number;
};

export default function Page() {
  const [distances, setDistances] = useState<(number | null)[]>([]); // ✅ array of sensor readings
  const [active, setActive] = useState(false);
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  // ✅ Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("parking-history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        localStorage.removeItem("parking-history");
      }
    }
  }, []);

  // ✅ Save history to localStorage whenever it changes (debounced)
  useEffect(() => {
    if (history.length === 0) return;

    const id = setTimeout(() => {
      localStorage.setItem("parking-history", JSON.stringify(history));
    }, 500); // debounce saves

    return () => clearTimeout(id);
  }, [history]);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch("/api/update");
        if (!res.ok) return;

        const json = await res.json();
        const isActive = !!json.active;
        setActive(isActive);

        // ✅ update distances array
        if (Array.isArray(json.distances)) {
          setDistances(json.distances);
        }

        // ✅ still track history for the first sensor only (A1)
        if (isActive && Array.isArray(json.distances) && typeof json.distances[0] === "number") {
          const d = json.distances[0];

          const now = new Date();
          const timeStr = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          setHistory((prev) =>
            [...prev, { time: timeStr, distance: d }].slice(-50)
          );
        }
      } catch {
        // ignore fetch errors
      }
    };

    fetchState();
    const id = setInterval(fetchState, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100">
      <Header />
      <main className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-indigo-300">Parking Slots</h2>
          <p className="text-sm text-gray-400">
            Overview of parking slots and sensors
          </p>
        </div>

        {/* ✅ pass active + all distances */}
        <ParkingGrid distances={distances} active={active} />

        <div className="mt-10">
          {/* ✅ Chart still only for first slot (A1) */}
          <ParkingOccupancyChart slotId="A1" data={history} />
        </div>
      </main>
    </div>
  );
}
