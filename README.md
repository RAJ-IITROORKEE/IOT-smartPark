# SmartPark - IoT Parking Management System

A production-ready smart parking management system built with Next.js, Firebase, and ESP32 integration. Features real-time monitoring, admin dashboard, and scalable sensor configuration.

## 🚀 Features

### User Interface
- **Real-time Parking Dashboard**: Live view of parking spot availability
- **Interactive Parking Cards**: Visual representation of each parking spot
- **Historical Data**: Charts showing occupancy patterns over time
- **Responsive Design**: Works on desktop and mobile devices

### Admin Panel
- **Secure Authentication**: Username/password protected admin routes
- **Parking Spot Management**: Full CRUD operations for parking spots
- **Sensor Configuration**: Easy assignment of GPIO pins to parking spots
- **Real-time Dashboard**: Monitor all spots and sensor activity
- **Scalable Architecture**: Add unlimited parking spots and sensors

### Technical Features
- **Firebase Integration**: Real-time database with Firestore
- **ESP32 Support**: Hardware integration for ultrasonic sensors
- **Production Ready**: Error handling, validation, and security
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd SmartPark
npm install
```

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Create a service account and download the private key
4. Get your Firebase web config

### 3. Environment Configuration

Create `.env.local` file in the root directory:

```env
# Firebase Web Config (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Private)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"

# JWT Secret for Admin Authentication
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the main dashboard.
Visit `http://localhost:3000/admin` for admin panel (default: admin/admin123)

## 🔧 Configuration

### Adding Parking Spots

1. Login to admin panel at `/admin`
2. Navigate to "Parking Spots"
3. Click "Add Spot" and configure:
   - **Name**: Unique identifier (e.g., "A1", "B2")
   - **Position**: Row and column for grid layout
   - **Sensor Pin**: GPIO pin number (optional)
   - **Threshold**: Distance in cm to detect occupancy
   - **Active**: Enable/disable the spot

### Sensor Configuration

1. Navigate to "Sensors" in admin panel
2. View available GPIO pins
3. Assign pins to parking spots
4. Monitor sensor activity and readings

## 🔌 Hardware Integration (ESP32)

### ESP32 Code Example

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";
const char* serverURL = "http://your-domain.com/api/update";

// Define sensor pins
const int trigPins[] = {2, 4, 16};  // Trigger pins
const int echoPins[] = {5, 18, 17}; // Echo pins
const int numSensors = 3;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  // Initialize sensor pins
  for(int i = 0; i < numSensors; i++) {
    pinMode(trigPins[i], OUTPUT);
    pinMode(echoPins[i], INPUT);
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // Read all sensors
    JsonDocument doc;
    JsonArray distances = doc["distances"].to<JsonArray>();
    
    for(int i = 0; i < numSensors; i++) {
      long distance = readUltrasonicSensor(trigPins[i], echoPins[i]);
      distances.add(distance);
    }
    
    // Send to server
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    
    String payload;
    serializeJson(doc, payload);
    int httpResponse = http.POST(payload);
    
    http.end();
  }
  
  delay(5000); // Send every 5 seconds
}

long readUltrasonicSensor(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  long duration = pulseIn(echoPin, HIGH);
  long distance = (duration * 0.034) / 2;
  
  return distance;
}
```

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Security Considerations

1. **Change default admin credentials**
2. **Use strong JWT secret**
3. **Configure Firebase Security Rules**
4. **Enable HTTPS in production**

## 📊 API Endpoints

### Public Endpoints
- `GET /api/update` - Get current parking status
- `POST /api/update` - Update sensor readings (ESP32)

### Admin Endpoints
- `POST /api/admin/login` - Admin authentication
- `GET /api/parking-spots` - List all parking spots
- `POST /api/parking-spots` - Create new parking spot
- `PUT /api/parking-spots/[id]` - Update parking spot
- `DELETE /api/parking-spots/[id]` - Delete parking spot

## 📱 Usage

### For End Users
1. Visit the main dashboard
2. View real-time parking availability
3. Check historical occupancy data

### For Administrators
1. Login to admin panel
2. Manage parking spots and sensors
3. Monitor system health
4. Configure new hardware

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using Next.js, Firebase, and ESP32
