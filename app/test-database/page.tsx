"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Database, Wifi } from "lucide-react";

interface TestResult {
  name: string;
  status: string;
  details?: string;
  error?: string;
}

interface TestSummary {
  adminFirestoreConnected: boolean;
  clientFirestoreConnected: boolean;
  canWrite: boolean;
  canRead: boolean;
  canDelete: boolean;
  overallStatus?: string;
}

export default function DatabaseTestPage() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    timestamp: string;
    tests: TestResult[];
    summary: TestSummary;
  } | null>(null);

  const runDatabaseTest = async () => {
    setTesting(true);
    try {
      const response = await fetch("/api/test-database");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      setResults({
        timestamp: new Date().toISOString(),
        tests: [{
          name: "Database Connection",
          status: "❌ FAILED",
          error: "Network error - could not reach test endpoint"
        }],
        summary: {
          adminFirestoreConnected: false,
          clientFirestoreConnected: false,
          canWrite: false,
          canRead: false,
          canDelete: false,
          overallStatus: "❌ CONNECTION FAILED"
        }
      });
    } finally {
      setTesting(false);
    }
  };

  const initializeDatabase = async () => {
    setTesting(true);
    try {
      const response = await fetch("/api/test-database", { method: "POST" });
      const data = await response.json();
      
      // Show initialization result
      alert(data.message || "Database initialization completed");
      
      // Re-run tests after initialization
      await runDatabaseTest();
    } catch (error) {
      alert("Failed to initialize database");
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.includes("SUCCESS")) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status.includes("FAILED")) return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusBadge = (connected: boolean) => {
    return (
      <Badge variant={connected ? "default" : "destructive"} className="ml-2">
        {connected ? "✅ Connected" : "❌ Disconnected"}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-indigo-400 mb-2">
            <Database className="inline-block w-8 h-8 mr-3" />
            Firebase Database Test
          </h1>
          <p className="text-gray-300">Test and verify Firebase database connectivity</p>
        </div>

        {/* Test Controls */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-indigo-400 flex items-center">
              <Wifi className="w-5 h-5 mr-2" />
              Database Connection Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={runDatabaseTest}
                disabled={testing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {testing ? "Testing..." : "Run Connection Test"}
              </Button>
              
              <Button
                onClick={initializeDatabase}
                disabled={testing}
                className="bg-green-600 hover:bg-green-700"
              >
                {testing ? "Initializing..." : "Initialize Database"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {results && (
          <>
            {/* Summary */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-indigo-400">Test Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Admin Firestore:</span>
                      {getStatusBadge(results.summary.adminFirestoreConnected)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Client Firestore:</span>
                      {getStatusBadge(results.summary.clientFirestoreConnected)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Can Write:</span>
                      {getStatusBadge(results.summary.canWrite)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Can Read:</span>
                      {getStatusBadge(results.summary.canRead)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Can Delete:</span>
                      {getStatusBadge(results.summary.canDelete)}
                    </div>
                    <div className="flex items-center justify-between font-bold">
                      <span>Overall Status:</span>
                      <Badge 
                        variant={results.summary.overallStatus?.includes("PASSED") ? "default" : "destructive"}
                        className="ml-2"
                      >
                        {results.summary.overallStatus || "Unknown"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-indigo-400">Detailed Test Results</CardTitle>
                <p className="text-sm text-gray-400">
                  Last tested: {new Date(results.timestamp).toLocaleString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.tests.map((test, index) => (
                    <div key={index} className="border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-200">{test.name}</h3>
                        <div className="flex items-center">
                          {getStatusIcon(test.status)}
                          <span className="ml-2 text-sm">{test.status}</span>
                        </div>
                      </div>
                      
                      {test.details && (
                        <p className="text-sm text-green-300 bg-green-900/20 p-2 rounded">
                          {test.details}
                        </p>
                      )}
                      
                      {test.error && (
                        <p className="text-sm text-red-300 bg-red-900/20 p-2 rounded">
                          Error: {test.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Instructions */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-indigo-400">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-blue-900/20 border border-blue-700 rounded">
              <p className="text-blue-200">
                <strong>1. Run Connection Test:</strong> Verifies Firebase Admin and Client SDK connections
              </p>
            </div>
            <div className="p-3 bg-green-900/20 border border-green-700 rounded">
              <p className="text-green-200">
                <strong>2. Initialize Database:</strong> Creates default parking spots if database is empty
              </p>
            </div>
            <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded">
              <p className="text-yellow-200">
                <strong>Note:</strong> If tests fail, check your Firebase credentials in .env.local file
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}