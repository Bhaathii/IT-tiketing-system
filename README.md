# Internal IT Ticketing System - Documentation

## 📋 Overview

The Internal IT Ticketing System is a web-based platform designed to streamline technical support operations within organizations. It allows employees to submit IT issues and enables the IT team to manage, track, and resolve tickets efficiently.

---

## 🎯 Key Features

### **1. User Portal (Employee Interface)**
- **Easy Ticket Submission**: Simple form to report IT issues
- **Rich Information Capture**: 
  - Employee details and department
  - Issue title and detailed description
  - Equipment type and priority level
  - File attachments (screenshots, photos, documents)
  - Preferred contact method
  - Remote work status

### **2. Admin Dashboard (IT Team Interface)**
- **Ticket Management**: View all incoming tickets in a prioritized queue
- **Status Tracking**: Update ticket status (New, In-Progress, Resolved)
- **Assignment System**: Assign tickets to specific IT personnel
- **Real-time Updates**: Live notifications of new tickets
- **Analytics & Reports**: 
  - Priority breakdown
  - Department-wise ticket distribution
  - Common equipment issues
  - Resolution time metrics
  - Performance analytics

### **3. User Ticket Tracker**
- View all submitted tickets
- Track status in real-time
- Filter by status
- Print resolved tickets
- View detailed ticket information

### **4. Notification System**
- Automatic email notifications for new tickets
- Status update notifications
- Real-time dashboard updates

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Tailwind CSS, JavaScript (Vanilla)
- **Backend**: Firebase Firestore (NoSQL Database)
- **Storage**: Firebase Cloud Storage (File uploads)
- **Charts**: Chart.js (Analytics visualization)
- **Hosting**: Firebase Hosting (Recommended)

---

## 📁 Project Structure

```
IT Ticketing System/
├── index.html                  # Landing page
├── css/
│   └── styles.css             # Custom CSS styles
├── js/
│   ├── firebase-config.js     # Firebase configuration
│   ├── user-portal.js         # User form logic
│   ├── admin-dashboard.js     # Admin dashboard logic
│   └── user-tickets.js        # User ticket tracker logic
└── pages/
    ├── user-portal.html       # Ticket submission form
    ├── admin-dashboard.html   # Admin management panel
    └── user-tickets.html      # User ticket tracker
```

---

## 🚀 Setup Instructions

### **Step 1: Create a Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Enter project name: "it-ticketing-system"
4. Enable Google Analytics (optional)
5. Click "Create Project"

### **Step 2: Set Up Firestore Database**

1. In Firebase Console, go to **Firestore Database**
2. Click "Create Database"
3. Choose "Start in test mode" (for development)
4. Select a location (closest to your region)
5. Click "Enable"

### **Step 3: Set Up Cloud Storage**

1. In Firebase Console, go to **Storage**
2. Click "Get Started"
3. Start in test mode
4. Select location and click "Done"

### **Step 4: Get Firebase Credentials**

1. Go to **Project Settings** (gear icon)
2. Click "Your apps"
3. Click "</>" (Web)
4. Register app as "IT Ticketing System"
5. Copy the Firebase config object

### **Step 5: Update Configuration**

Update `js/firebase-config.js` with your Firebase credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### **Step 6: Set Firestore Security Rules**

In Firebase Console > Firestore > Rules, update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read/write tickets (for development)
    // In production, implement proper authentication
    match /tickets/{document=**} {
      allow read, write: if true;
    }
    match /notifications/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### **Step 7: Deploy**

#### **Option A: Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

#### **Option B: Local Testing**
```bash
# Python 3
python -m http.server 8000

# Or Node.js
npx http-server
```

Then visit `http://localhost:8000`

---

## 📖 Usage Guide

### **For Employees:**

1. **Submit Ticket**:
   - Click "Submit Ticket" on homepage
   - Fill in employee information
   - Describe the issue with details
   - Add priority level (Low, Medium, High, Urgent)
   - Attach screenshots if needed
   - Select preferred contact method
   - Click "Submit Ticket"

2. **Track Ticket**:
   - Go to "My Tickets" page
   - Enter your email address
   - View status of all tickets
   - Filter by status
   - Print resolved tickets

### **For IT Team:**

1. **Access Dashboard**:
   - Click "Admin Dashboard" on homepage
   - View all incoming tickets

2. **Manage Tickets**:
   - Click on any ticket to view details
   - Update status (New → In-Progress → Resolved)
   - Assign to team member
   - Add notes if needed
   - System automatically notifies users

