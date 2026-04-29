// User Tickets JavaScript
let allUserTickets = [];
let currentFilter = 'All';

// Initialize (for unauthenticated / standalone usage)
document.addEventListener('DOMContentLoaded', async () => {
    // If an authManager exists and there's a logged-in user, do nothing here.
    // The protected page (`pages/user-tickets.html`) uses its own auth check
    // and will call `loadUserTickets()` with the authenticated user's email.
    if (typeof authManager !== 'undefined') {
        try {
            const user = await authManager.waitForAuth();
            if (user) {
                // Authenticated context — avoid loading based on URL/localStorage
                return;
            }
        } catch (e) {
            // If auth check fails, continue with non-auth flow below
            console.warn('Auth check failed in user-tickets init:', e.message);
        }
    }

    // Non-authenticated or standalone usage: Get email from query parameter or ask user
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email') || localStorage.getItem('userEmail');
    
    if (email) {
        localStorage.setItem('userEmail', email);
        await loadUserTickets(email);
    } else {
        // Show email input modal
        showEmailModal();
    }
});

// Show email input modal
function showEmailModal() {
    const email = prompt('Please enter your email address to view your tickets:');
    if (email) {
        localStorage.setItem('userEmail', email);
        location.reload();
    }
}

// Load user's tickets
async function loadUserTickets(email) {
    try {
        const snapshot = await db.collection('tickets')
            .where('email', '==', email)
            .orderBy('createdAt', 'desc')
            .get();

        allUserTickets = [];
        snapshot.forEach(doc => {
            allUserTickets.push({
                id: doc.id,
                ...doc.data()
            });
        });

        displayTickets();
        setupRealtimeListener(email);
    } catch (error) {
        console.error('Error loading tickets:', error);
        document.getElementById('ticketsContainer').innerHTML = `
            <div class="col-span-full text-center text-red-400 py-12">
                <p class="text-lg">Error loading tickets: ${error.message}</p>
            </div>
        `;
    }
}

// Setup real-time listener
function setupRealtimeListener(email) {
    db.collection('tickets')
        .where('email', '==', email)
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            allUserTickets = [];
            snapshot.forEach(doc => {
                allUserTickets.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            displayTickets();
        });
}

