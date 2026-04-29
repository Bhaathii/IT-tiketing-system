// Firebase Configuration
// IT Ticketing System - Production Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBFqICa1xxBUSgDhLWogb6-9fux8U3jNKg",
    authDomain: "it-ticketing-system-c637b.firebaseapp.com",
    projectId: "it-ticketing-system-c637b",
    storageBucket: "it-ticketing-system-c637b.firebasestorage.app",
    messagingSenderId: "1030062791184",
    appId: "1:1030062791184:web:98e9f53c791946b15cc895",
    measurementId: "G-HKCZ1G0G08"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore, Storage, and Authentication
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

console.log("✅ Firebase initialized successfully - IT Ticketing System ready!");
