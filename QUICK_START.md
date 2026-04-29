# Quick Start Guide - IT Ticketing System

## 🚀 Get Started in 5 Minutes

### **What You'll Need:**
- Google Account
- Web Browser
- Text Editor (VS Code, Notepad, etc.)

---

## ⚡ Super Quick Setup

### **1️⃣ Get Firebase Credentials (2 min)**

1. Go to → [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** → name it `it-ticketing`
3. Click **"Continue"** → Click **"Create project"** → Wait
4. Click **"</>"** to add web app
5. Enter app name → Click **"Register app"**
6. **COPY** the config (especially the whole JavaScript object)

### **2️⃣ Update Configuration (1 min)**

1. Open file: `js/firebase-config.js`
2. Replace everything between the `{}` in `const firebaseConfig = {...}`
3. Paste YOUR Firebase config values
4. Save file

**Your config.js should look like:**
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",        // ← Replace these
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc"
};
// Rest stays the same
```

### **3️⃣ Enable Firestore & Storage (1 min)**

Back in **Firebase Console**:

1. Click **"Firestore Database"** on the left
2. Click **"Create database"**
3. Select location → Click **"Next"**
4. Choose **"Start in test mode"** → Click **"Enable"**

Now, **Enable Storage**:

1. Click **"Storage"** on the left  
2. Click **"Get started"** → Click **"Next"**
3. Same location → Click **"Done"**

### **4️⃣ Update Security Rules (1 min)**

In **Firebase Console** > **Firestore** > **Rules** tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tickets/{document=**} {
      allow read, write: if true;
    }
    match /notifications/{document=**} {
      allow read, write: if true;
    }
  }
}
```

Click **"Publish"**

In **Firebase Console** > **Storage** > **Rules** tab:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /attachments/{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

Click **"Publish"**

### **5️⃣ Test Your System (1 min)**

**Option A: Online Testing**
1. Double-click `index.html` to open in browser
2. Click "Submit Ticket"
3. Fill form and submit
4. Click "Admin Dashboard"
5. See your ticket appear! ✅

**Option B: Local Server**
```bash
python -m http.server 8000
```
Then visit: `http://localhost:8000`

---

## 🎯 Features Overview

### **👤 User Portal**
- Submit tickets with full details
- Attach screenshots/files
- Choose priority and contact method
- View ticket status

### **🛡️ Admin Dashboard**
- See all tickets in real-time
- Update status & assign to team
- View priority breakdown
- See department-wise issues
- Track resolution times
- Performance analytics

### **📊 Ticket Tracker**
- Employees track their tickets
- Filter by status
- Print resolved tickets
- View full details

---

## 📁 File Structure

```
Your Project/
├── index.html                    ← Open this first!
├── css/
│   └── styles.css
├── js/
│   ├── firebase-config.js        ← UPDATE THIS WITH YOUR CONFIG
│   ├── user-portal.js
│   ├── admin-dashboard.js
│   └── user-tickets.js
├── pages/
│   ├── user-portal.html
│   ├── admin-dashboard.html
│   └── user-tickets.html
├── README.md                     ← Full documentation
├── FIREBASE_SETUP.md            ← Detailed Firebase guide
└── QUICK_START.md               ← This file
```

---

## 🔄 Workflow

### **Employee Workflow:**
1. Click "Submit Ticket" on homepage
2. Fill in issue details
3. Attach files if needed
4. Submit
5. Get ticket ID
6. Check status anytime on "My Tickets"

### **IT Team Workflow:**
1. Click "Admin Dashboard"
2. See all new tickets
3. Click ticket to view full details
4. Update status to "In-Progress"
5. Assign to team member
6. When done, mark "Resolved"
7. Employee gets notification

---

## 🎨 Customization Quick Tips

### **Change Colors**
In HTML files, find and replace:
- `bg-blue-500` → `bg-indigo-500`
- `bg-green-500` → `bg-emerald-500`

### **Change Logo**
In `index.html`, find:
```html
<div class="text-2xl font-bold text-blue-400">
    <span class="text-white">IT</span>Ticket
</div>
```

Change to your organization name

### **Add Department**
In `user-portal.html`, find the select for department and add:
```html
<option value="YourDept">Your Department Name</option>
```

---

## ✅ Testing Checklist

- [ ] index.html opens in browser
- [ ] Firebase config is updated with YOUR keys
- [ ] Can submit a ticket
- [ ] Ticket appears in admin dashboard
- [ ] Can update ticket status
- [ ] Can see analytics charts
- [ ] File upload works
- [ ] Email field accepts input

---

## 🚀 Production Deployment

### **Firebase Hosting (Easiest)**
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

### **Any Web Host**
- Upload all files via FTP
- Same folder structure
- Must have internet access for Firebase

### **Netlify/Vercel**
- Drag & drop your folder
- Auto-deploys on changes

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Firebase error | Check firebase-config.js has YOUR keys |
| No tickets showing | Submit a test ticket first |
| Can't upload files | Enable Storage in Firebase |
| Admin dashboard empty | Check Firestore security rules are set |
| Form won't submit | Check browser console (F12) for errors |

---

## 📞 Need Help?

1. Check **Firebase_SETUP.md** for detailed guide
2. Open browser Console (F12) to see errors
3. Check Firebase Console for database content
4. Verify all security rules are published

---

## 🎓 Next Learning Steps

1. Read **README.md** for full documentation
2. Check **FIREBASE_SETUP.md** for detailed Firebase config
3. Learn about security rules for production
4. Add authentication
5. Deploy to Firebase Hosting

---

## 📊 What Happens When You Submit a Ticket?

```
User Submits Ticket
        ↓
Data saved to Firestore
        ↓
IT team notified
        ↓
Admin Dashboard updates live
        ↓
User can track status
        ↓
IT team updates status
        ↓
User notified of update
        ↓
When resolved, both get notification
```

---

## 🎉 Congratulations!

You now have a fully functional IT Ticketing System!

**Next:** Customize it for your organization and start using it!

---

**Quick Links:**
- 🔗 [Firebase Console](https://console.firebase.google.com/)
- 📖 [Full README](README.md)
- 🔧 [Firebase Setup Details](FIREBASE_SETUP.md)
- 🎨 [Tailwind CSS Docs](https://tailwindcss.com/)

---

**Version:** 1.0.0  
**Last Updated:** April 2026
