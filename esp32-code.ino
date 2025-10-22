/*
 * ESP32 SmartPark Sensor Code
 * This code reads ultrasonic sensors and sends data to the SmartPark API
 * 
 * Hardware Setup:
 * - Connect your ultrasonic sensors (HC-SR04) to ESP32
 * - Update pin numbers below according to your wiring
 * - Make sure ESP32 is connected to WiFi
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials - UPDATE THESE
const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";

// Server URL - UPDATE THIS to your local IP or domain
const char* serverURL = "http://192.168.1.100:3000/api/update";  // Change IP to your computer's IP
// For deployed version: const char* serverURL = "https://your-domain.com/api/update";

// Sensor pin configuration - UPDATE ACCORDING TO YOUR WIRING
struct Sensor {
  int trigPin;
  int echoPin;
  String name;
};

// Define your sensors here (add/remove as needed)
Sensor sensors[] = {
  {2, 5, "Spot_A1"},    // Sensor 1: Trig=GPIO2, Echo=GPIO5
  {4, 18, "Spot_A2"},   // Sensor 2: Trig=GPIO4, Echo=GPIO18
  {16, 17, "Spot_A3"},  // Sensor 3: Trig=GPIO16, Echo=GPIO17
  // Add more sensors here as needed
  // {12, 13, "Spot_B1"},
  // {14, 27, "Spot_B2"},
};

const int numSensors = sizeof(sensors) / sizeof(sensors[0]);

void setup() {
  Serial.begin(115200);
  
  // Initialize sensor pins
  for(int i = 0; i < numSensors; i++) {
    pinMode(sensors[i].trigPin, OUTPUT);
    pinMode(sensors[i].echoPin, INPUT);
    Serial.println("Sensor " + sensors[i].name + " initialized: Trig=" + 
                   String(sensors[i].trigPin) + ", Echo=" + String(sensors[i].echoPin));
  }
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("WiFi connected!");
  Serial.println("IP address: " + WiFi.localIP().toString());
  Serial.println("Server URL: " + String(serverURL));
  Serial.println("Starting sensor readings...");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Read all sensors
    JsonDocument doc;
    JsonArray distances = doc["distances"].to<JsonArray>();
    
    Serial.println("\n--- Reading Sensors ---");
    
    for(int i = 0; i < numSensors; i++) {
      long distance = readUltrasonicSensor(sensors[i].trigPin, sensors[i].echoPin);
      distances.add(distance);
      
      Serial.println(sensors[i].name + ": " + String(distance) + "cm");
    }
    
    // Send to server
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    
    String payload;
    serializeJson(doc, payload);
    
    Serial.println("Sending: " + payload);
    
    int httpResponse = http.POST(payload);
    
    if (httpResponse > 0) {
      String response = http.getString();
      Serial.println("Response (" + String(httpResponse) + "): " + response);
    } else {
      Serial.println("Error: " + String(httpResponse));
    }
    
    http.end();
  } else {
    Serial.println("WiFi disconnected! Reconnecting...");
    WiFi.reconnect();
  }
  
  delay(5000); // Send every 5 seconds
}

long readUltrasonicSensor(int trigPin, int echoPin) {
  // Clear the trigger pin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  
  // Send 10us pulse
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Read echo pin
  long duration = pulseIn(echoPin, HIGH, 30000); // 30ms timeout
  
  if (duration == 0) {
    return 999; // Sensor error or out of range
  }
  
  // Calculate distance in cm
  long distance = (duration * 0.034) / 2;
  
  // Limit to reasonable range
  if (distance > 400) {
    distance = 400; // Max range
  }
  
  return distance;
}

/*
 * WIRING GUIDE:
 * 
 * ESP32 → HC-SR04 Ultrasonic Sensor
 * VCC (3.3V or 5V) → VCC
 * GND → GND
 * GPIO2 → Trig (Sensor 1)
 * GPIO5 → Echo (Sensor 1)
 * GPIO4 → Trig (Sensor 2)
 * GPIO18 → Echo (Sensor 2)
 * ... (add more as needed)
 * 
 * SETUP STEPS:
 * 1. Update WiFi credentials above
 * 2. Update serverURL with your computer's IP address
 * 3. Wire sensors according to pin configuration
 * 4. Upload code to ESP32
 * 5. Monitor Serial output for debugging
 * 
 * TROUBLESHOOTING:
 * - Check WiFi connection
 * - Verify server URL (use your computer's IP, not localhost)
 * - Make sure SmartPark app is running on port 3000
 * - Check serial monitor for error messages
 * - Test API manually: http://your-ip:3000/api/update
 */