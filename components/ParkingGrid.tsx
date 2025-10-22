"use client";

import ParkingCard from "./ParkingCard";

type Slot = {
  id: string;
  installed: boolean;
  active: boolean;
  gps?: string;
  distance?: number | null;
};

export default function ParkingGrid({
  distances,
  active,
}: {
  distances: (number | null)[];
  active: boolean;
}) {
  // Six slots; assign each distance by index
  const slots: Slot[] = [
    {
      id: "A1",
      installed: true,
      active: active && distances[0] !== null,
      gps: "26.9124,75.7873",
      distance: distances[0] ?? null,
    },
    {
      id: "A2",
      installed: true,
      active: active && distances[1] !== null,
      gps: "26.9126,75.7875",
      distance: distances[1] ?? null,
    },
    {
      id: "A3",
      installed: true,
      active: active && distances[2] !== null,
      gps: "26.9128,75.7877",
      distance: distances[2] ?? null,
    },
    {
      id: "B1",
      installed: false,
      active: false,
      gps: "26.9130,75.7879",
      distance: distances[3] ?? null,
    },
    {
      id: "B2",
      installed: false,
      active: false,
      gps: "26.9132,75.7881",
      distance: distances[4] ?? null,
    },
    {
      id: "B3",
      installed: false,
      active:false,
      gps: "26.9134,75.7883",
      distance: distances[5] ?? null,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {slots.map((s) => (
        <ParkingCard
          key={s.id}
          slotId={s.id}
          installed={s.installed}
          active={s.active}
          gps={s.gps}
          distanceCm={s.distance ?? null}
        />
      ))}
    </div>
  );
}
