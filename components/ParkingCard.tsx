// app/components/ParkingCard.tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Car,
  MapPin,
  Info,
  Plug,
  CheckCircle,
  XCircle,
  Wifi,
  WifiOff,
  MinusCircle,
  ExternalLink,
} from "lucide-react";

import { ParkingSpot } from "@/lib/types";

type Props = {
  slotId: string;
  distanceCm: number | null; // null => no live sensor
  gps?: string;
  installed?: boolean;
  active?: boolean;
  occupied?: boolean;
  spotData?: ParkingSpot;
};

export default function ParkingCard({
  slotId,
  distanceCm,
  gps = "26.9124,75.7873",
  installed = false,
  active = false,
  occupied: propOccupied = false,
  spotData,
}: Readonly<Props>) {
  const [open, setOpen] = useState(false);
  const [showGPS, setShowGPS] = useState(false);

  // Extract GPS coordinates for Google Maps
  const openGoogleMaps = () => {
    let coordinates = gps;
    
    // If spotData has GPS coordinates, use those instead
    if (spotData?.gpsCoordinates) {
      coordinates = `${spotData.gpsCoordinates.latitude},${spotData.gpsCoordinates.longitude}`;
    }
    
    const googleMapsUrl = `https://www.google.com/maps?q=${coordinates}`;
    window.open(googleMapsUrl, '_blank');
  };

  // Get formatted GPS display
  const getGPSDisplay = () => {
    if (spotData?.gpsCoordinates) {
      return `${spotData.gpsCoordinates.latitude.toFixed(4)}, ${spotData.gpsCoordinates.longitude.toFixed(4)}`;
    }
    return gps;
  };

  // Use Firebase occupancy data if available, otherwise use legacy logic
  const occupied = spotData
    ? spotData.isOccupied
    : propOccupied || (installed && active && distanceCm !== null && distanceCm >= 20 && distanceCm <= 200);

  // Calculate status text
  const getStatusText = () => {
    if (installed === false) return "Not Installed";
    if (active === false) return "Disconnected"; 
    if (occupied) return "Occupied";
    return "Available";
  };
  
  const statusText = getStatusText();

  return (
    <>
      <Card className="group bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-400/30 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

        <CardHeader className="flex justify-between items-center pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
              <Car className="w-5 h-5 text-indigo-400" />
            </div>
            <CardTitle className="text-gray-100 font-semibold tracking-tight">
              Slot {slotId}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {active ? (
              <Badge
                variant="outline"
                className="bg-green-500/15 text-green-400 border-green-500/30 flex items-center gap-1"
              >
                <Wifi className="w-3 h-3" /> Live
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-gray-500/15 text-gray-400 border-gray-500/30 flex items-center gap-1"
              >
                <WifiOff className="w-3 h-3" /> Offline
              </Badge>
            )}
            <Badge
              className={`${
                !installed
                  ? "bg-gray-500/15 text-gray-400 border-gray-500/30"
                  : active
                  ? "bg-slate-500/15 text-amber-400 border-amber-500/30"
                  : "bg-gray-500/15 text-gray-400 border-gray-500/30"
              } border`}
            >
              {!installed ? "Not Installed" : active ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Distance
              </p>
              <p className="text-xl font-semibold text-indigo-300 mt-1">
                {!installed || !active || distanceCm === null
                  ? "--"
                  : `${distanceCm.toFixed(1)} cm`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Location
              </p>
              <div 
                className="text-sm text-gray-300 mt-1 flex items-center gap-2 justify-end cursor-pointer hover:text-blue-400 transition-colors group/gps"
                onClick={openGoogleMaps}
                onMouseEnter={() => setShowGPS(true)}
                onMouseLeave={() => setShowGPS(false)}
                title="Click to open in Google Maps"
              >
                <MapPin className="w-4 h-4 text-pink-400 group-hover/gps:text-blue-400 transition-colors" />
                <span className="max-w-[120px] truncate">{getGPSDisplay()}</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover/gps:opacity-100 transition-opacity" />
              </div>
              {showGPS && (
                <div className="absolute right-2 top-full mt-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-gray-200 z-10 shadow-lg">
                  Click to open in Google Maps
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full transition-colors ${
                  !installed
                    ? "bg-gray-500/15 group-hover:bg-gray-500/20"
                    : !active
                    ? "bg-gray-500/15 group-hover:bg-gray-500/20"
                    : occupied
                    ? "bg-red-500/15 group-hover:bg-red-500/20"
                    : "bg-green-500/15 group-hover:bg-green-500/20"
                }`}
              >
                {!installed ? (
                  <MinusCircle className="w-6 h-6 text-gray-400" />
                ) : !active ? (
                  <MinusCircle className="w-6 h-6 text-gray-400" />
                ) : occupied ? (
                  <XCircle className="w-6 h-6 text-red-400" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </p>
                <p
                  className={`font-medium ${
                    !installed
                      ? "text-gray-400"
                      : !active
                      ? "text-gray-400"
                      : occupied
                      ? "text-red-300"
                      : "text-green-300"
                  }`}
                >
                  {statusText}
                </p>
              </div>
            </div>

            <Button
              variant={installed ? "outline" : "default"}
              onClick={() => setOpen(true)}
              className="transition-all duration-300 hover:scale-105 bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white"
            >
              <Plug className="w-4 h-4 mr-2" />
              {installed ? "Configure" : "Connect"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg z-10 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-100">
                  Connect Sensor to Slot {slotId}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Follow the wiring instructions below
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg"
              >
                ✕
              </Button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <div className="bg-gray-700/30 p-4 rounded-lg">
                <p className="text-gray-200 mb-3">
                  Wire the HC-SR04 ultrasonic sensor to ESP32 pins:
                </p>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center py-2 border-b border-gray-700/50">
                    <span className="text-gray-300">
                      <strong className="text-indigo-300">VCC</strong> → 5V
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-red-500/10 text-red-300 border-red-500/20 text-xs"
                    >
                      Power
                    </Badge>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-gray-700/50">
                    <span className="text-gray-300">
                      <strong className="text-indigo-300">GND</strong> → GND
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-gray-500/10 text-gray-300 border-gray-500/20 text-xs"
                    >
                      Ground
                    </Badge>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-gray-700/50">
                    <span className="text-gray-300">
                      <strong className="text-indigo-300">TRIG</strong> → GPIO 4
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs"
                    >
                      Output
                    </Badge>
                  </li>
                  <li className="flex justify-between items-center py-2 border-b border-gray-700/50">
                    <span className="text-gray-300">
                      <strong className="text-indigo-300">ECHO</strong> → GPIO 2
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-300 border-green-500/20 text-xs"
                    >
                      Input
                    </Badge>
                  </li>
                  <li className="flex justify-between items-center py-2">
                    <span className="text-gray-300">
                      <strong className="text-indigo-300">LED1/2</strong> → GPIO
                      5/18
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-yellow-500/10 text-yellow-300 border-yellow-500/20 text-xs"
                    >
                      Indicator
                    </Badge>
                  </li>
                </ul>

                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-300 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      ECHO pin outputs 5V — always use a voltage divider or
                      level shifter before connecting to ESP32 GPIO.
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-700/30 p-4 rounded-lg">
                <p className="text-gray-100 font-medium mb-2">After wiring:</p>
                <ol className="list-decimal ml-5 mt-2 text-gray-300 space-y-2">
                  <li>Power the ESP32 and sensor</li>
                  <li>
                    Open dashboard and confirm this slot shows{" "}
                    <Badge className="bg-green-500/15 text-green-300 text-xs mx-1">
                      Connected
                    </Badge>
                  </li>
                  <li>
                    Distance will display live readings when the device posts to{" "}
                    <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                      /api/update
                    </code>
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setOpen(false)}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                Confirm Connection
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