// Display tickets
function displayTickets() {
    const container = document.getElementById('ticketsContainer');
    const filteredTickets = currentFilter === 'All'
        ? allUserTickets
        : allUserTickets.filter(t => t.status === currentFilter);

    if (filteredTickets.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center text-gray-400 py-12">
                <p class="text-lg">No ${currentFilter !== 'All' ? currentFilter.toLowerCase() : ''} tickets found</p>
                <a href="user-portal.html" class="text-blue-400 hover:text-blue-300 mt-4 inline-block">Submit a new ticket</a>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredTickets.map(ticket => `
        <div class="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition cursor-pointer" onclick="showTicketDetails('${ticket.id}')">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <div class="text-xs text-gray-400 mb-2">Ticket ID: ${ticket.id.substring(0, 8).toUpperCase()}</div>
                    <h3 class="font-bold text-lg text-white">${ticket.issueTitle}</h3>
                </div>
                <span class="px-3 py-1 rounded text-xs font-bold ${getPriorityClass(ticket.priority)}">
                    ${getPriorityIcon(ticket.priority)} ${ticket.priority}
                </span>
            </div>

            <div class="bg-slate-700 p-3 rounded mb-4 text-sm max-h-20 overflow-hidden text-gray-300">
                ${ticket.issueDescription.substring(0, 100)}${ticket.issueDescription.length > 100 ? '...' : ''}
            </div>

            <div class="space-y-2 mb-4 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-400">Status:</span>
                    <span class="px-2 py-1 rounded text-xs font-bold ${getStatusClass(ticket.status)}">
                        ${ticket.status}
                    </span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Equipment:</span>
                    <span class="text-gray-300">${ticket.equipment}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-400">Submitted:</span>
                    <span class="text-gray-300">${formatDate(ticket.createdAt)}</span>
                </div>
                ${ticket.assignedTo ? `
                    <div class="flex justify-between">
                        <span class="text-gray-400">Assigned To:</span>
                        <span class="text-gray-300">${ticket.assignedTo}</span>
                    </div>
                ` : ''}
            </div>

            <div class="flex gap-2">
                <button onclick="event.stopPropagation(); showTicketDetails('${ticket.id}')" class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition">
                    View Details
                </button>
                ${ticket.status === 'Resolved' ? `
                    <button onclick="event.stopPropagation(); printTicket('${ticket.id}')" class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition">
                        Print
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Show ticket details
function showTicketDetails(ticketId) {
    const ticket = allUserTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const modalContent = document.getElementById('modalContent');
    const resolutionTime = ticket.resolvedAt 
        ? calculateResolutionTime(ticket.createdAt, ticket.resolvedAt)
        : 'N/A';

    modalContent.innerHTML = `
        <div class="space-y-4">
            <div class="bg-slate-700 p-4 rounded">
                <div class="text-sm text-gray-400 mb-1">Ticket ID</div>
                <div class="font-bold text-lg text-blue-400">${ticketId.substring(0, 8).toUpperCase()}</div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <div class="text-sm text-gray-400 mb-1">Status</div>
                    <span class="px-3 py-1 rounded text-xs font-bold ${getStatusClass(ticket.status)}">
                        ${ticket.status}
                    </span>
                </div>
                <div>
                    <div class="text-sm text-gray-400 mb-1">Priority</div>
                    <span class="px-3 py-1 rounded text-xs font-bold ${getPriorityClass(ticket.priority)}">
                        ${ticket.priority}
                    </span>
                </div>
            </div>

            <div>
                <div class="text-sm text-gray-400 mb-1">Issue Title</div>
                <div class="font-bold">${ticket.issueTitle}</div>
            </div>

            <div>
                <div class="text-sm text-gray-400 mb-1">Description</div>
                <div class="bg-slate-700 p-3 rounded text-sm">${ticket.issueDescription}</div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <div class="text-sm text-gray-400 mb-1">Equipment</div>
                    <div class="font-bold">${ticket.equipment}</div>
                </div>
                <div>
                    <div class="text-sm text-gray-400 mb-1">Department</div>
                    <div class="font-bold">${ticket.department}</div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <div class="text-sm text-gray-400 mb-1">Submitted</div>
                    <div class="font-bold text-sm">${formatDateTime(ticket.createdAt)}</div>
                </div>
                <div>
                    <div class="text-sm text-gray-400 mb-1">Resolution Time</div>
                    <div class="font-bold text-sm">${resolutionTime}</div>
                </div>
            </div>

            ${ticket.assignedTo ? `
                <div>
                    <div class="text-sm text-gray-400 mb-1">Assigned To</div>
                    <div class="font-bold">${ticket.assignedTo}</div>
                </div>
            ` : ''}

        </div>
    `;

    document.getElementById('ticketModal').classList.remove('hidden');
}

// Filter tickets
function filterTickets(status) {
    currentFilter = status;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-600');
        btn.classList.add('bg-slate-600', 'hover:bg-slate-500');
    });
    event.target.classList.add('active', 'bg-blue-600');
    event.target.classList.remove('bg-slate-600', 'hover:bg-slate-500');
    displayTickets();
}

// Close modal
function closeModal() {
    document.getElementById('ticketModal').classList.add('hidden');
}

// Print ticket
function printTicket(ticketId) {
    const ticket = allUserTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ticket #${ticketId.substring(0, 8).toUpperCase()}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { border-bottom: 2px solid #333; margin-bottom: 20px; padding-bottom: 10px; }
                .field { margin-bottom: 10px; }
                .label { font-weight: bold; color: #333; }
                .value { color: #666; margin-top: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Support Ticket Report</h1>
                <p>Ticket ID: ${ticketId.substring(0, 8).toUpperCase()}</p>
            </div>
            <div class="field">
                <div class="label">Status</div>
                <div class="value">${ticket.status}</div>
            </div>
            <div class="field">
                <div class="label">Priority</div>
                <div class="value">${ticket.priority}</div>
            </div>
            <div class="field">
                <div class="label">Issue Title</div>
                <div class="value">${ticket.issueTitle}</div>
            </div>
            <div class="field">
                <div class="label">Description</div>
                <div class="value">${ticket.issueDescription}</div>
            </div>
            <div class="field">
                <div class="label">Equipment</div>
                <div class="value">${ticket.equipment}</div>
            </div>
            <div class="field">
                <div class="label">Department</div>
                <div class="value">${ticket.department}</div>
            </div>
            <div class="field">
                <div class="label">Submitted</div>
                <div class="value">${formatDateTime(ticket.createdAt)}</div>
            </div>
            <div class="field">
                <div class="label">Assigned To</div>
                <div class="value">${ticket.assignedTo || 'N/A'}</div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Helper Functions
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString();
}

function formatDateTime(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp?.toDate?.() || new Date(timestamp);
    return date.toLocaleString();
}

function calculateResolutionTime(created, resolved) {
    const createdDate = created?.toDate?.() || new Date(created);
    const resolvedDate = resolved?.toDate?.() || new Date(resolved);
    const diffMs = resolvedDate - createdDate;
    const diffHours = Math.round(diffMs / 3600000);
    
    if (diffHours < 24) {
        return diffHours + ' hours';
    } else {
        const diffDays = Math.round(diffHours / 24);
        return diffDays + ' days';
    }
}

function getPriorityClass(priority) {
    const classes = {
        'Low': 'bg-green-600 text-white',
        'Medium': 'bg-yellow-600 text-white',
        'High': 'bg-orange-600 text-white',
        'Urgent': 'bg-red-600 text-white'
    };
    return classes[priority] || 'bg-gray-600 text-white';
}

function getPriorityIcon(priority) {
    const icons = {
        'Low': '🟢',
        'Medium': '🟡',
        'High': '🔴',
        'Urgent': '🚨'
    };
    return icons[priority] || '⚪';
}

function getStatusClass(status) {
    const classes = {
        'New': 'bg-blue-700 text-white',
        'In-Progress': 'bg-yellow-700 text-white',
        'Resolved': 'bg-green-700 text-white'
    };
    return classes[status] || 'bg-gray-700 text-white';
}

console.log("User Tickets page loaded");
