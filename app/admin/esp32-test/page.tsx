"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Activity, AlertCircle, CheckCircle } from "lucide-react";

export default function ESP32TestPage() {
  const [connectionStatus, setConnectionStatus] = useState("unknown");
  const [lastData, setLastData] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`${timestamp}: ${message}`, ...prev].slice(0, 20));
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    addLog("Testing ESP32 connection...");

    try {
      const response = await fetch("/api/test-esp32");
      const data = await response.json();
      
      if (response.ok) {
        setConnectionStatus("connected");
        addLog("✓ Test connection successful");
      } else {
        setConnectionStatus("error");
        addLog("✗ Test connection failed");
      }
    } catch (error) {
      setConnectionStatus("disconnected");
      addLog("✗ Network error during connection test");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const checkAPIData = async () => {
    try {
      const response = await fetch("/api/update");
      const data = await response.json();
      
      setLastData(data);
      
      // Update connection status based on the 5-second rule
      if (data.active === 1) {
        setConnectionStatus("connected");
        addLog(`✓ ESP32 Connected (${data.secondsSinceUpdate}s ago)`);
      } else {
        setConnectionStatus("disconnected");
        addLog(`⚠ ESP32 Disconnected (${data.secondsSinceUpdate}s ago)`);
      }
      
      // Log sensor readings if active
      if (data.distances && data.distances.length > 0) {
        const activeSensors = data.distances.filter((d: number | null) => d !== null).length;
        addLog(`📊 Sensors: ${activeSensors}/${data.distances.length} active`);
      }
    } catch (error) {
      setConnectionStatus("error");
      addLog("✗ Error fetching API data");
    }
  };

  const simulateESP32Data = async () => {
    addLog("Simulating ESP32 data...");

    const simulatedData = {
      distances: [15, 25, 8, 12], // Sample distances in cm
    };

    try {
      const response = await fetch("/api/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(simulatedData),
      });

      if (response.ok) {
        addLog("✓ Simulated ESP32 data sent successfully");
        await checkAPIData();
      } else {
        addLog("✗ Failed to send simulated data");
      }
    } catch {
      addLog("✗ Error sending simulated data");
    }
  };

  const controlLED = async (led1: number, led2: number, description: string) => {
    addLog(`Controlling LEDs: ${description}`);

    try {
      // First, set the LED state in our API
      const response = await fetch("/api/test-leds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ led1, led2 }),
      });

      if (response.ok) {
        addLog(`✓ LED command sent: ${description}`);
        
        // Wait a moment for ESP32 to process
        setTimeout(async () => {
          // Check if ESP32 received the command by polling update API
          try {
            const statusResponse = await fetch("/api/update");
            const statusData = await statusResponse.json();
            
            if (statusData.leds) {
              const actualLED1 = statusData.leds[0] ? 1 : 0;
              const actualLED2 = statusData.leds[1] ? 1 : 0;
              
              if (actualLED1 === led1 && actualLED2 === led2) {
                addLog(`✓ ESP32 confirmed: ${description}`);
              } else {
                addLog(`⚠ LED state mismatch - Expected: LED1=${led1}, LED2=${led2}, Got: LED1=${actualLED1}, LED2=${actualLED2}`);
              }
            }
          } catch (error) {
            addLog("⚠ Could not verify LED status from ESP32");
          }
        }, 2000); // Wait 2 seconds for ESP32 to update
        
      } else {
        addLog("✗ Failed to send LED command");
      }
    } catch (error) {
      addLog("✗ Error sending LED command");
  useEffect(() => {
    // Auto-refresh data every 2 seconds for better real-time monitoring
    const interval = setInterval(() => {
      checkAPIData();
    }, 2000);

    // Initial check
    checkAPIData();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-indigo-400">ESP32 Connection Test</h1>
        <Badge
          variant="secondary"
          className={
            connectionStatus === "connected"
              ? "bg-green-600 text-green-100"
              : connectionStatus === "disconnected"
              ? "bg-red-600 text-red-100"
              : "bg-gray-600 text-gray-300"
          }
        >
          {connectionStatus === "connected" && <Wifi className="h-3 w-3 mr-1" />}
          {connectionStatus === "disconnected" && <WifiOff className="h-3 w-3 mr-1" />}
          {connectionStatus === "error" && <AlertCircle className="h-3 w-3 mr-1" />}
          {connectionStatus === "unknown" && <Activity className="h-3 w-3 mr-1" />}
          {connectionStatus.toUpperCase()}
        </Badge>
      </div>

      {/* ESP32 Connection Info */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-indigo-400">ESP32 Connection Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800">
            <h4 className="font-medium text-blue-300 mb-2">Current Server URLs:</h4>
            <div className="space-y-1 text-sm text-blue-100">
              <div>• Production: <code className="bg-slate-700 px-2 py-1 rounded">https://your-domain.com/api/update</code></div>
              <div>• Development: <code className="bg-slate-700 px-2 py-1 rounded">http://localhost:3000/api/update</code></div>
              <div>• Test Endpoint: <code className="bg-slate-700 px-2 py-1 rounded">http://localhost:3000/api/test-esp32</code></div>
            </div>
          </div>

          <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-800">
            <h4 className="font-medium text-yellow-300 mb-2">ESP32 Data Format:</h4>
            <pre className="text-sm text-yellow-100 bg-slate-800 p-3 rounded overflow-x-auto">
{`{
  "distances": [15, 25, 8, 12]  // Array of distances in cm
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-indigo-400">Test Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={testConnection}
              disabled={isTestingConnection}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Wifi className="h-4 w-4 mr-2" />
              {isTestingConnection ? "Testing..." : "Test Connection"}
            </Button>
            
            <Button
              onClick={checkAPIData}
              className="bg-green-600 hover:bg-green-700"
            >
              <Activity className="h-4 w-4 mr-2" />
              Check API Data
            </Button>
            
            <Button
              onClick={simulateESP32Data}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Simulate ESP32 Data
            </Button>
          </div>
          
          {/* LED Control Section */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="text-lg font-medium text-indigo-400 mb-3">LED Control</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => controlLED(1, 0, "LED1 ON, LED2 OFF")}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                LED1 ON
              </Button>
              <Button
                onClick={() => controlLED(0, 1, "LED1 OFF, LED2 ON")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                LED2 ON
              </Button>
              <Button
                onClick={() => controlLED(1, 1, "Both LEDs ON")}
                className="bg-red-600 hover:bg-red-700"
              >
                Both ON
              </Button>
              <Button
                onClick={() => controlLED(0, 0, "Both LEDs OFF")}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Both OFF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current API Data */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-indigo-400">Current API Data</CardTitle>
        </CardHeader>
        <CardContent>
          {lastData ? (
            <pre className="text-sm text-gray-300 bg-slate-800 p-4 rounded overflow-x-auto">
              {JSON.stringify(lastData, null, 2)}
            </pre>
          ) : (
            <div className="text-gray-400">No data received yet...</div>
          )}
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-indigo-400">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-400">No activity yet...</div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`text-sm p-2 rounded ${
                    log.includes("✓")
                      ? "text-green-300 bg-green-900/20"
                      : log.includes("✗")
                      ? "text-red-300 bg-red-900/20"
                      : log.includes("⚠")
                      ? "text-yellow-300 bg-yellow-900/20"
                      : "text-gray-300 bg-slate-800"
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}