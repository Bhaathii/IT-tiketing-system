# Firebase Setup Guide - IT Ticketing System

## 📋 Complete Firebase Configuration Guide

This guide will walk you through setting up Firebase for the IT Ticketing System.

---

## ✅ Prerequisites

- Google account
- Web browser
- Text editor
- Basic knowledge of Firebase

---

## 🔧 Step-by-Step Setup

### **Step 1: Create Firebase Project**

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** button
3. Enter project name: `IT Ticketing System`
4. Click **"Continue"**
5. Uncheck "Enable Google Analytics" (optional, can enable later)
6. Click **"Create project"**
7. Wait for project creation to complete

### **Step 2: Register Web App**

1. In Firebase Console, click **"</>""** icon to add a web app
2. App nickname: `IT Ticketing Web`
3. Check "Also set up Firebase Hosting for this app" (optional)
4. Click **"Register app"**
5. Copy the Firebase config - **IMPORTANT: Save this!**

### **Step 3: Copy Your Firebase Config**

You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC_abc123xyz...",
  authDomain: "it-ticketing-system.firebaseapp.com",
  projectId: "it-ticketing-system-12345",
  storageBucket: "it-ticketing-system-12345.appspot.com",
  messagingSenderId: "987654321",
  appId: "1:987654321:web:abcdef123456"
};
```

### **Step 4: Update Your Project**

Replace content of `js/firebase-config.js` with:

```javascript
// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "1:YOUR_APP_ID:web:YOUR_UNIQUE_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore and Storage
const db = firebase.firestore();
const storage = firebase.storage();

console.log("Firebase initialized successfully");
```

### **Step 5: Enable Firestore Database**

1. In Firebase Console, go to **"Firestore Database"** (left menu)
2. Click **"Create database"**
3. Select region (choose closest to your location)
4. Click **"Next"**
5. Select **"Start in test mode"** (for development)
6. Click **"Enable"**
7. Database is now ready!

### **Step 6: Enable Cloud Storage**

1. In Firebase Console, go to **"Storage"** (left menu)
2. Click **"Get started"**
3. Read the warning and click **"Next"**
4. Select location (same as Firestore)
5. Click **"Done"**
6. Storage is now ready!

### **Step 7: Create Firestore Collections**

1. In Firestore Database, click **"+ Create collection"**
2. Enter collection name: `tickets`
3. Click **"Next"**
4. Click **"Auto ID"**
5. Add sample document with:
   - Field: `createdAt`, Type: `timestamp`, Value: `today's date`
   - Field: `status`, Type: `string`, Value: `"Sample"`
6. Click **"Save"**

Repeat for `notifications` collection

### **Step 8: Update Security Rules (Development Mode)**

1. Go to Firestore > **"Rules"** tab
2. Replace content with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes (development only)
    match /tickets/{document=**} {
      allow read, write: if true;
    }
    match /notifications/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **"Publish"**

### **Step 9: Update Storage Rules (Development Mode)**

1. Go to Storage > **"Rules"** tab
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow all reads and writes (development only)
    match /attachments/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **"Publish"**

---

## 🧪 Testing Your Setup

### **Test 1: Check Firebase Connection**

1. Open `index.html` in browser
2. Open Developer Console (F12 or Right-click > Inspect)
3. Check console for message: `"Firebase initialized successfully"`
4. If you see an error, check your `firebase-config.js`

### **Test 2: Submit a Test Ticket**

1. Click "Submit Ticket"
2. Fill in the form with test data
3. Submit the ticket
4. Go to Firebase Console > Firestore Database
5. Open `tickets` collection
6. You should see your test ticket!

### **Test 3: Check Admin Dashboard**

1. Click "Admin Dashboard"
2. Tickets should appear from the test submission
3. You should see charts and statistics

---

## 📊 Database Structure Reference

### **Tickets Collection Structure**

