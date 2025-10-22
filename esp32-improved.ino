#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ==== WiFi credentials ====
const char* ssid     = "Realme8";
const char* password = "rajrabidas123";

// ==== Your PC/Laptop IP where Next.js is running ====
String serverURL = "http://10.19.4.172:3000/api/update";

// ==== LED pins ====
const int led1 = 5;   // GPIO5
const int led2 = 18;  // GPIO18

// ==== Sound speed in cm/us ====
#define SOUND_SPEED 0.034

// ==== Sensor configuration ====
struct Sensor {
  int trig;
  int echo;
};

Sensor sensors[] = {
  {4, 2},   // Sensor 1
  {19, 21}, // Sensor 2
  {12, 14}  // Sensor 3
};

const int NUM_SENSORS = sizeof(sensors) / sizeof(sensors[0]);

// ==== Function to read distance ====
float getDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 25000); // timeout = 25ms
  if (duration == 0) return -1; // no response
  return (duration * SOUND_SPEED / 2.0);
}

void setup() {
  Serial.begin(115200);
  Serial.println("=== SmartPark ESP32 Starting ===");

  // Setup pins for each sensor
  for (int i = 0; i < NUM_SENSORS; i++) {
    pinMode(sensors[i].trig, OUTPUT);
    pinMode(sensors[i].echo, INPUT);
  }

  // Setup LEDs
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);

  // Connect WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
  Serial.println("Server URL: " + serverURL);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Create JSON payload using ArduinoJson library for better formatting
    StaticJsonDocument<200> doc;
    JsonArray distanceArray = doc.createNestedArray("distances");

    Serial.println("--- Reading Sensors ---");
    for (int i = 0; i < NUM_SENSORS; i++) {
      float d = getDistance(sensors[i].trig, sensors[i].echo);

      if (d < 0) {
        distanceArray.add(nullptr); // Add null for failed sensor
        Serial.printf("Sensor %d -> NULL\n", i + 1);
      } else {
        distanceArray.add(d);
        Serial.printf("Sensor %d -> %.2f cm\n", i + 1, d);
      }
    }

    // Convert to string
    String payload;
    serializeJson(doc, payload);
    Serial.println("Sending: " + payload);

    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("User-Agent", "ESP32-SmartPark/1.0");
    
    // Set timeout
    http.setTimeout(5000);

    int httpResponseCode = http.POST(payload);
    Serial.println("HTTP Response Code: " + String(httpResponseCode));

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Server Response Length: " + String(response.length()));
      Serial.println("Server Response: " + response);

      // Try to parse JSON response
      StaticJsonDocument<200> responseDoc;
      DeserializationError error = deserializeJson(responseDoc, response);
      
      if (error) {
        Serial.println("Failed to parse JSON response: " + String(error.c_str()));
      } else {
        // Successfully parsed JSON
        if (responseDoc.containsKey("led1")) {
          digitalWrite(led1, responseDoc["led1"] ? HIGH : LOW);
          Serial.println("LED1 set to: " + String(responseDoc["led1"].as<int>()));
        }
        if (responseDoc.containsKey("led2")) {
          digitalWrite(led2, responseDoc["led2"] ? HIGH : LOW);
          Serial.println("LED2 set to: " + String(responseDoc["led2"].as<int>()));
        }
      }
    } else {
      Serial.println("HTTP Error: " + String(httpResponseCode));
      Serial.println("Error: " + http.errorToString(httpResponseCode));
    }

    http.end();
    Serial.println("--- End Request ---");
  } else {
    Serial.println("WiFi Disconnected!");
  }

  delay(2000); // update every 2 sec
}