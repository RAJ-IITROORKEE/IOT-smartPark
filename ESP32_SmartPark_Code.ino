/*
 * SmartPark ESP32 Code
 * 
 * This code connects to WiFi and sends ultrasonic sensor data to your SmartPark server.
 * Make sure to update the WiFi credentials and server URL below.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ================ CONFIGURATION ================
// WiFi Settings
const char* ssid = "YOUR_WIFI_NAME";           // Replace with your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Replace with your WiFi password

// Server Settings
const char* serverURL = "http://YOUR_SERVER_IP:3000/api/update";  // For local development
// const char* serverURL = "https://your-domain.com/api/update";  // For production

// Sensor Pin Configuration (HC-SR04 Ultrasonic Sensors)
const int numSensors = 4;                      // Number of sensors
const int trigPins[] = {2, 4, 16, 17};        // Trigger pins
const int echoPins[] = {5, 18, 19, 21};       // Echo pins

// Timing Settings
const unsigned long sendInterval = 5000;      // Send data every 5 seconds
const unsigned long readInterval = 1000;      // Read sensors every 1 second

// ================ VARIABLES ================
unsigned long lastSendTime = 0;
unsigned long lastReadTime = 0;
long distances[numSensors];                    // Store distance readings
bool validReadings[numSensors];               // Track valid readings

// ================ SETUP ================
void setup() {
  Serial.begin(115200);
  Serial.println("\n=== SmartPark ESP32 Starting ===");

  // Initialize sensor pins
  for (int i = 0; i < numSensors; i++) {
    pinMode(trigPins[i], OUTPUT);
    pinMode(echoPins[i], INPUT);
    distances[i] = 0;
    validReadings[i] = false;
  }

  // Connect to WiFi
  connectToWiFi();
  
  Serial.println("Setup complete. Starting main loop...");
}

// ================ MAIN LOOP ================
void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectToWiFi();
  }

  // Read sensors
  if (millis() - lastReadTime >= readInterval) {
    readAllSensors();
    lastReadTime = millis();
  }

  // Send data to server
  if (millis() - lastSendTime >= sendInterval) {
    sendDataToServer();
    lastSendTime = millis();
  }

  delay(100); // Small delay for stability
}

// ================ FUNCTIONS ================

void connectToWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(1000);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal strength (RSSI): ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\nFailed to connect to WiFi!");
  }
}

void readAllSensors() {
  for (int i = 0; i < numSensors; i++) {
    long distance = readUltrasonicSensor(trigPins[i], echoPins[i]);
    
    // Validate reading (should be between 2cm and 400cm)
    if (distance >= 2 && distance <= 400) {
      distances[i] = distance;
      validReadings[i] = true;
    } else {
      validReadings[i] = false;
      Serial.print("Invalid reading from sensor ");
      Serial.print(i);
      Serial.print(": ");
      Serial.println(distance);
    }
  }
}

long readUltrasonicSensor(int trigPin, int echoPin) {
  // Clear the trigger pin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  
  // Trigger the sensor
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Read the echo pin
  long duration = pulseIn(echoPin, HIGH, 30000); // 30ms timeout
  
  // Calculate distance (speed of sound = 343 m/s)
  long distance = (duration * 0.034) / 2;
  
  return distance;
}

void sendDataToServer() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Cannot send data - WiFi not connected");
    return;
  }

  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");

  // Create JSON payload
  JsonDocument doc;
  JsonArray distanceArray = doc["distances"].to<JsonArray>();
  
  Serial.print("Sending data: [");
  for (int i = 0; i < numSensors; i++) {
    if (validReadings[i]) {
      distanceArray.add(distances[i]);
      Serial.print(distances[i]);
    } else {
      distanceArray.add(nullptr); // Send null for invalid readings
      Serial.print("null");
    }
    
    if (i < numSensors - 1) Serial.print(", ");
  }
  Serial.println("]");

  // Serialize and send
  String payload;
  serializeJson(doc, payload);
  
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("Server response (");
    Serial.print(httpResponseCode);
    Serial.print("): ");
    Serial.println(response);
    
    if (httpResponseCode == 200) {
      Serial.println("✓ Data sent successfully!");
    }
  } else {
    Serial.print("✗ Error sending data. HTTP code: ");
    Serial.println(httpResponseCode);
    Serial.print("Error: ");
    Serial.println(http.errorToString(httpResponseCode));
  }
  
  http.end();
}

// ================ UTILITY FUNCTIONS ================

void printSensorReadings() {
  Serial.println("--- Sensor Readings ---");
  for (int i = 0; i < numSensors; i++) {
    Serial.print("Sensor ");
    Serial.print(i);
    Serial.print(" (Pin ");
    Serial.print(trigPins[i]);
    Serial.print("/");
    Serial.print(echoPins[i]);
    Serial.print("): ");
    
    if (validReadings[i]) {
      Serial.print(distances[i]);
      Serial.println(" cm");
    } else {
      Serial.println("Invalid");
    }
  }
  Serial.println("----------------------");
}

/*
 * TROUBLESHOOTING GUIDE:
 * 
 * 1. WiFi Connection Issues:
 *    - Double-check WiFi credentials
 *    - Make sure ESP32 is in range of WiFi router
 *    - Try connecting to a mobile hotspot for testing
 * 
 * 2. Server Connection Issues:
 *    - If using local development, replace YOUR_SERVER_IP with your computer's IP
 *    - Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)
 *    - Make sure your computer and ESP32 are on the same network
 *    - Test the server URL in your browser first
 * 
 * 3. Sensor Issues:
 *    - Check wiring: VCC→5V, GND→GND, Trig→GPIO, Echo→GPIO
 *    - Make sure sensors have clear line of sight
 *    - Test with different GPIO pins if readings are inconsistent
 * 
 * 4. LED Indicator (Optional):
 *    - Connect LED to pin 2 with 220Ω resistor for status indication
 * 
 * 5. Serial Monitor:
 *    - Open Arduino IDE Serial Monitor at 115200 baud
 *    - Check for connection status and sensor readings
 */