```
tickets/
├── Document ID (auto-generated)
│   ├── employeeName: string
│   ├── employeeId: string
│   ├── department: string
│   ├── email: string
│   ├── contactNumber: string
│   ├── equipment: string
│   ├── priority: string (Low, Medium, High, Urgent)
│   ├── issueTitle: string
│   ├── issueDescription: string
│   ├── isRemote: boolean
│   ├── contactMethod: string
│   ├── status: string (New, In-Progress, Resolved)
│   ├── assignedTo: string (nullable)
│   ├── attachments: array
│   │   └── {name, url, uploadedAt}
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   └── resolvedAt: timestamp (nullable)
```

### **Notifications Collection Structure**

```
notifications/
├── Document ID (auto-generated)
│   ├── type: string (new_ticket, ticket_update)
│   ├── ticketId: string
│   ├── email: string
│   ├── employeeName: string
│   ├── message: string
│   ├── read: boolean
│   └── createdAt: timestamp
```

---

## 🚀 Deployment Options

### **Option 1: Firebase Hosting (Recommended)**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project directory
firebase init

# Deploy
firebase deploy
```

Your site will be live at: `https://your-project-id.web.app`

### **Option 2: Local Server**

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js:**
```bash
npx http-server
```

Visit: `http://localhost:8000`

### **Option 3: Traditional Hosting**

Upload all files to any web hosting service (Netlify, Vercel, etc.)

---

## 🔐 Production Security Rules

When going to production, update your security rules:

### **Firestore Rules (Production)**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can submit tickets
    match /tickets/{ticketId} {
      allow create: if request.auth != null;
      allow read: if request.auth.token.admin == true || 
                     request.auth.token.email == resource.data.email;
      allow update: if request.auth.token.admin == true;
      allow delete: if false;
    }
    
    // Admins can manage notifications
    match /notifications/{docId} {
      allow read: if request.auth.token.admin == true;
      allow create: if request.auth.token.admin == true;
      allow delete: if request.auth.token.admin == true;
    }
  }
}
```

### **Storage Rules (Production)**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /attachments/{fileName} {
      // Allow upload only if authenticated
      allow write: if request.auth != null && 
                      request.resource.size < 10 * 1024 * 1024;
      allow read: if request.auth != null;
    }
  }
}
```

---

## 🆘 Common Issues & Solutions

### **Issue: "Firebase is not defined"**

**Solution:** Make sure you're loading Firebase SDK before your app script:
```html
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js"></script>
<script src="js/firebase-config.js"></script>
<script src="js/your-app.js"></script>
```

### **Issue: "Permission denied" when saving**

**Solution:** 
1. Check your security rules are in test mode
2. Verify Firestore is initialized
3. Check browser console for specific error message

### **Issue: Files not uploading to Storage**

**Solution:**
1. Verify Cloud Storage is enabled
2. Check storage rules are correct
3. Verify file size is less than 10MB
4. Check storage.ref() path is correct

### **Issue: No data showing in dashboard**

**Solution:**
1. Submit a test ticket first
2. Go to Firebase Console and verify data exists
3. Check browser console for JavaScript errors
4. Verify firestore.collection() path is correct

---

## 📱 Environment Variables (Optional for Production)

Create `.env` file:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_project
```

Then use in config:
```javascript
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    ...
};
```

---

## 🔍 Monitoring & Debugging

### **Check Firestore Usage**
1. Firebase Console > Firestore Database > Data
2. View stored tickets in real-time

### **Check Storage Usage**
1. Firebase Console > Storage
2. View uploaded files and usage statistics

### **View Console Logs**
1. Open browser DevTools (F12)
2. Console tab shows Firebase activity
3. Check for any error messages

### **Monitor Analytics (Optional)**
1. Firebase Console > Analytics
2. View user activity and engagement

---

## 📞 Support Resources

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Community: https://firebase.google.com/community
- Stack Overflow: Tag with `firebase`

---

## ✨ Next Steps

1. ✅ Firebase project created
2. ✅ Firestore database enabled
3. ✅ Cloud Storage enabled
4. ✅ Security rules configured
5. 📝 Add Authentication (optional)
6. 📧 Add Email notifications (optional)
7. 🚀 Deploy to production (optional)

---

**Last Updated:** April 2026
**Firebase SDK Version:** 10.7.0
