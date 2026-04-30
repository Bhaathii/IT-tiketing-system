// ==========================================
// AUTHENTICATION MODULE
// IT Ticketing System - Firebase Auth
// ==========================================

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null; // 'employee' or 'admin'
        this.initAuthStateListener();
    }

    /**
     * Initialize auth state listener to check if user is logged in
     */
    initAuthStateListener() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.determineUserRole(user);
                console.log('✅ User logged in:', user.email);
                console.log('👤 Role determined:', this.userRole);
            } else {
                this.currentUser = null;
                this.userRole = null;
                console.log('❌ User logged out');
            }
        });
    }

    /**
     * Determine if user is admin or employee.
     * Priority: check Firestore `users/{uid}.role` → fallback to hard-coded email list.
     * This makes hosted and localhost behavior consistent when Firestore has the authoritative role.
     */
    async determineUserRole(user) {
        const emailToCheck = (user.email || '').toLowerCase();

        // First, try to read role from Firestore users collection
        try {
            if (typeof db !== 'undefined') {
                const docRef = db.collection('users').doc(user.uid);
                const doc = await docRef.get();
                if (doc.exists) {
                    const data = doc.data() || {};
                    if (data.role && data.role.toLowerCase() === 'admin') {
                        this.userRole = 'admin';
                        console.log('🔒 ADMIN ROLE ASSIGNED (from Firestore):', emailToCheck);
                        return this.userRole;
                    }
                }
            }
        } catch (fireErr) {
            console.warn('⚠️ Could not read role from Firestore:', fireErr.message);
            // fall through to email list fallback
        }

        // Fallback: hard-coded admin emails (kept for quick dev access)
        const adminEmails = [
            'n@gmail.com',
            'a4@gmail.com',
            'nwnbhathiya@gmail.com',
            'a2@gmail.com',
            'a3@gmail.com',
            'admin1@gmail.com',
            'admin@company.com',
            'admin@it-ticketing-system-c637b.firebaseapp.com',
            'it-admin@company.com'
        ];

        if (adminEmails.includes(emailToCheck)) {
            this.userRole = 'admin';
            console.log('🔒 ADMIN ROLE ASSIGNED (from list):', emailToCheck);
        } else {
            this.userRole = 'employee';
            console.log('👥 EMPLOYEE ROLE ASSIGNED:', emailToCheck);
        }

        return this.userRole;
    }

    /**
     * Sign up new employee account
     */
    async signup(email, password, fullName) {
        try {
            // Create auth user
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update profile with name
            await user.updateProfile({ displayName: fullName });

            // Store user info in Firestore with merge option
            try {
                await db.collection('users').doc(user.uid).set({
                    uid: user.uid,
                    email: email,
                    fullName: fullName,
                    role: 'employee',
                    createdAt: new Date(),
                    lastLogin: new Date()
                }, { merge: true });
            } catch (firestoreError) {
                console.warn('⚠️ Firestore write warning (account still created):', firestoreError.message);
                // Don't fail signup if Firestore write fails - user account is still created
            }

            console.log('✅ User created successfully:', email);
            return { success: true, user: user };
        } catch (error) {
            console.error('❌ Signup error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Login with email and password
     */
    async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Update last login in Firestore (create if doesn't exist)
            try {
                await db.collection('users').doc(user.uid).set({
                    lastLogin: new Date()
                }, { merge: true });
            } catch (firestoreError) {
                console.warn('⚠️ Firestore update warning (login still successful):', firestoreError.message);
            }

            this.determineUserRole(user);
            console.log('✅ Login successful:', email);
            return { success: true, user: user, role: this.userRole };
        } catch (error) {
            console.error('❌ Login error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Logout current user
     */
    async logout() {
        try {
            console.log('🔓 Attempting logout...');
            await auth.signOut();
            console.log('✅ Logout successful - auth.signOut() completed');
            
            // Clear local state
            this.currentUser = null;
            this.userRole = null;
            
            // Small delay to ensure Firebase state is cleared
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('✅ Logout complete - ready to redirect');
            
            return { success: true };
        } catch (error) {
            console.error('❌ Logout error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Check if user is admin
     */
    isAdmin() {
        return this.userRole === 'admin';
    }

    /**
     * Get current user email
     */
    getCurrentUserEmail() {
        return this.currentUser ? this.currentUser.email : null;
    }

    /**
     * Get current user UID
     */
    getCurrentUserUID() {
        return this.currentUser ? this.currentUser.uid : null;
    }

    /**
     * Get current user's full name
     */
    getCurrentUserName() {
        return this.currentUser ? this.currentUser.displayName : null;
    }

    /**
     * Redirect to login if not authenticated
     */
    requireLogin(redirectUrl = 'login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    /**
     * Redirect to login if not admin
     */
    requireAdmin(redirectUrl = 'login.html') {
        if (!this.isAuthenticated() || !this.isAdmin()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    /**
     * Wait for auth to be ready (useful at page load)
     */
    async waitForAuth() {
        return new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged(async (user) => {
                // If user present, attempt to determine role (may read Firestore)
                if (user) {
                    try {
                        await this.determineUserRole(user);
                    } catch (e) {
                        console.warn('⚠️ determineUserRole error in waitForAuth:', e.message);
                    }
                }
                unsubscribe();
                resolve(user);
            });
        });
    }

    /**
     * Send password reset email to user
     */
    async sendPasswordResetEmail(email) {
        try {
            // Firebase will send a password reset email
            await auth.sendPasswordResetEmail(email);
            console.log('✅ Password reset email sent to:', email);
            return { success: true, message: 'Password reset email sent successfully. Check your inbox for a link.' };
        } catch (error) {
            console.error('❌ Password reset error:', error.message);
            // Handle specific Firebase errors
            if (error.code === 'auth/user-not-found') {
                return { success: false, error: 'No account found with this email address.' };
            } else if (error.code === 'auth/invalid-email') {
                return { success: false, error: 'Invalid email address.' };
            } else if (error.code === 'auth/too-many-requests') {
                return { success: false, error: 'Too many password reset attempts. Please try again later.' };
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * Verify password reset code
     */
    async verifyPasswordResetCode(oobCode) {
        try {
            const email = await auth.verifyPasswordResetCode(oobCode);
            console.log('✅ Password reset code verified for:', email);
            return { success: true, email: email };
        } catch (error) {
            console.error('❌ Code verification error:', error.message);
            if (error.code === 'auth/invalid-action-code') {
                return { success: false, error: 'This password reset link is invalid or has expired.' };
            } else if (error.code === 'auth/expired-action-code') {
                return { success: false, error: 'This password reset link has expired. Please request a new one.' };
            }
            return { success: false, error: 'Failed to verify reset code. Please try again.' };
        }
    }

    /**
     * Confirm password reset with new password
     */
    async confirmPasswordReset(oobCode, newPassword) {
        try {
            await auth.confirmPasswordReset(oobCode, newPassword);
            console.log('✅ Password reset successful');
            return { success: true, message: 'Password has been reset successfully. You can now login with your new password.' };
        } catch (error) {
            console.error('❌ Password confirmation error:', error.message);
            if (error.code === 'auth/invalid-action-code') {
                return { success: false, error: 'This password reset link is invalid or has expired.' };
            } else if (error.code === 'auth/expired-action-code') {
                return { success: false, error: 'This password reset link has expired. Please request a new one.' };
            } else if (error.code === 'auth/weak-password') {
                return { success: false, error: 'Password is too weak. Please choose a stronger password.' };
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * Change password for authenticated user
     */
    async changePassword(currentPassword, newPassword) {
        try {
            if (!this.currentUser) {
                return { success: false, error: 'No user is currently logged in.' };
            }

            // Re-authenticate user before changing password
            const email = this.currentUser.email;
            const credential = auth.EmailAuthProvider.credential(email, currentPassword);
            await this.currentUser.reauthenticateWithCredential(credential);

            // Change password
            await this.currentUser.updatePassword(newPassword);
            console.log('✅ Password changed successfully');
            return { success: true, message: 'Password changed successfully.' };
        } catch (error) {
            console.error('❌ Password change error:', error.message);
            if (error.code === 'auth/wrong-password') {
                return { success: false, error: 'Current password is incorrect.' };
            } else if (error.code === 'auth/weak-password') {
                return { success: false, error: 'New password is too weak.' };
            }
            return { success: false, error: error.message };
        }
    }
}

// Create global auth manager instance
const authManager = new AuthManager();
