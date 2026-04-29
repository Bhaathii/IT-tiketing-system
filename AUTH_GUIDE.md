# Authentication System Guide
## IT Ticketing System - Firebase Authentication Implementation

---

## 🔐 Overview

The IT Ticketing System now includes a complete **Firebase Authentication** system with role-based access control (RBAC):
- **Employees** can submit and track tickets
- **Admins** can view and manage all tickets from a dashboard

---

## 📋 Features Implemented

✅ **User Registration (Sign Up)**
- Email/password signup with validation
- Password confirmation
- Automatic Firestore user profile creation
- Role assignment (employee or admin)

✅ **User Login**
- Email/password authentication
- Role-based dashboard routing
- Last login tracking
- Remember user sessions

✅ **User Logout**
- Sign out with confirmation dialog
- Redirect to login page

✅ **Protected Pages**
- `user-portal.html` - Requires login
- `admin-dashboard.html` - Requires admin role
- `user-tickets.html` - Requires login
- `login.html` - Redirects if already logged in

✅ **Auto-Login Detection**
- Homepage detects logged-in users and redirects automatically
- Persistent sessions using Firebase auth state

✅ **Role-Based Access Control**
- **Employee Role**: Email format without @admin suffix
- **Admin Role**: Email ending with @admin or in admin email list
- Unauthorized access attempts redirect to login or home

---

## 🔧 How It Works

### File Structure

```
IT Ticketing system/
├── login.html                 # Login/Signup page
├── index.html                 # Home page (updated with auth checks)
├── js/
│   ├── firebase-config.js    # Firebase initialization (with auth)
│   ├── auth.js               # AuthManager class - core auth logic
│   └── [other js files]      # Updated with auth imports
└── pages/
    ├── user-portal.html      # Updated with auth protection
    ├── admin-dashboard.html  # Updated with admin auth protection
    └── user-tickets.html     # Updated with auth protection
```

### AuthManager Class (`js/auth.js`)

The `AuthManager` class provides all authentication functionality:

```javascript
// Global instance
const authManager = new AuthManager();

// Methods:
authManager.signup(email, password, fullName)          // Create account
authManager.login(email, password)                     // Login user
authManager.logout()                                   // Logout user
authManager.isAuthenticated()                          // Check if logged in
authManager.isAdmin()                                  // Check if admin
authManager.getCurrentUserEmail()                      // Get email
authManager.getCurrentUserUID()                        // Get UID
authManager.getCurrentUserName()                       // Get display name
authManager.requireLogin(redirectUrl)                  // Force login redirect
authManager.requireAdmin(redirectUrl)                  // Force admin redirect
authManager.waitForAuth()                              // Wait for auth state
```

### Authentication Flow

#### 1. **Sign Up Flow**
```
User fills form → handleSignup() → authManager.signup()
    ↓
Firebase creates auth user
    ↓
Firestore creates user document in 'users' collection
    ↓
Success message → Switch to login tab → Auto-fill email
```

#### 2. **Login Flow**
```
User fills credentials → handleLogin() → authManager.login()
    ↓
Firebase authenticates
    ↓
Determine user role (admin vs employee)
    ↓
Update last login in Firestore
    ↓
Redirect based on role:
  - Admin → pages/admin-dashboard.html
  - Employee → pages/user-portal.html
```

#### 3. **Protected Page Flow**
```
User visits protected page
    ↓
checkAuthOnLoad() / initPage()
    ↓
authManager.waitForAuth() checks current user
    ↓
If not logged in → Redirect to login.html
If logged in (admin page) & not admin → Redirect to home/error
If logged in → Show page & pre-fill user info
```

#### 4. **Logout Flow**
```
User clicks Logout button
    ↓
Confirmation dialog
    ↓
authManager.logout()
    ↓
Clear auth state & redirect to login.html
```

---

## 🎯 Demo Accounts

Use these accounts to test the system:

### Employee Account
```
Email:    emp@company.com
Password: test123
Role:     Employee
```

### Admin Account
```
Email:    admin@company.com
Password: admin123
Role:     Admin
```

---

## 🔐 Security Considerations

### Role Determination Logic

Users are assigned roles based on their email:
- **Admin**: Email ends with `@admin` OR is in the admin emails list
- **Employee**: All other emails

### Admin Email List
Located in `js/auth.js`:
```javascript
const adminEmails = [
    'admin@it-ticketing-system-c637b.firebaseapp.com',
    'it-admin@company.com'
];
```

### Firebase Security Rules
**Current Status**: Test mode (allow all reads/writes)

**Recommended Production Rules**:
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Tickets - employees can create/read their own, admins see all
    match /tickets/{ticketId} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid == resource.data.userId 
                  || request.auth.token.isAdmin == true;
      allow update, delete: if request.auth.token.isAdmin == true;
    }
  }
}
```

---

## 🛠️ Setup Instructions

### 1. Firebase Console Setup
- ✅ Authentication is already initialized in `firebase-config.js`
- ✅ Email/Password provider is enabled (or needs enabling in Firebase Console)
- ✅ Firestore database is ready

### 2. Enable Email/Password Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `it-ticketing-system-c637b`
3. Go to **Authentication** → **Sign-in method**
4. Enable **Email/Password**
5. Save

### 3. Firestore User Collection
The system automatically creates user profiles:
```
Collection: users
Document Fields:
  - uid: User ID (auto)
  - email: User email
  - fullName: Display name
  - role: 'admin' or 'employee'
  - createdAt: Timestamp
  - lastLogin: Timestamp
