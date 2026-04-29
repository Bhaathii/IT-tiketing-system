# Firestore Setup - Complete Step-by-Step Guide

## ✅ Prerequisites
- ✅ Firebase project created: `it-ticketing-system-c637b`
- ✅ Firebase config updated in `js/firebase-config.js`
- ✅ Google account

---

## 🔧 Step 1: Open Firebase Console

1. Go to: https://console.firebase.google.com/
2. Select your project: **it-ticketing-system-c637b**
3. You'll see the Firebase dashboard

---

## 📊 Step 2: Create Firestore Database

1. In left menu, click **"Firestore Database"** (or "Cloud Firestore")
2. Click **"Create database"** button
3. A popup appears with options:
   - **Location**: Select closest region (e.g., `europe-west1`, `us-central1`)
   - Click **"Next"**

4. **Security rules** popup appears:
   - Choose **"Start in test mode"** (for development)
   - Click **"Enable"**

5. Wait for database to create (2-3 minutes)
6. You'll see: **"Firestore Database is ready!"**

✅ **Firestore Database is now created!**

---

## 🗂️ Step 3: Create "tickets" Collection

1. In Firestore, click **"+ Create collection"** button
2. Enter collection name: **`tickets`**
3. Click **"Next"**
4. It asks for first document:
   - Click **"Auto ID"** to generate an ID
   - Add these fields:

| Field Name | Type | Value |
|-----------|------|-------|
| employeeName | String | Test Employee |
| email | String | test@company.com |
| issueTitle | String | Test Ticket |
| status | String | New |
| createdAt | Timestamp | Today's date |

5. Click **"Save"**

✅ **"tickets" collection created!**

---

## 📬 Step 4: Create "notifications" Collection

1. Click **"+ Create collection"** button again
2. Enter collection name: **`notifications`**
3. Click **"Next"**
4. Add these fields:

| Field Name | Type | Value |
|-----------|------|-------|
| type | String | new_ticket |
| ticketId | String | auto-generated |
| email | String | admin@company.com |
| message | String | Test notification |
| read | Boolean | false |
| createdAt | Timestamp | Today's date |

5. Click **"Save"**

✅ **"notifications" collection created!**

---

## 🔐 Step 5: Set Firestore Security Rules