3. **View Analytics**:
   - Priority breakdown chart
   - Department-wise distribution
   - Common equipment issues
   - Resolution time metrics
   - Performance dashboard

---

## 🔐 Security Considerations

### **Production Checklist:**

- [ ] Implement Firebase Authentication (Email/Password or OAuth)
- [ ] Set up proper Firestore security rules with authentication
- [ ] Enable HTTPS for all connections
- [ ] Implement rate limiting for API calls
- [ ] Add email verification for notifications
- [ ] Set up backup and disaster recovery
- [ ] Implement audit logging
- [ ] Add role-based access control (RBAC)
- [ ] Encrypt sensitive data
- [ ] Regular security audits

### **Example Auth Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tickets/{ticketId} {
      // Users can read their own tickets
      allow read: if request.auth.uid != null && 
                     request.auth.token.email == resource.data.email;
      // Users can create tickets
      allow create: if request.auth.uid != null;
      // Admins can read/update all
      allow read, update: if request.auth.token.admin == true;
    }
  }
}
```

---

## 📊 Database Schema

### **Tickets Collection**
```javascript
{
  id: "unique_id",
  employeeName: "John Doe",
  employeeId: "EMP-12345",
  department: "Finance",
  email: "john@company.com",
  contactNumber: "+94 77 123 4567",
  equipment: "Printer",
  priority: "High",
  issueTitle: "Printer not responding",
  issueDescription: "...",
  isRemote: false,
  contactMethod: "Email",
  status: "New", // New, In-Progress, Resolved
  assignedTo: "IT Team Member Name",
  attachments: [
    {
      name: "screenshot.png",
      url: "https://...",
      uploadedAt: timestamp
    }
  ],
  createdAt: timestamp,
  updatedAt: timestamp,
  resolvedAt: null
}
```

### **Notifications Collection**
```javascript
{
  id: "unique_id",
  type: "new_ticket", // new_ticket, ticket_update, ticket_resolved
  ticketId: "ticket_id",
  email: "john@company.com",
  employeeName: "John Doe",
  message: "Your ticket has been updated",
  read: false,
  createdAt: timestamp
}
```

---

## 🎨 Customization

### **Color Scheme**
The system uses Tailwind CSS. To customize colors, modify color classes:
- Primary Blue: `bg-blue-500` → `bg-indigo-500`
- Success Green: `bg-green-500` → `bg-emerald-500`
- Update in HTML files and CSS

### **Logo**
Replace the logo in navigation bar:
```html
<div class="text-2xl font-bold text-blue-400">
    <span class="text-white">IT</span>Ticket
</div>
```

### **Department List**
Edit the department options in `user-portal.html`:
```html
<option value="HR">Human Resources</option>
<option value="Finance">Finance</option>
<!-- Add/modify as needed -->
```

---

## 📧 Email Integration

### **Using Firebase Cloud Functions for Email:**

```javascript
// functions/index.js
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendTicketNotification = functions.firestore
  .document('tickets/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    await transporter.sendMail({
      from: 'support@company.com',
      to: data.email,
      subject: `Ticket Submitted: ${data.issueTitle}`,
      html: `
        <h2>Your Support Ticket</h2>
        <p>Ticket ID: ${context.params.docId}</p>
        <p>Status: New</p>
        <p>We'll get back to you soon!</p>
      `
    });
  });
```

---

## 🐛 Troubleshooting

### **Issue: Firebase not initializing**
- Check API key in `firebase-config.js`
- Ensure Firestore is enabled in Firebase Console
- Check browser console for specific errors

### **Issue: Files not uploading**
- Verify Cloud Storage is enabled
- Check storage rules in Firebase Console
- Ensure file size < 10MB

### **Issue: Tickets not showing in admin dashboard**
- Verify Firestore database exists and has data
- Check browser console for JavaScript errors
- Ensure real-time listener is active

### **Issue: Email notifications not working**
- Implement Cloud Functions for email (see above)
- Set up environment variables
- Test email configuration

---

## 📞 Support & Contact

For technical issues or improvements:
1. Check troubleshooting section
2. Review Firebase documentation
3. Check browser console for errors
4. Refer to project documentation

---

## 📝 Version History

- **v1.0.0** (April 2026): Initial release with core features
- Features: Ticket submission, admin dashboard, user tracker, analytics

---

## 📄 License

Internal use only. All rights reserved.

---

## 🎓 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

**Last Updated:** April 2026
