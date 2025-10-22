// app/components/Header.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Wifi } from "lucide-react";

export default function Header() {
  const [led1, setLed1] = useState<number>(0);
  const [led2, setLed2] = useState<number>(0);
  const [online, setOnline] = useState<boolean>(false);

  // Fetch current state
  async function fetchState() {
    try {
      const res = await fetch("/api/update");
      if (!res.ok) return;
      const json = await res.json();
      setLed1(json.led1 ?? 0);
      setLed2(json.led2 ?? 0);
      setOnline(true);
    } catch (e) {
      setOnline(false);
    }
  }

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, 2000);
    return () => clearInterval(id);
  }, []);

  async function toggle(led: "led1" | "led2") {
    const next = led === "led1" ? (led1 ? 0 : 1) : (led2 ? 0 : 1);
    // optimistically update UI
    if (led === "led1") setLed1(next);
    else setLed2(next);

    // send only the led update to server so distance stays intact
    await fetch("/api/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [led]: next }),
    });
  }

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-gray-850 border-b border-gray-700">
      <div className="flex items-center gap-3">
        <Wifi className="w-6 h-6 text-indigo-400" />
        <h1 className="text-xl font-semibold text-gray-100">
          IoT Car Parking System
        </h1>
        <Badge className={`ml-3 ${online ? "bg-green-600 text-black" : "bg-gray-600 text-gray-200"}`}>
          {online ? "Server Online" : "Offline"}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300 mr-2">LED1</span>
          <Button
            size="sm"
            className={`flex items-center gap-2 px-3 py-1 rounded-xl transition-shadow ${
              led1 ? "border-r border-1 border-cyan-400 bg-slate-600 text-cyan-400 " :"bg-slate-700 text-gray-200 hover:shadow-[0_6px_20px_rgba(99,102,241,0.06)]"
            }`}
            onClick={() => toggle("led1")}
          >
            <Zap className={`${led1 ? "text-cyan-400" : "text-gray-400"} w-4 h-4`} />
            {led1 ? "ON" : "OFF"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300 mr-2">LED2</span>
          <Button
            size="sm"
            className={`flex items-center gap-2 px-3 py-1 rounded-xl transition-shadow ${
              led2 ? "border-r border-1 border-emerald-400 text-emerald-400 bg-emerald-100" : "bg-slate-700 text-gray-200 hover:shadow-[0_6px_20px_rgba(99,102,241,0.06)]"
            }`}
            onClick={() => toggle("led2")}
          >
            <Zap className={`${led2 ? "text-purple-400" : "text-gray-400"} w-4 h-4`} />
            {led2 ? "ON" : "OFF"}
          </Button>
        </div>
      </div>
    </header>
  );
}
