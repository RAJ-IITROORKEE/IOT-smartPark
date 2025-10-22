// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNxCBxLhAVE-9h4UorCzZcBLtVkdDaQg4",
  authDomain: "iot-smart-park-4bff5.firebaseapp.com",
  projectId: "iot-smart-park-4bff5",
  storageBucket: "iot-smart-park-4bff5.firebasestorage.app",
  messagingSenderId: "432026352097",
  appId: "1:432026352097:web:3887c8b0dbeda936fd7aa0",
  measurementId: "G-WNN5RYDY8C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);