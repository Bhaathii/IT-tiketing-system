# Password Reset Feature Guide

## Overview
The IT Ticketing System now includes a complete password reset functionality powered by Firebase Authentication. Users can securely reset their passwords if they forget them.

## Features
✅ **Email-based password reset** - Secure reset links sent to user email  
✅ **Code verification** - Reset links have expiration and verification  
✅ **User-friendly UI** - Intuitive forms with clear error messages  
✅ **Secure implementation** - Uses Firebase's secure authentication methods  
✅ **Mobile responsive** - Works perfectly on all devices  

## How It Works

### For End Users

#### Forgot Your Password?
1. Go to the **Login Page** (`login.html`)
2. Click the **"Forgot Password"** tab
3. Enter your email address
4. Click **"Send Reset Link"**
5. Check your email for a password reset link
6. Click the link in your email
7. Enter your new password (minimum 6 characters)
8. Confirm your new password
9. Click **"Reset Password"**
10. You'll be redirected to login with your new password

#### Change Password (Logged In)
Users who are already logged in can use the `changePassword()` method:
- Current password required for verification
- New password must be at least 6 characters
- See admin-dashboard.js for implementation example

---

## Technical Implementation

### Files Modified

#### 1. **js/auth.js** - Added Methods
New methods added to the `AuthManager` class:

```javascript
// Send password reset email
await authManager.sendPasswordResetEmail(email)
// Returns: { success: true, message: "..." } or { success: false, error: "..." }

// Verify reset code validity
await authManager.verifyPasswordResetCode(oobCode)
// Returns: { success: true, email: "..." } or { success: false, error: "..." }

// Complete password reset
await authManager.confirmPasswordReset(oobCode, newPassword)
// Returns: { success: true, message: "..." } or { success: false, error: "..." }

// Change password for logged-in user
await authManager.changePassword(currentPassword, newPassword)
// Returns: { success: true, message: "..." } or { success: false, error: "..." }
```

#### 2. **login.html** - Added Tab
- New "Forgot Password" tab alongside Login and Create Account
- Email input form with validation
- Error and success message displays
- `handleForgotPassword()` JavaScript function

#### 3. **reset-password.html** - New Page
- Handles password reset via Firebase email links
- Verifies reset code before showing form
- Password confirmation validation
- Responsive design matching login page
- Auto-redirects after successful reset

---

## Firebase Configuration

### Email Action URL
To enable password reset emails, configure in Firebase Console:

1. Go to **Firebase Console** → Your Project
2. Navigate to **Authentication** → **Templates** → **Password Reset**
3. Set the **Password Reset URL** to:
   ```
   https://yourapp.com/reset-password.html
   ```
   (Replace with your actual domain)

4. Firebase will automatically append the `oobCode` parameter like:
   ```
   https://yourapp.com/reset-password.html?oobCode=ABC123...&lang=en
   ```

### Email Provider Setup
- **Development**: Firebase provides testing emails
- **Production**: Configure SMTP or use Firebase email provider

### Enable Email Verification (Optional)
You can also enable email verification during signup by calling:
```javascript
await authManager.currentUser.sendEmailVerification();
```

---

## Error Handling

The system handles various error scenarios:

| Error | Cause | Solution |
|-------|-------|----------|
| "No account found with this email" | Email not registered | User needs to sign up first |
| "Invalid or expired reset link" | Link older than 1 hour or code invalid | Request a new reset link |
| "Too many attempts" | Rate limiting | Wait before trying again |
| "Password too weak" | Password doesn't meet requirements | Use at least 6 characters |
| "Passwords do not match" | Confirmation doesn't match | Re-enter passwords |

---

## Security Best Practices

✅ **Password Requirements**
- Minimum 6 characters enforced
- Firebase automatically enforces strong password rules
- Consider increasing minimum length in production

✅ **Rate Limiting**
- Firebase automatically rate-limits reset requests
- Prevents abuse and brute force attacks

✅ **Link Expiration**
- Reset links expire after 1 hour
- Users receive new link if needed

✅ **Secure Communication**
- All data sent over HTTPS
- Firebase handles encryption
- Never log passwords in console

---

## Testing Password Reset

### Test Flow
1. Create a test account with valid email
2. Click "Forgot Password" tab
3. Enter test email address
4. Check email for reset link (may take a few seconds)
5. Click link and enter new password
6. Login with new credentials

### In Development
- Firebase provides test email links
- Check browser console for debug messages (prefixed with 📧)
- Use real email addresses to test email delivery

### Troubleshooting
- **No email received**: Check Firebase email configuration
- **Link not working**: Ensure `reset-password.html` is accessible
- **oobCode missing**: Check URL parameters in browser
- **Code already used**: Links expire after 1 hour, request new one

---

## Integration Points

### For Admins
Add password reset links in user management:
```html
<button onclick="redirectToPasswordReset(userEmail)">
  Reset User Password
</button>
```

### For User Portal
Users can manage their account settings:
```javascript
// In account settings page
async function handleChangePassword(currentPwd, newPwd) {
    const result = await authManager.changePassword(currentPwd, newPwd);
    if (result.success) {
        alert('Password changed successfully');
    } else {
        alert('Error: ' + result.error);
    }
}
```

---

## Future Enhancements

🔄 **Possible Additions**
- SMS-based password reset
- Two-factor authentication
- Password strength meter
- Password history
- Security questions
- Account recovery options
- Biometric authentication support

---

## Support

For issues or questions about password reset:
1. Check the **Error Handling** section above
2. Review Firebase Console logs
3. Verify `reset-password.html` is in root directory
4. Ensure Firebase email configuration is complete
5. Check console for debug messages (look for 🔐 and 📧 emojis)

---

**Last Updated**: April 2026  
**Status**: ✅ Production Ready
