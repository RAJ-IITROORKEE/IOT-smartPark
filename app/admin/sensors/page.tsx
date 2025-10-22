"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { ParkingSpot } from "@/lib/types";

import { Cpu, Wifi, WifiOff, Settings, Activity, AlertCircle } from "lucide-react";

interface SensorConfig {
  pin: number;
  spotId?: string;
  spotName?: string;
  lastReading?: number;
  isActive: boolean;
}

export default function SensorsManagement() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [sensors, setSensors] = useState<SensorConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPin, setNewPin] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/parking-spots");
      if (response.ok) {
        const data = await response.json();
        const spotsData = data.spots || [];
        setSpots(spotsData);

        // Build sensor configuration from parking spots
      const usedPins = new Set<number>();
      const sensorConfigs: SensorConfig[] = [];

      // Add configured sensors from spots
      for (const spot of spotsData) {
        if (spot.sensorPin) {
          usedPins.add(spot.sensorPin);
          sensorConfigs.push({
            pin: spot.sensorPin,
            spotId: spot.id,
            spotName: spot.name,
            lastReading: spot.distance,
            isActive: spot.isActive
          });
        }
      }

      // Add common ESP32 pins that might be available
      const commonPins = [2, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33];
      for (const pin of commonPins) {
        if (!usedPins.has(pin)) {
          sensorConfigs.push({
            pin,
            isActive: false
          });
        }
      }

        sensorConfigs.sort((a, b) => a.pin - b.pin);
        setSensors(sensorConfigs);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const assignSensorToSpot = async (pin: number, spotId: string) => {
    try {
      // First, unassign this pin from any other spot
      const spotsWithThisPin = spots.filter(s => s.sensorPin === pin);
      for (const spot of spotsWithThisPin) {
        await fetch(`/api/parking-spots/${spot.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sensorPin: undefined }),
        });
      }

      // Assign pin to the selected spot
      await fetch(`/api/parking-spots/${spotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sensorPin: pin }),
      });
      
      await fetchData();
    } catch (error) {
      console.error("Error assigning sensor:", error);
    }
  };

  const unassignSensor = async (pin: number) => {
    try {
      const spotsWithThisPin = spots.filter(s => s.sensorPin === pin);
      for (const spot of spotsWithThisPin) {
        await fetch(`/api/parking-spots/${spot.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sensorPin: undefined }),
        });
      }
      
      await fetchData();
    } catch (error) {
      console.error("Error unassigning sensor:", error);
    }
  };

  const addCustomPin = () => {
    const pin = parseInt(newPin);
    if (pin && pin > 0 && pin < 40 && !sensors.some(s => s.pin === pin)) {
      setSensors(prev => [...prev, { pin, isActive: false }].sort((a, b) => a.pin - b.pin));
      setNewPin("");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-indigo-400">Sensor Configuration</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
        </div>
      </div>
    );
  }

  const assignedSensors = sensors.filter(s => s.spotId);
  const unassignedSensors = sensors.filter(s => !s.spotId);
  const activeSensors = sensors.filter(s => s.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-indigo-400">Sensor Configuration</h1>
        <div className="flex space-x-2">
          <div className="text-right text-sm">
            <div className="text-gray-400">Active: {activeSensors.length}</div>
            <div className="text-gray-400">Assigned: {assignedSensors.length}</div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Sensors</CardTitle>
            <Cpu className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{sensors.length}</div>
            <p className="text-xs text-gray-400">Available GPIO pins</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Assigned</CardTitle>
            <Settings className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{assignedSensors.length}</div>
            <p className="text-xs text-gray-400">Connected to parking spots</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{activeSensors.length}</div>
            <p className="text-xs text-gray-400">Currently reporting data</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Custom Pin */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-indigo-400">Add Custom GPIO Pin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="number"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="GPIO Pin (e.g., 34, 35, 36)"
              className="bg-slate-800 border-slate-700 text-white max-w-xs"
            />
            <Button onClick={addCustomPin} className="bg-indigo-600 hover:bg-indigo-700">
              Add Pin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Sensors */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-indigo-400">Assigned Sensors ({assignedSensors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedSensors.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No sensors assigned to parking spots yet.
            </div>
          ) : (
            <div className="space-y-4">
              {assignedSensors.map((sensor) => (
                <div
                  key={`assigned-${sensor.pin}`}
                  className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${sensor.isActive ? "bg-green-900/20" : "bg-gray-700"}`}>
                      {sensor.isActive ? (
                        <Wifi className="h-5 w-5 text-green-400" />
                      ) : (
                        <WifiOff className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">GPIO Pin {sensor.pin}</h3>
                      <div className="text-sm text-gray-400">
                        Spot: {sensor.spotName}
                        {sensor.lastReading !== undefined && ` • Distance: ${sensor.lastReading}cm`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className={sensor.isActive ? "bg-green-600 text-green-100" : "bg-gray-600 text-gray-300"}
                    >
                      {sensor.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => unassignSensor(sensor.pin)}
                      className="text-gray-400 hover:text-white"
                    >
                      Unassign
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Sensors */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-indigo-400">Available Sensors ({unassignedSensors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {unassignedSensors.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              All sensors are assigned to parking spots.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unassignedSensors.map((sensor) => (
                <div
                  key={`unassigned-${sensor.pin}`}
                  className="p-4 bg-slate-800 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white">GPIO {sensor.pin}</h3>
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div className="space-y-2">
                    <select
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                      onChange={(e) => {
                        if (e.target.value) {
                          assignSensorToSpot(sensor.pin, e.target.value);
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">Assign to spot...</option>
                      {spots
                        .filter(spot => !spot.sensorPin) // Only show spots without sensors
                        .map(spot => (
                          <option key={spot.id} value={spot.id}>
                            {spot.name} (R{spot.position.row}C{spot.position.col})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}