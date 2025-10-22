// app/components/ParkingOccupancyChart.tsx
"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type DataPoint = {
  time: string; // e.g., "10:00"
  distance: number;
};

export default function ParkingOccupancyChart({
  slotId,
  data,
}: {
  slotId: string;
  data: DataPoint[];
}) {
  const occupancyData = data.map((d, i) => ({
    id: i,
    time: d.time,
    occupied: d.distance >= 30 && d.distance <= 200 ? 1 : 0,
    dotColor: d.distance >= 30 && d.distance <= 200 ? "#34D399" : "#9CA3AF",
  }));

  if (occupancyData.length === 0) {
    return (
      <Card className="bg-gradient-to-br mt-6 from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-200">
            📊 Parking Slot {slotId} Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center text-gray-400">
          No data available yet 🚫
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br mt-6 from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-200">
          📊 Parking Slot {slotId} Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={occupancyData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />

            {/* Hide ticks, just show axis label */}
            <XAxis
              dataKey="time"
              stroke="#9CA3AF"
              tick={false}
              axisLine={true}
              label={{
                value: "Time →",
                position: "insideBottom",
                offset: -30,
                fill: "#9CA3AF",
                fontSize: 12,
              }}
            />

            <YAxis
              type="number"
              dataKey="occupied"
              ticks={[0, 1]}
              domain={[0, 1]}
              tickFormatter={(v) => (v === 1 ? "Occupied" : "Available")}
              stroke="#9CA3AF"
            />

            <Tooltip
              cursor={{ strokeDasharray: "3 3", stroke: "#6B7280" }}
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
                color: "#E5E7EB",
              }}
              formatter={(_, __, props: any) =>
                props.payload.occupied === 1 ? "Occupied" : "Available"
              }
              labelFormatter={(label) => `Time: ${label}`}
            />

            <Line
              type="monotone"
              dataKey="occupied"
              stroke="#34D399"
              strokeWidth={3}
              dot={(props) => (
                <circle
                  key={props.payload.id}
                  cx={props.cx}
                  cy={props.cy}
                  r={6}
                  fill={props.payload.dotColor}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
              )}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