1. In Firestore, click **"Rules"** tab (top of the database)
2. Delete ALL existing content
3. Paste this code:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read and write tickets (test mode)
    match /tickets/{document=**} {
      allow read, write: if true;
    }
    // Allow anyone to read and write notifications (test mode)
    match /notifications/{document=**} {
      allow read, write: if true;
    }
  }
}
```

4. Click **"Publish"** button
5. Wait for rules to update (you'll see a checkmark)

✅ **Security rules published!**

---

## 📁 Step 6: Enable Cloud Storage

1. In left menu, click **"Storage"** (under "Build")
2. Click **"Get started"** button
3. Read the warning, click **"Next"**
4. Select region (same as Firestore)
5. Click **"Done"**

6. Click **"Rules"** tab
7. Delete all content
8. Paste this code:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read and write attachments
    match /attachments/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

9. Click **"Publish"** button

✅ **Cloud Storage is ready!**

---

## 🧪 Step 7: Test Firestore Connection

### **Test in Browser Console:**

1. Open your project in browser: `index.html`
2. Press **F12** to open Developer Tools
3. Click **"Console"** tab
4. Copy-paste this code:

```javascript
db.collection("tickets").get().then(snapshot => {
  console.log("✅ Connected to Firestore!");
  console.log("Documents found:", snapshot.size);
  snapshot.forEach(doc => {
    console.log("Ticket:", doc.data());
  });
}).catch(error => {
  console.error("❌ Error:", error);
});
```

5. Press **Enter**
6. You should see:
   - ✅ `Connected to Firestore!`
   - Number of documents found
   - Your test data

✅ **Firestore is connected!**

---

## 📝 Step 8: Test Ticket Submission

1. On homepage, click **"Submit Ticket"**
2. Fill in the form:
   - Name: Your name
   - Email: your@email.com
   - Department: Finance
   - Equipment: Desktop
   - Priority: High
   - Issue Title: Test Issue
   - Description: This is a test

3. Click **"Submit Ticket"**
4. You should see: **"Ticket submitted successfully!"**

✅ **Ticket submission works!**

---

## 🔍 Step 9: Verify Data in Firebase

1. Go back to Firebase Console
2. Click **Firestore Database**
3. Open **"tickets"** collection
4. You should see your submitted ticket with:
   - Document ID (auto-generated)
   - All your form data
   - Timestamp

✅ **Data is saved in Firestore!**

---

## 📊 Step 10: Test Admin Dashboard

1. Go to homepage, click **"Admin Dashboard"**
2. You should see:
   - ✅ Total Tickets: 2 (your test + sample)
   - ✅ New Tickets: 1
   - ✅ Your ticket in the queue
   - ✅ Charts and analytics
   - ✅ Priority breakdown

✅ **Admin dashboard is working!**

---

## 🎫 Step 11: Test Ticket Status Update

1. In Admin Dashboard, click on your ticket
2. A modal appears showing all details
3. Change:
   - **Status**: Select "In-Progress"
   - **Assigned To**: Type your name
4. Click **"Update"** button
5. You should see: Ticket updated

✅ **Ticket updates work!**

---

## 📋 Step 12: Test User Ticket Tracker

1. Go to "My Tickets" page
2. Enter your email address
3. Click **"Load Tickets"** (or it auto-loads)
4. You should see:
   - ✅ Your submitted ticket
   - ✅ Current status
   - ✅ Priority level
   - ✅ Filter options work

✅ **User tracker is working!**

---

## ✨ Complete Firestore Connection Checklist

- [ ] Firestore Database created
- [ ] "tickets" collection created with sample data
- [ ] "notifications" collection created with sample data
- [ ] Firestore security rules published
- [ ] Cloud Storage enabled
- [ ] Storage security rules published
- [ ] Console test shows connection ✅
- [ ] Ticket submission works
- [ ] Data appears in Firebase Console
- [ ] Admin dashboard loads data
- [ ] Status updates work
- [ ] User tracker loads tickets
- [ ] Charts and analytics display

---

## 🔍 Troubleshooting

### **Issue: "Firebase is not defined"**
- Make sure HTML files have Firebase CDN links:
```html
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js"></script>
<script src="js/firebase-config.js"></script>
```

### **Issue: "Permission denied" error**
- Go to Firestore > Rules
- Make sure you published the rules
- Make sure rules have `allow read, write: if true;`

### **Issue: No data showing**
- Check Browser Console (F12) for errors
- Submit a test ticket first
- Refresh the page
- Check Firestore Console to see if data exists

### **Issue: Files won't upload**
- Enable Cloud Storage (Step 6)
- Publish storage rules
- File size must be < 10MB

---

## 🚀 Your System is Now Live!

Once you complete all steps:

1. **Employee Portal Works**: Employees can submit tickets
2. **Admin Dashboard Works**: IT team sees all tickets in real-time
3. **Real-time Updates**: Dashboard updates automatically
4. **Analytics Work**: Charts show data breakdown
5. **File Uploads Work**: Attachments save to Cloud Storage

---

## 📱 Next: Use Your System

### **For Employees:**
1. Go to homepage
2. Click "Submit Ticket"
3. Fill form and submit
4. Go to "My Tickets" to track

### **For IT Team:**
1. Go to homepage
2. Click "Admin Dashboard"
3. See all incoming tickets
4. Click ticket to update status
5. Assign to team members

---

## 🎉 Everything Connected!

Your IT Ticketing System is now fully connected to Firestore and ready to use!

**Questions? Check:**
- Browser Console (F12) for error messages
- Firebase Console > Firestore for data
- Firebase Console > Storage for files

---

**Status: ✅ COMPLETE - Your system is live and connected to Firestore!**
