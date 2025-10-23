"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ParkingSpot } from "@/lib/types";
import { Download, Wifi, WifiOff, Car, ParkingCircle, BarChart3, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface HistoricalDataPoint {
  timestamp: number;
  time: string;
  date: string;
  slot1: { distance: number | null; occupied: boolean };
  slot2: { distance: number | null; occupied: boolean };
  slot3: { distance: number | null; occupied: boolean };
  totalOccupied: number;
}

interface LiveData {
  timestamp: number;
  active: number;
  distances: (number | null)[];
  leds: boolean[];
}

export default function AdminDashboard() {
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  // spots is used to store parking spot data for calculations
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(24); // hours
  const [stats, setStats] = useState({
    total: 0,
    occupied: 0,
    available: 0,
    inactive: 0,
    connectionStatus: 'unknown'
  });

  const fetchLiveData = async () => {
    try {
      const response = await fetch("/api/update");
      if (response.ok) {
        const data = await response.json();
        setLiveData(data);
        
        // Update connection status
        setStats(prev => ({
          ...prev,
          connectionStatus: data.active === 1 ? 'connected' : 'disconnected'
        }));
      }
    } catch (error) {
      console.error("Error fetching live data:", error);
      setStats(prev => ({ ...prev, connectionStatus: 'error' }));
    }
  };

  const fetchHistoricalData = async (hours: number = timeRange) => {
    try {
      const response = await fetch(`/api/parking-history?hours=${hours}`);
      if (response.ok) {
        const data = await response.json();
        setHistoricalData(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  const fetchSpots = async () => {
    try {
      const response = await fetch("/api/parking-spots");
      if (response.ok) {
        const data = await response.json();
        const spotsData = data.spots || [];
        setSpots(spotsData);
        
        // Calculate stats from live data using configured spots thresholds
        if (liveData && liveData.distances && spotsData.length > 0) {
          let liveOccupied = 0;
          let liveAvailable = 0;
          let inactive = 0;
          
          liveData.distances.forEach((distance: number | null, index: number) => {
            const spot = spotsData.find((s: ParkingSpot) => s.sensorConfig?.sensorId === index);
            const minThreshold = spot?.minThreshold || 20;
            const maxThreshold = spot?.maxThreshold || 200;
            
            if (distance === null) {
              inactive++;
            } else if (distance >= minThreshold && distance <= maxThreshold) {
              liveOccupied++;
            } else {
              liveAvailable++;
            }
          });
          
          setStats(prev => ({
            ...prev,
            total: liveData.distances.length,
            occupied: liveOccupied,
            available: liveAvailable,
            inactive
          }));
        } else if (liveData && liveData.distances) {
          // Fallback to legacy threshold for backward compatibility
          const liveOccupied = liveData.distances.filter((d: number | null) => d !== null && d >= 20 && d <= 200).length;
          const liveAvailable = liveData.distances.filter((d: number | null) => d !== null && (d < 20 || d > 200)).length;
          const inactive = liveData.distances.filter((d: number | null) => d === null).length;
          
          setStats(prev => ({
            ...prev,
            total: liveData.distances.length,
            occupied: liveOccupied,
            available: liveAvailable,
            inactive
          }));
        } else {
          // Fallback to Firebase data
          const total = spotsData.length;
          const occupied = spotsData.filter((spot: ParkingSpot) => spot.isOccupied && spot.isActive).length;
          const available = spotsData.filter((spot: ParkingSpot) => !spot.isOccupied && spot.isActive).length;
          const inactive = spotsData.filter((spot: ParkingSpot) => !spot.isActive).length;
          
          setStats(prev => ({
            ...prev,
            total,
            occupied,
            available,
            inactive
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching spots:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = historicalData.map(point => ({
      'Date': point.date,
      'Time': point.time,
      'Slot 1 Distance (cm)': point.slot1.distance,
      'Slot 1 Status': point.slot1.occupied ? 'OCCUPIED' : 'FREE',
      'Slot 2 Distance (cm)': point.slot2.distance,
      'Slot 2 Status': point.slot2.occupied ? 'OCCUPIED' : 'FREE',
      'Slot 3 Distance (cm)': point.slot3.distance,
      'Slot 3 Status': point.slot3.occupied ? 'OCCUPIED' : 'FREE',
      'Total Occupied': point.totalOccupied,
      'Timestamp': point.timestamp
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Parking Data');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const fileName = `parking-data-${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(data, fileName);
  };

  useEffect(() => {
    const initializeData = () => {
      fetchSpots();
      fetchLiveData();
      fetchHistoricalData();
    };
    
    initializeData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchLiveData();
      fetchSpots();
    }, 5000);

    // Refresh historical data every minute
    const historyInterval = setInterval(() => {
      fetchHistoricalData();
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(historyInterval);
    };
  }, [timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  // Chart colors
  const COLORS = {
    occupied: '#ef4444',
    available: '#10b981',
    inactive: '#6b7280',
    slot1: '#3b82f6',
    slot2: '#8b5cf6',
    slot3: '#f59e0b'
  };

  // Pie chart data
  const pieData = [
    { name: 'Occupied', value: stats.occupied, color: COLORS.occupied },
    { name: 'Available', value: stats.available, color: COLORS.available },
    { name: 'Inactive', value: stats.inactive, color: COLORS.inactive },
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-indigo-400">Dashboard</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-indigo-400">SmartPark Dashboard</h1>
        <div className="flex items-center gap-4">
          <Badge
            variant="secondary"
            className={
              stats.connectionStatus === 'connected'
                ? "bg-green-600 text-green-100"
                : stats.connectionStatus === 'disconnected'
                ? "bg-red-600 text-red-100"
                : "bg-gray-600 text-gray-300"
            }
          >
            {stats.connectionStatus === 'connected' && <Wifi className="h-3 w-3 mr-1" />}
            {stats.connectionStatus === 'disconnected' && <WifiOff className="h-3 w-3 mr-1" />}
            {stats.connectionStatus === 'error' && <WifiOff className="h-3 w-3 mr-1" />}
            ESP32 {stats.connectionStatus.toUpperCase()}
          </Badge>
          <Button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700"
            disabled={historicalData.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Slots</CardTitle>
            <ParkingCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-gray-400">
              {stats.total > 0 ? 'Active monitoring' : 'No slots configured'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Occupied</CardTitle>
            <Car className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.occupied}</div>
            <p className="text-xs text-gray-400">
              {stats.total > 0 ? `${Math.round((stats.occupied / stats.total) * 100)}% occupancy` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Available</CardTitle>
            <ParkingCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.available}</div>
            <p className="text-xs text-gray-400">
              {stats.total > 0 ? `${Math.round((stats.available / stats.total) * 100)}% free` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Inactive</CardTitle>
            <WifiOff className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">{stats.inactive}</div>
            <p className="text-xs text-gray-400">
              {stats.inactive > 0 ? 'Sensors offline' : 'All sensors active'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Data Display */}
      {liveData && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-indigo-400 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Live Sensor Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {liveData.distances.map((distance: number | null, index: number) => {
                const spot = spots.find((s: ParkingSpot) => s.sensorConfig?.sensorId === index);
                const minThreshold = spot?.minThreshold || 20;
                const maxThreshold = spot?.maxThreshold || 200;
                const slotName = spot ? spot.name : `Slot ${index + 1}`;
                
                let status = 'OFFLINE';
                let statusColor = "bg-gray-600 text-gray-300";
                
                if (distance !== null) {
                  if (distance >= minThreshold && distance <= maxThreshold) {
                    status = 'OCCUPIED';
                    statusColor = "bg-red-600 text-red-100";
                  } else {
                    status = 'FREE';
                    statusColor = "bg-green-600 text-green-100";
                  }
                }
                
                return (
                  <div key={index} className="bg-slate-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{slotName}</span>
                      <Badge variant="secondary" className={statusColor}>
                        {status}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl font-bold text-white">
                        {distance === null ? '---' : `${distance.toFixed(1)}cm`}
                      </div>
                      {spot && distance !== null && (
                        <div className="text-xs text-gray-400 mt-1">
                          Threshold: {minThreshold}-{maxThreshold}cm
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-xs text-gray-400">
              Last Update: {new Date(liveData.timestamp).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Pie Chart */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-indigo-400 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Current Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#ffffff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Historical Trends */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-indigo-400 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Occupancy Trends
            </CardTitle>
            <div className="flex gap-2">
              {[2, 6, 12, 24].map((hours) => (
                <Button
                  key={hours}
                  variant={timeRange === hours ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setTimeRange(hours);
                    fetchHistoricalData(hours);
                  }}
                  className="text-xs"
                >
                  {hours}h
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                  domain={[0, 3]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#ffffff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalOccupied"
                  stroke={COLORS.occupied}
                  fill={COLORS.occupied}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distance Readings Chart */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-indigo-400">Distance Readings Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                fontSize={12}
                tick={{ fill: '#64748b' }}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tick={{ fill: '#64748b' }}
                label={{ value: 'Distance (cm)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748b' } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#ffffff'
                }}
                formatter={(value: unknown, name: string) => [
                  value === null ? 'N/A' : `${value}cm`,
                  name.replace('slot', 'Slot ')
                ]}
              />
              <Line
                type="monotone"
                dataKey="slot1.distance"
                stroke={COLORS.slot1}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name="Slot 1"
              />
              <Line
                type="monotone"
                dataKey="slot2.distance"
                stroke={COLORS.slot2}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name="Slot 2"
              />
              <Line
                type="monotone"
                dataKey="slot3.distance"
                stroke={COLORS.slot3}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name="Slot 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Data Export Info */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-indigo-400">Data Export Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Total Data Points</div>
              <div className="text-2xl font-bold text-white">{historicalData.length}</div>
            </div>
            <div>
              <div className="text-gray-400">Time Range</div>
              <div className="text-2xl font-bold text-white">{timeRange}h</div>
            </div>
            <div>
              <div className="text-gray-400">Export Format</div>
              <div className="text-2xl font-bold text-white">XLSX</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}