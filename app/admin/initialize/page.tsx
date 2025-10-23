"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  MapPin,
  Cpu,
  Zap
} from "lucide-react";

interface InitResponse {
  message: string;
  slots?: Array<{
    id: string;
    name: string;
    sensorId: number;
    pins: {
      trig: number;
      echo: number;
    };
  }>;
  existingCount?: number;
}

export default function InitializationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initializeParkingSlots = async (force = false) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/init-parking-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to initialize parking slots');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentSlots = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/init-parking-slots');
      const data = await response.json();

      if (response.ok) {
        setResult({
          message: `Found ${data.count} existing parking slots`,
          slots: data.slots
        });
      } else {
        setError('Failed to fetch parking slots');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-indigo-400">Database Initialization</h1>
        <p className="text-gray-400 mt-2">
          Initialize your parking slots database with default ESP32 configurations
        </p>
      </div>

      {/* Control Panel */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-indigo-400 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Parking Slots Database
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={() => initializeParkingSlots(false)}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Initialize Default Slots
            </Button>
            
            <Button
              onClick={() => initializeParkingSlots(true)}
              disabled={loading}
              variant="destructive"
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <AlertCircle className="h-4 w-4 mr-2" />}
              Force Reinitialize
            </Button>

            <Button
              onClick={checkCurrentSlots}
              disabled={loading}
              variant="outline"
              className="border-slate-600 text-gray-300 hover:bg-slate-800"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
              Check Current Slots
            </Button>
          </div>

          <div className="text-sm text-gray-400 space-y-1">
            <p>• <strong>Initialize Default Slots</strong>: Creates 3 parking slots with ESP32 pin configurations</p>
            <p>• <strong>Force Reinitialize</strong>: Deletes existing slots and creates fresh defaults</p>
            <p>• <strong>Check Current Slots</strong>: Shows existing parking slots in database</p>
          </div>
        </CardContent>
      </Card>

      {/* Default Configuration Preview */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-indigo-400">Default ESP32 Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Slot A1", sensorId: 0, trigPin: 4, echoPin: 2, gps: "26.9124, 75.7873" },
              { name: "Slot A2", sensorId: 1, trigPin: 19, echoPin: 21, gps: "26.9125, 75.7874" },
              { name: "Slot A3", sensorId: 2, trigPin: 12, echoPin: 14, gps: "26.9126, 75.7875" }
            ].map((slot) => (
              <div key={slot.name} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  <span className="font-medium text-white">{slot.name}</span>
                </div>
                <div className="space-y-1 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-3 w-3" />
                    <span>Sensor ID: {slot.sensorId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    <span>Trig: GPIO {slot.trigPin}, Echo: GPIO {slot.echoPin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>GPS: {slot.gps}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>LEDs:</strong> GPIO 5 (LED1) and GPIO 18 (LED2) for status indication
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {error && (
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="bg-green-900/20 border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-400 mb-4">
              <CheckCircle className="h-4 w-4" />
              <span>{result.message}</span>
            </div>

            {result.slots && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-300">Configured Slots:</h4>
                <div className="space-y-2">
                  {result.slots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-2 bg-slate-800 rounded">
                      <span className="text-white">{slot.name}</span>
                      <div className="flex gap-4 text-sm text-gray-400">
                        <span>Sensor: {slot.sensorId}</span>
                        <span>Trig: {slot.pins.trig}</span>
                        <span>Echo: {slot.pins.echo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}