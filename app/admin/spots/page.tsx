"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParkingSpot } from "@/lib/types";
import { Plus, Edit, Trash2, MapPin, Settings } from "lucide-react";


interface SpotFormData {
  name: string;
  row: number;
  col: number;
  latitude: number | undefined;
  longitude: number | undefined;
  trigPin: number | undefined;
  echoPin: number | undefined;
  sensorId: number | undefined;
  minThreshold: number;
  maxThreshold: number;
  isActive: boolean;
}

export default function SpotsManagement() {
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSpot, setEditingSpot] = useState<ParkingSpot | null>(null);
  const [formData, setFormData] = useState<SpotFormData>({
    name: "",
    row: 1,
    col: 1,
    latitude: undefined,
    longitude: undefined,
    trigPin: undefined,
    echoPin: undefined,
    sensorId: undefined,
    minThreshold: 20,
    maxThreshold: 200,
    isActive: true,
  });

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const response = await fetch("/api/parking-spots");
      if (response.ok) {
        const data = await response.json();
        setSpots(data.spots || []);
      }
    } catch (error) {
      console.error("Error fetching spots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const spotData = {
        name: formData.name,
        row: formData.row,
        col: formData.col,
        latitude: formData.latitude,
        longitude: formData.longitude,
        trigPin: formData.trigPin,
        echoPin: formData.echoPin,
        sensorId: formData.sensorId,
        minThreshold: formData.minThreshold,
        maxThreshold: formData.maxThreshold,
        isActive: formData.isActive,
      };

      let response;
      if (editingSpot) {
        response = await fetch(`/api/parking-spots/${editingSpot.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(spotData),
        });
      } else {
        response = await fetch("/api/parking-spots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(spotData),
        });
      }

      if (response.ok) {
        await fetchSpots();
        handleCloseForm();
      }
    } catch (error) {
      console.error("Error saving spot:", error);
    }
  };

  const handleEdit = (spot: ParkingSpot) => {
    setEditingSpot(spot);
    setFormData({
      name: spot.name,
      row: spot.position.row,
      col: spot.position.col,
      latitude: spot.gpsCoordinates?.latitude,
      longitude: spot.gpsCoordinates?.longitude,
      trigPin: spot.sensorConfig?.trigPin,
      echoPin: spot.sensorConfig?.echoPin,
      sensorId: spot.sensorConfig?.sensorId,
      minThreshold: spot.minThreshold || 20,
      maxThreshold: spot.maxThreshold || 200,
      isActive: spot.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this parking spot?")) {
      try {
        const response = await fetch(`/api/parking-spots/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          await fetchSpots();
        }
      } catch (error) {
        console.error("Error deleting spot:", error);
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSpot(null);
    setFormData({
      name: "",
      row: 1,
      col: 1,
      latitude: undefined,
      longitude: undefined,
      trigPin: undefined,
      echoPin: undefined,
      sensorId: undefined,
      minThreshold: 20,
      maxThreshold: 200,
      isActive: true,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-indigo-400">Parking Spots</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-indigo-400">Parking Spots</h1>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Spot
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-indigo-400">
              {editingSpot ? "Edit Parking Spot" : "Add New Parking Spot"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">Spot Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    placeholder="e.g., A1, B2, Spot-01"
                    required
                  />
                </div>
                {/* GPS Coordinates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude" className="text-gray-300">GPS Latitude (Optional)</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude || ""}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        latitude: e.target.value ? Number(e.target.value) : undefined 
                      })}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="e.g., 37.7749"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="text-gray-300">GPS Longitude (Optional)</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude || ""}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        longitude: e.target.value ? Number(e.target.value) : undefined 
                      })}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="e.g., -122.4194"
                    />
                  </div>
                </div>
                
                {/* Sensor Configuration */}
                <div className="border border-slate-700 rounded-lg p-4 space-y-4">
                  <Label className="text-gray-300 font-medium">Ultrasonic Sensor Configuration (Optional)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sensorId" className="text-gray-300">Sensor ID</Label>
                      <Input
                        id="sensorId"
                        type="number"
                        min="0"
                        value={formData.sensorId ?? ""}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          sensorId: e.target.value ? Number(e.target.value) : undefined 
                        })}
                        className="bg-slate-800 border-slate-700 text-white"
                        placeholder="0, 1, 2..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="trigPin" className="text-gray-300">Trigger Pin</Label>
                      <Input
                        id="trigPin"
                        type="number"
                        value={formData.trigPin ?? ""}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          trigPin: e.target.value ? Number(e.target.value) : undefined 
                        })}
                        className="bg-slate-800 border-slate-700 text-white"
                        placeholder="e.g., 4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="echoPin" className="text-gray-300">Echo Pin</Label>
                      <Input
                        id="echoPin"
                        type="number"
                        value={formData.echoPin ?? ""}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          echoPin: e.target.value ? Number(e.target.value) : undefined 
                        })}
                        className="bg-slate-800 border-slate-700 text-white"
                        placeholder="e.g., 2"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">
                    Configure the ESP32 pins for ultrasonic sensor. Sensor ID corresponds to the array index in your ESP32 code.
                  </p>
                </div>
                <div>
                  <Label htmlFor="row" className="text-gray-300">Row</Label>
                  <Input
                    id="row"
                    type="number"
                    min="1"
                    value={formData.row}
                    onChange={(e) => setFormData({ ...formData, row: Number(e.target.value) })}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="col" className="text-gray-300">Column</Label>
                  <Input
                    id="col"
                    type="number"
                    min="1"
                    value={formData.col}
                    onChange={(e) => setFormData({ ...formData, col: Number(e.target.value) })}
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minThreshold" className="text-gray-300">Min Threshold (cm)</Label>
                    <Input
                      id="minThreshold"
                      type="number"
                      min="1"
                      value={formData.minThreshold}
                      onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="20"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxThreshold" className="text-gray-300">Max Threshold (cm)</Label>
                    <Input
                      id="maxThreshold"
                      type="number"
                      min="1"
                      value={formData.maxThreshold}
                      onChange={(e) => setFormData({ ...formData, maxThreshold: Number(e.target.value) })}
                      className="bg-slate-800 border-slate-700 text-white"
                      placeholder="200"
                      required
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-400 -mt-2">
                  Occupancy detected when distance is between min and max thresholds (e.g., 20-200cm)
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-800"
                  />
                  <Label htmlFor="isActive" className="text-gray-300">Active</Label>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  {editingSpot ? "Update Spot" : "Create Spot"}
                </Button>
                <Button type="button" onClick={handleCloseForm} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Spots List */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-indigo-400">Configured Spots ({spots.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {spots.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No parking spots configured. Add some spots to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {spots.map((spot) => (
                <div
                  key={spot.id}
                  className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${spot.isActive ? "bg-green-900/20" : "bg-gray-700"}`}>
                      <MapPin className={`h-5 w-5 ${spot.isActive ? "text-green-400" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{spot.name}</h3>
                      <div className="text-sm text-gray-400">
                        Position: Row {spot.position.row}, Col {spot.position.col}
                        {spot.sensorConfig?.sensorId !== undefined && ` • Sensor ID: ${spot.sensorConfig.sensorId}`}
                        {spot.distance !== undefined && ` • Distance: ${spot.distance}cm`}
                        {spot.gpsCoordinates && (
                          <div className="mt-1">
                            GPS: {spot.gpsCoordinates.latitude.toFixed(4)}, {spot.gpsCoordinates.longitude.toFixed(4)}
                          </div>
                        )}
                        {spot.sensorConfig && (
                          <div className="mt-1">
                            Pins: Trig {spot.sensorConfig.trigPin}, Echo {spot.sensorConfig.echoPin}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className={
                        spot.isActive
                          ? spot.isOccupied
                            ? "bg-red-600 text-red-100"
                            : "bg-green-600 text-green-100"
                          : "bg-gray-600 text-gray-300"
                      }
                    >
                      {spot.isActive ? (spot.isOccupied ? "Occupied" : "Available") : "Inactive"}
                    </Badge>
                    {spot.gpsCoordinates && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const url = `https://www.google.com/maps?q=${spot.gpsCoordinates?.latitude},${spot.gpsCoordinates?.longitude}`;
                          window.open(url, '_blank');
                        }}
                        className="text-blue-400 hover:text-blue-300"
                        title="Open in Google Maps"
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(spot)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(spot.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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