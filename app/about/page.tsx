"use client";

import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  Wifi, 
  Smartphone, 
  BarChart3, 
  MapPin, 
  Globe,
  Mail,
  Users,
  Award,
  Cpu,
  Database
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-gray-100">
      <Header />
      
      <main className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SmartPark IoT System
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            An intelligent parking management system using ESP32 microcontrollers, 
            ultrasonic sensors, and real-time web monitoring for efficient urban parking solutions.
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge className="bg-blue-600 text-blue-100">IoT Development</Badge>
            <Badge className="bg-green-600 text-green-100">Real-time Monitoring</Badge>
            <Badge className="bg-purple-600 text-purple-100">Next.js 14</Badge>
            <Badge className="bg-orange-600 text-orange-100">ESP32</Badge>
          </div>
        </div>

        {/* What This Application Does */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-3xl text-indigo-400 flex items-center gap-3">
              <Car className="h-8 w-8" />
              What SmartPark Does
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-gray-300 leading-relaxed">
              SmartPark is an innovative IoT-based parking management solution designed to solve urban parking challenges. 
              Our system provides real-time monitoring, data analytics, and efficient space utilization for modern cities.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="h-5 w-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Real-time Monitoring</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Live tracking of parking spot occupancy using ultrasonic sensors with configurable thresholds
                </p>
              </div>
              
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  <h3 className="font-semibold text-white">Data Analytics</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Historical data analysis, occupancy trends, and exportable reports for better decision making
                </p>
              </div>
              
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-purple-400" />
                  <h3 className="font-semibold text-white">GPS Integration</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Location-based services with Google Maps integration for easy navigation to available spots
                </p>
              </div>
              
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-5 w-5 text-orange-400" />
                  <h3 className="font-semibold text-white">Web Dashboard</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Responsive web interface for monitoring, configuration, and management of parking infrastructure
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-lg border border-blue-800/30">
              <h3 className="text-xl font-semibold text-blue-300 mb-3 flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Technical Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">ESP32 microcontroller integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">Ultrasonic sensor arrays (HC-SR04)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">Firebase Firestore database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">Next.js 14 with TypeScript</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300">Real-time WebSocket connections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300">Configurable distance thresholds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300">LED status indication system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300">Excel data export functionality</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-3xl text-indigo-400 flex items-center gap-3">
              <Users className="h-8 w-8" />
              Our Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Professor */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-indigo-900/20 to-blue-900/20 p-6 rounded-lg border border-indigo-800/30">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-6 w-6 text-yellow-400" />
                  <h3 className="text-2xl font-semibold text-yellow-400">Project Supervisor</h3>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">RT</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Dr. Rahul Thakur</h4>
                      <p className="text-indigo-400 font-medium">Assistant Professor, Computer Science & Engineering</p>
                      <p className="text-gray-400">Indian Institute of Technology, Roorkee</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Leading expert in IoT systems and embedded computing. Supervising this innovative 
                    parking management solution as part of the IoT research initiative at IIT Roorkee.
                  </p>
                </div>
              </div>
            </div>

            {/* Student Team */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Database className="h-6 w-6 text-blue-400" />
                <h3 className="text-2xl font-semibold text-blue-400">Development Team</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Raj Rabidas */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-white">RR</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Raj Rabidas</h4>
                      <p className="text-green-400 font-medium">Lead Developer & Hardware Setup</p>
                      <p className="text-gray-400 text-sm">B.Tech 3rd Year, Metallurgical and Materials Engineering</p>
                      <p className="text-gray-500 text-xs">Indian Institute of Technology, Roorkee</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4">
                    Full-stack developer specializing in IoT systems. Responsible for ESP32 programming, 
                    sensor integration, web development, and overall system architecture.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="bg-blue-600 text-blue-100">Next.js</Badge>
                    <Badge variant="secondary" className="bg-green-600 text-green-100">ESP32</Badge>
                    <Badge variant="secondary" className="bg-purple-600 text-purple-100">IoT</Badge>
                    <Badge variant="secondary" className="bg-orange-600 text-orange-100">Hardware</Badge>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open("https://rajrabidas.me", "_blank")}
                      className="flex items-center gap-2 text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                    >
                      <Globe className="h-4 w-4" />
                      Portfolio
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open("mailto:rajrabidas001@gmail.com", "_blank")}
                      className="flex items-center gap-2 text-gray-400 border-gray-400 hover:bg-gray-400 hover:text-black"
                    >
                      <Mail className="h-4 w-4" />
                      Contact
                    </Button>
                  </div>
                </div>

                {/* Abhinav Pandey */}
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-white">AP</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Abhinav Pandey</h4>
                      <p className="text-purple-400 font-medium">Hardware Engineer & System Integration</p>
                      <p className="text-gray-400 text-sm">B.Tech 3rd Year, Electrical Engineering</p>
                      <p className="text-gray-500 text-xs">Indian Institute of Technology, Roorkee</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4">
                    Electronics and circuit design specialist. Focused on sensor calibration, 
                    power management, PCB design, and hardware optimization for the parking system.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="bg-yellow-600 text-yellow-100">Electronics</Badge>
                    <Badge variant="secondary" className="bg-red-600 text-red-100">Circuit Design</Badge>
                    <Badge variant="secondary" className="bg-indigo-600 text-indigo-100">Sensors</Badge>
                    <Badge variant="secondary" className="bg-pink-600 text-pink-100">PCB Design</Badge>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open("https://github.com/abhinavpandey", "_blank")}
                      className="flex items-center gap-2 text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white"
                    >
                      <Globe className="h-4 w-4" />
                      GitHub
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open("mailto:abhinav_p@ee.iitr.ac.in", "_blank")}
                      className="flex items-center gap-2 text-gray-400 border-gray-400 hover:bg-gray-400 hover:text-black"
                    >
                      <Mail className="h-4 w-4" />
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Information */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl text-indigo-400">Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-white mb-2">Institution</h4>
                <p className="text-gray-300 text-sm">Indian Institute of Technology, Roorkee</p>
                <p className="text-gray-400 text-xs">Premier engineering institution in India</p>
              </div>
              
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-white mb-2">Academic Year</h4>
                <p className="text-gray-300 text-sm">2025-2026</p>
                <p className="text-gray-400 text-xs">3rd Year B.Tech Project</p>
              </div>
              
              <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-white mb-2">Department</h4>
                <p className="text-gray-300 text-sm">Computer Science & Engineering</p>
                <p className="text-gray-400 text-xs">IoT Research Lab</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 p-4 rounded-lg border border-green-800/30">
              <p className="text-green-300 text-sm">
                <strong>Note:</strong> This project is part of the ongoing research in IoT applications for smart city solutions 
                at IIT Roorkee. Team member photos will be updated soon.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-slate-800">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} SmartPark IoT System. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm mt-2">
            <span className="text-gray-500">Design and developed by</span>
            <a 
              href="https://rajrabidas.me" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              <Globe className="h-3 w-3" />
              Raj Rabidas
            </a>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            IIT Roorkee | Developed under the supervision of Prof. Rahul Thakur, CSE Department
          </p>
        </div>
      </main>
    </div>
  );
}