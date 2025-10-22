// app/components/ParkingHistoryChart.tsx
"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type HistoryData = {
  time: string;
  distance: number;
};

export default function ParkingHistoryChart({ slotId, data }: { slotId: string; data: HistoryData[] }) {
  return (
    <Card className="bg-gradient-to-br my-4 from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-gray-200">📊 Parking Slot {slotId} History</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" domain={[0, 200]} label={{ value: "cm", angle: -90, position: "insideLeft", fill: "#9CA3AF" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "0.5rem", color: "#E5E7EB" }}
              labelStyle={{ color: "#A5B4FC" }}
            />
            <Line type="monotone" dataKey="distance" stroke="#6366F1" strokeWidth={2} dot={{ r: 3, fill: "#FACC15" }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
