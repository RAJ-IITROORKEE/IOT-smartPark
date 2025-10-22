#include <WiFi.h>
#include <HTTPClient.h>

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
  Serial.println("=== SmartPark ESP32 DEBUG VERSION ===");

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
  Serial.println("\nWiFi Connected!");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());
  Serial.println("Target Server: " + serverURL);
  
  // Test connectivity
  Serial.println("Testing server connectivity...");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    String payload = "{\"distances\":[";

    Serial.println("--- Reading Sensors ---");
    for (int i = 0; i < NUM_SENSORS; i++) {
      float d = getDistance(sensors[i].trig, sensors[i].echo);
      if (i > 0) payload += ",";

      if (d < 0) {
        payload += "null";
        Serial.printf("Sensor %d -> NULL\n", i + 1);
      } else {
        payload += String(d, 2);
        Serial.printf("Sensor %d -> %.2f cm\n", i + 1, d);
      }
    }

    payload += "]}";
    Serial.println("JSON Payload: " + payload);

    HTTPClient http;
    
    // More detailed HTTP setup
    Serial.println("Connecting to: " + serverURL);
    bool beginResult = http.begin(serverURL);
    Serial.println("HTTP begin result: " + String(beginResult));
    
    if (!beginResult) {
      Serial.println("❌ Failed to begin HTTP connection");
      delay(5000);
      return;
    }

    // Set headers
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Content-Length", String(payload.length()));
    
    // Set timeout
    http.setTimeout(10000); // 10 second timeout
    
    Serial.println("Sending POST request...");
    int httpResponseCode = http.POST(payload);
    
    Serial.println("HTTP Response Code: " + String(httpResponseCode));

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response Length: " + String(response.length()));
      Serial.println("Full Response: [" + response + "]");
      
      // Check if response looks like JSON
      if (response.startsWith("{") && response.endsWith("}")) {
        Serial.println("✅ Received valid JSON response");
        
        // Simple parsing without ArduinoJson
        if (response.indexOf("\"led1\":1") > 0) {
          digitalWrite(led1, HIGH);
          Serial.println("LED1 ON");
        } else if (response.indexOf("\"led1\":0") > 0) {
          digitalWrite(led1, LOW);
          Serial.println("LED1 OFF");
        }

        if (response.indexOf("\"led2\":1") > 0) {
          digitalWrite(led2, HIGH);
          Serial.println("LED2 ON");
        } else if (response.indexOf("\"led2\":0") > 0) {
          digitalWrite(led2, LOW);
          Serial.println("LED2 OFF");
        }
      } else {
        Serial.println("❌ Response is not JSON format");
        Serial.println("This might be an HTML error page or redirect");
      }
    } else {
      Serial.println("❌ HTTP Error: " + String(httpResponseCode));
      
      // Print error details
      switch(httpResponseCode) {
        case -1: Serial.println("Connection failed"); break;
        case -2: Serial.println("Send header failed"); break;
        case -3: Serial.println("Send payload failed"); break;
        case -4: Serial.println("Not connected"); break;
        case -5: Serial.println("Connection lost"); break;
        case -6: Serial.println("No stream"); break;
        case -7: Serial.println("No HTTP server"); break;
        case -8: Serial.println("Too less RAM"); break;
        case -9: Serial.println("Encoding error"); break;
        case -10: Serial.println("Stream write error"); break;
        case -11: Serial.println("Read timeout"); break;
        default: Serial.println("Unknown error");
      }
    }

    http.end();
    Serial.println("--- Request Complete ---\n");
  } else {
    Serial.println("❌ WiFi Disconnected! Reconnecting...");
    WiFi.begin(ssid, password);
  }

  delay(3000); // Slower for debugging
}