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
  Serial.println("=== SmartPark ESP32 Production ===");

  // Setup pins for each sensor
  for (int i = 0; i < NUM_SENSORS; i++) {
    pinMode(sensors[i].trig, OUTPUT);
    pinMode(sensors[i].echo, INPUT);
  }

  // Setup LEDs
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  
  // Test LEDs on startup
  digitalWrite(led1, HIGH);
  digitalWrite(led2, HIGH);
  delay(1000);
  digitalWrite(led1, LOW);
  digitalWrite(led2, LOW);
  Serial.println("LED test complete");

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
  Serial.println("Server: " + serverURL);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    String payload = "{\"distances\":[";

    // Read all sensors
    for (int i = 0; i < NUM_SENSORS; i++) {
      float d = getDistance(sensors[i].trig, sensors[i].echo);
      if (i > 0) payload += ",";

      if (d < 0) {
        payload += "null";
        Serial.printf("S%d:NULL ", i + 1);
      } else {
        payload += String(d, 2);
        Serial.printf("S%d:%.1fcm ", i + 1, d);
      }
    }
    payload += "]}";
    Serial.print("| ");

    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(5000); // 5 second timeout
    
    int httpResponseCode = http.POST(payload);

    if (httpResponseCode == 200) {
      String response = http.getString();
      Serial.print("OK ");
      
      // Parse LED commands more reliably
      int led1Pos = response.indexOf("\"led1\":");
      int led2Pos = response.indexOf("\"led2\":");
      
      if (led1Pos > 0) {
        char led1Value = response.charAt(led1Pos + 7); // Position after "led1":
        if (led1Value == '1') {
          digitalWrite(led1, HIGH);
          Serial.print("L1:ON ");
        } else if (led1Value == '0') {
          digitalWrite(led1, LOW);
          Serial.print("L1:OFF ");
        }
      }
      
      if (led2Pos > 0) {
        char led2Value = response.charAt(led2Pos + 7); // Position after "led2":
        if (led2Value == '1') {
          digitalWrite(led2, HIGH);
          Serial.print("L2:ON ");
        } else if (led2Value == '0') {
          digitalWrite(led2, LOW);
          Serial.print("L2:OFF ");
        }
      }
    } else {
      Serial.printf("ERR:%d ", httpResponseCode);
      // Flash error indication
      digitalWrite(led2, HIGH);
      delay(100);
      digitalWrite(led2, LOW);
    }

    http.end();
    Serial.println();
  } else {
    Serial.println("WiFi Lost! Reconnecting...");
    WiFi.begin(ssid, password);
    // Error indication
    digitalWrite(led2, HIGH);
    delay(1000);
    digitalWrite(led2, LOW);
  }

  delay(2000); // Send data every 2 seconds
}