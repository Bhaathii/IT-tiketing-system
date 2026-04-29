// app.js - Main Application Logic (For future enhancement)

// Global application state
const app = {
    currentUser: null,
    tickets: [],
    notifications: [],
    settings: {
        theme: 'dark',
        language: 'en',
        autoRefresh: true,
        refreshInterval: 5000
    }
};

// Application initialization
function initializeApp() {
    console.log('Initializing Application...');
    loadSettings();
    setupEventListeners();
    console.log('Application initialized');
}

// Load application settings
function loadSettings() {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
        app.settings = JSON.parse(savedSettings);
    }
}

// Save application settings
function saveSettings() {
    localStorage.setItem('appSettings', JSON.stringify(app.settings));
}

// Setup global event listeners
function setupEventListeners() {
    // Auto-logout on inactivity
    let inactivityTimeout;
    
    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(() => {
            console.log('User inactive - logging out');
            // Logout logic here
        }, 30 * 60 * 1000); // 30 minutes
    };

    document.addEventListener('click', resetInactivityTimer);
    document.addEventListener('keypress', resetInactivityTimer);
}

// Notification handler
function showNotification(message, type = 'info') {
    const notification = {
        id: Date.now(),
        message: message,
        type: type,
        timestamp: new Date()
    };
    
    app.notifications.push(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        app.notifications = app.notifications.filter(n => n.id !== notification.id);
    }, 5000);
}

// Error handler
function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    showNotification(`Error: ${error.message}`, 'error');
}

// Success handler
function handleSuccess(message) {
    console.log('Success:', message);
    showNotification(message, 'success');
}

// API Response Handler
function handleApiResponse(response, action) {
    if (response.ok) {
        handleSuccess(`${action} completed successfully`);
    } else {
        handleError(new Error(response.statusText), action);
    }
}

// Format dates consistently
function formatDate(date, format = 'short') {
    if (!date) return 'N/A';
    
    const d = date instanceof Date ? date : new Date(date);
    
    switch(format) {
        case 'short':
            return d.toLocaleDateString();
        case 'long':
            return d.toLocaleString();
        case 'time':
            return d.toLocaleTimeString();
        default:
            return d.toLocaleString();
    }
}

// Validate email
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Validate phone number
function validatePhoneNumber(phone) {
    const regex = /^[\d\s\-\+\(\)]+$/;
    return regex.test(phone) && phone.length >= 10;
}

// Calculate time difference
function getTimeDifference(start, end) {
    const diff = new Date(end) - new Date(start);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
}

// Export statistics
async function exportStatistics() {
    try {
        const stats = await db.collection('tickets').get();
        const data = [];
        
        stats.forEach(doc => {
            data.push(doc.data());
        });
        
        const csv = convertToCSV(data);
        downloadCSV(csv, 'tickets-export.csv');
    } catch (error) {
        handleError(error, 'Export Statistics');
    }
}

// Convert data to CSV
function convertToCSV(data) {
    const headers = Object.keys(data[0] || {});
    const csv = [headers.join(',')];
    
    data.forEach(item => {
        const values = headers.map(header => {
            const value = item[header];
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`;
            }
            return value || '';
        });
        csv.push(values.join(','));
    });
    
    return csv.join('\n');
}

// Download CSV
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Local Storage Helper
const Storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Storage error:', error);
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage error:', error);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage error:', error);
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Storage error:', error);
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

console.log('App.js loaded');
