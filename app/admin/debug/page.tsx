"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugPage() {
  const [results, setResults] = useState<{ type: string; data?: unknown; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const testFirebase = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test-firebase");
      const data = await response.json();
      setResults({ type: "Firebase Test", data });
    } catch (error) {
      setResults({ type: "Firebase Test", error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testInitialize = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/init-parking-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true })
      });
      const data = await response.json();
      setResults({ type: "Initialize Test", data });
    } catch (error) {
      setResults({ type: "Initialize Test", error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testFetchSpots = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/parking-spots");
      const data = await response.json();
      setResults({ type: "Fetch Spots Test", data });
    } catch (error) {
      setResults({ type: "Fetch Spots Test", error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-indigo-400">Debug Tests</h1>
      
      <div className="flex gap-3">
        <Button onClick={testFirebase} disabled={loading}>
          Test Firebase Connection
        </Button>
        <Button onClick={testInitialize} disabled={loading}>
          Test Initialize
        </Button>
        <Button onClick={testFetchSpots} disabled={loading}>
          Test Fetch Spots
        </Button>
      </div>

      {results && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>{results.type} Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-slate-800 p-4 rounded overflow-auto">
              {JSON.stringify(results.data || results.error, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}