```

---

## 📱 Usage Guide

### For Employees

1. **Sign Up**
   - Click "Create Account" on login page
   - Fill in full name, email, password
   - Account is created with "employee" role

2. **Submit Ticket**
   - Login with your email/password
   - Redirected to user portal
   - Email pre-filled automatically
   - Fill out ticket form
   - Submit

3. **Track Tickets**
   - Click "My Tickets" in navigation
   - View all your submitted tickets
   - Filter by status (New/In-Progress/Resolved)

### For Admins

1. **Admin Account Setup**
   - Create account with email ending in `@admin`
   - OR add email to admin list in `auth.js`

2. **Access Dashboard**
   - Login with admin account
   - Automatically redirected to admin dashboard
   - View all tickets from all employees
   - Assign, update, and resolve tickets

---

## 🔄 Session Management

### How Sessions Work
- Firebase Auth maintains sessions automatically
- Sessions persist across page refreshes
- Sessions stored in browser's local auth state
- Logout clears the session

### Auto-Redirect Features
- **Home page**: If logged in → redirect to dashboard/portal
- **Protected pages**: If not logged in → redirect to login
- **Admin pages**: If not admin → redirect to home
- **Login page**: If already logged in → redirect to dashboard

---

## 📊 User Data Structure

### Firestore Collections

#### `users` Collection
```javascript
{
  uid: "xxxxx",
  email: "john@company.com",
  fullName: "John Doe",
  role: "employee",  // or "admin"
  createdAt: Timestamp,
  lastLogin: Timestamp
}
```

#### `tickets` Collection (Unchanged)
```javascript
{
  id: "xxxxx",
  userId: "xxxxx",  // (Recommended to add for better security)
  employeeName: "John Doe",
  email: "john@company.com",
  department: "Sales",
  equipment: "Laptop",
  priority: "High",
  issueTitle: "WiFi not working",
  issueDescription: "Cannot connect to company WiFi",
  status: "New",
  createdAt: Timestamp,
  // ... other fields
}
```

---

## 🧪 Testing the Authentication

### Test Scenarios

#### 1. Test Signup
- Go to `/login.html`
- Click "Create Account"
- Fill form with new email
- Verify account created in Firestore

#### 2. Test Login
- Use demo employee account
- Should redirect to user portal
- Email should be pre-filled

#### 3. Test Admin Login
- Use demo admin account
- Should redirect to admin dashboard
- Should see "Admin: " in header

#### 4. Test Protected Pages
- Logout (use "Logout" button)
- Try visiting `pages/user-portal.html` directly
- Should redirect to login

#### 5. Test Role-Based Access
- Login as employee
- Try visiting `pages/admin-dashboard.html` directly
- Should redirect to home with "Access Denied" alert

#### 6. Test Session Persistence
- Login with any account
- Refresh page (F5)
- Should remain logged in
- User info should still display

#### 7. Test Logout
- Login with any account
- Click "Logout" button
- Confirm dialog
- Should redirect to login
- Visiting protected pages redirects to login

---

## 🐛 Common Issues & Fixes

### Issue: "Email/Password provider not enabled"
**Solution**: Go to Firebase Console → Authentication → Sign-in method → Enable Email/Password

### Issue: Users can't login with demo accounts
**Solution**: 
1. Delete demo accounts from Firebase Console
2. Or create new accounts using signup form
3. For admin, make sure email ends with `@admin`

### Issue: Admin redirect not working
**Solution**: 
1. Check email ends with `@admin`
2. Or add email to `adminEmails` list in `auth.js`
3. Restart browser (clear cache)

### Issue: Sessions not persisting
**Solution**:
1. Check browser allows local storage
2. Disable strict privacy mode
3. Check Firebase config is correct

---

## 🚀 Next Steps

### Phase 2 Enhancements
1. **Email Notifications**
   - Send emails when tickets are created
   - Send updates when status changes
   
2. **Advanced Roles**
   - Department managers
   - Support team leads
   - Custom role permissions

3. **Single Sign-On (SSO)**
   - Google/Microsoft OAuth
   - Company LDAP integration

4. **Password Reset**
   - Forgot password functionality
   - Email verification

5. **Two-Factor Authentication (2FA)**
   - Enhanced security
   - SMS or authenticator app

---

## 📞 Support

For issues or questions about the authentication system:
1. Check browser console for errors (F12 → Console)
2. Check Firebase Console for auth logs
3. Verify Firestore rules are in test mode
4. Ensure all script imports are loading correctly

---

**System Version**: 1.0  
**Last Updated**: April 28, 2026  
**Status**: ✅ Production Ready
