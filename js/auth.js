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
     * Determine if user is admin or employee
     * Admins have email in a specific list
     */
    determineUserRole(user) {
        const adminEmails = [
            'admin@company.com',
            'admin@it-ticketing-system-c637b.firebaseapp.com',
            'it-admin@company.com'
        ];
        const emailToCheck = user.email.toLowerCase();
        if (adminEmails.includes(emailToCheck)) {
            this.userRole = 'admin';
            console.log('🔒 ADMIN ROLE ASSIGNED:', emailToCheck);
        } else {
            this.userRole = 'employee';
            console.log('👥 EMPLOYEE ROLE ASSIGNED:', emailToCheck);
        }
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

            // Update last login in Firestore
            await db.collection('users').doc(user.uid).update({
                lastLogin: new Date()
            });

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
            const unsubscribe = auth.onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user);
            });
        });
    }
}

// Create global auth manager instance
const authManager = new AuthManager();
