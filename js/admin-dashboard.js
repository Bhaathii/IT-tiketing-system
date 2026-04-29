// Admin Dashboard JavaScript
let allTickets = [];
let currentFilter = 'All';
let priorityChart = null;
let departmentChart = null;
let currentTicketId = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await loadTickets();
    setupRealtimeListener();
    initializeCharts();

    const exportButton = document.getElementById('exportExcelBtn');
    if (exportButton) {
        exportButton.addEventListener('click', exportToExcel);
    }
});

// Load all tickets
async function loadTickets() {
    try {
        const snapshot = await db.collection('tickets').orderBy('createdAt', 'desc').get();
        allTickets = [];
        
        snapshot.forEach(doc => {
            allTickets.push({
                id: doc.id,
                ...doc.data()
            });
        });

        updateDashboard();
        displayTickets();
    } catch (error) {
        console.error('Error loading tickets:', error);
    }
}

// Setup real-time listener
function setupRealtimeListener() {
    db.collection('tickets').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
        loadTickets();
    });
}

// Update dashboard statistics
function updateDashboard() {
    const total = allTickets.length;
    const newCount = allTickets.filter(t => t.status === 'New').length;
    const inProgressCount = allTickets.filter(t => t.status === 'In-Progress').length;
    const resolvedCount = allTickets.filter(t => t.status === 'Resolved').length;

    document.getElementById('totalTickets').textContent = total;
    document.getElementById('newTickets').textContent = newCount;
    document.getElementById('inProgressTickets').textContent = inProgressCount;
    document.getElementById('resolvedTickets').textContent = resolvedCount;

    // Priority counts
    const lowCount = allTickets.filter(t => t.priority === 'Low').length;
    const mediumCount = allTickets.filter(t => t.priority === 'Medium').length;
    const highCount = allTickets.filter(t => t.priority === 'High').length;
    const urgentCount = allTickets.filter(t => t.priority === 'Urgent').length;

    document.getElementById('lowCount').textContent = lowCount;
    document.getElementById('mediumCount').textContent = mediumCount;
    document.getElementById('highCount').textContent = highCount;
    document.getElementById('urgentCount').textContent = urgentCount;

    // Update charts
    updateCharts();

    // Calculate metrics
    calculateMetrics();
    
    // Department issues
    updateDepartmentIssues();
    
    // Equipment issues
    updateEquipmentIssues();
}

// Display tickets
function displayTickets() {
    const ticketsList = document.getElementById('ticketsList');
    const filteredTickets = currentFilter === 'All' 
        ? allTickets 
        : allTickets.filter(t => t.status === currentFilter);

    if (filteredTickets.length === 0) {
        ticketsList.innerHTML = '<div class="p-4 text-center text-gray-400">No tickets found</div>';
        return;
    }

    ticketsList.innerHTML = filteredTickets.map(ticket => `
        <div class="p-4 hover:bg-slate-700 cursor-pointer transition border-b border-slate-700 last:border-b-0" onclick="showTicketDetails('${ticket.id}')">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="font-bold text-white">${ticket.issueTitle}</h3>
                    <p class="text-sm text-gray-400">Ticket ID: ${ticket.id.substring(0, 8).toUpperCase()}</p>
                </div>
                <span class="px-2 py-1 rounded text-xs font-bold ${getPriorityClass(ticket.priority)}">
                    ${getPriorityIcon(ticket.priority)} ${ticket.priority}
                </span>
            </div>
            <div class="flex justify-between items-center text-sm">
                <span class="text-gray-400">${ticket.employeeName} • ${ticket.department}</span>
                <span class="px-2 py-1 rounded text-xs ${getStatusClass(ticket.status)}">
                    ${ticket.status}
                </span>
            </div>
            <div class="text-xs text-gray-500 mt-2">
                ${new Date(ticket.createdAt?.toDate?.() || ticket.createdAt).toLocaleString()}
            </div>
        </div>
    `).join('');
}

// Filter tickets
function filterTickets(status) {
    currentFilter = status;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active', 'bg-blue-600'));
    event.target.classList.add('active', 'bg-blue-600');
    displayTickets();
}

// Show ticket details
function showTicketDetails(ticketId) {
    currentTicketId = ticketId;
    const ticket = allTickets.find(t => t.id === ticketId);
    
    if (!ticket) return;

    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div class="space-y-3">
            <div>
                <label class="text-gray-400 text-sm">Ticket ID</label>
                <p class="font-bold">${ticketId.substring(0, 8).toUpperCase()}</p>
            </div>
            <div>
                <label class="text-gray-400 text-sm">Employee</label>
                <p class="font-bold">${ticket.employeeName} (${ticket.employeeId || 'N/A'})</p>
            </div>
            <div>
                <label class="text-gray-400 text-sm">Department</label>
                <p class="font-bold">${ticket.department}</p>
            </div>
            <div>
                <label class="text-gray-400 text-sm">Contact</label>
                <p class="font-bold">${ticket.email}</p>
            </div>
            <div>
                <label class="text-gray-400 text-sm">Issue Title</label>
                <p class="font-bold">${ticket.issueTitle}</p>
            </div>
            <div>
                <label class="text-gray-400 text-sm">Description</label>
                <p class="bg-slate-700 p-3 rounded text-sm">${ticket.issueDescription}</p>
            </div>
            <div>
                <label class="text-gray-400 text-sm">Equipment</label>
                <p class="font-bold">${ticket.equipment}</p>
            </div>
        </div>
    `;

    document.getElementById('statusSelect').value = ticket.status;
    document.getElementById('assigneeName').value = ticket.assignedTo || '';

    document.getElementById('ticketModal').classList.remove('hidden');
}

// Update ticket
async function updateTicket() {
    const status = document.getElementById('statusSelect').value;
    const assignedTo = document.getElementById('assigneeName').value;

    try {
        const updateData = {
            status: status,
            assignedTo: assignedTo,
            updatedAt: new Date()
        };

        if (status === 'Resolved') {
            updateData.resolvedAt = new Date();
        }

        await db.collection('tickets').doc(currentTicketId).update(updateData);

        // Send notification
        const ticket = allTickets.find(t => t.id === currentTicketId);
        if (ticket) {
            await db.collection('notifications').add({
                type: 'ticket_update',
                ticketId: currentTicketId,
                email: ticket.email,
                employeeName: ticket.employeeName,
                status: status,
                message: `Your ticket has been updated to ${status}`,
                createdAt: new Date(),
                read: false
            });
        }

        closeModal();
        await loadTickets();
    } catch (error) {
        console.error('Error updating ticket:', error);
        alert('Error updating ticket');
    }
}

// Close modal
function closeModal() {
    document.getElementById('ticketModal').classList.add('hidden');
    currentTicketId = null;
}

// Initialize charts
function initializeCharts() {
    // Priority Chart
    const priorityCtx = document.getElementById('priorityChart').getContext('2d');
    priorityChart = new Chart(priorityCtx, {
        type: 'doughnut',
        data: {
            labels: ['Low', 'Medium', 'High', 'Urgent'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: ['#22c55e', '#eab308', '#f97316', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });

    // Department Chart
    const departmentCtx = document.getElementById('departmentChart').getContext('2d');
    departmentChart = new Chart(departmentCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Tickets',
                data: [],
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#9ca3af'
                    }
                },
                x: {
                    ticks: {
                        color: '#9ca3af'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#9ca3af'
                    }
                }
            }
        }
    });
}

// Update charts
function updateCharts() {
    // Update priority chart
    const lowCount = allTickets.filter(t => t.priority === 'Low').length;
    const mediumCount = allTickets.filter(t => t.priority === 'Medium').length;
    const highCount = allTickets.filter(t => t.priority === 'High').length;
    const urgentCount = allTickets.filter(t => t.priority === 'Urgent').length;

    if (priorityChart) {
        priorityChart.data.datasets[0].data = [lowCount, mediumCount, highCount, urgentCount];
        priorityChart.update();
    }

    // Update department chart
    const departments = {};
    allTickets.forEach(ticket => {
        departments[ticket.department] = (departments[ticket.department] || 0) + 1;
    });

    if (departmentChart) {
        departmentChart.data.labels = Object.keys(departments);
        departmentChart.data.datasets[0].data = Object.values(departments);
        departmentChart.update();
    }
}

// Update department issues
function updateDepartmentIssues() {
    const departments = {};
    allTickets.forEach(ticket => {
        departments[ticket.department] = (departments[ticket.department] || 0) + 1;
    });

    const sorted = Object.entries(departments)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // This can be displayed elsewhere if needed
}

// Update equipment issues
function updateEquipmentIssues() {
    const equipment = {};
    allTickets.forEach(ticket => {
        equipment[ticket.equipment] = (equipment[ticket.equipment] || 0) + 1;
    });

    const sorted = Object.entries(equipment)
        .sort((a, b) => b[1] - a[1]);

    const equipmentDiv = document.getElementById('equipmentIssues');
    equipmentDiv.innerHTML = sorted.map(([eq, count]) => `
        <div class="p-3 bg-slate-700 rounded flex justify-between">
            <span>${eq}</span>
            <span class="font-bold text-cyan-400">${count} tickets</span>
        </div>
    `).join('');
}

// Calculate metrics
function calculateMetrics() {
    // Average resolution time
    const resolvedTickets = allTickets.filter(t => t.status === 'Resolved' && t.resolvedAt);
    let avgResolutionTime = 0;

    if (resolvedTickets.length > 0) {
        const totalTime = resolvedTickets.reduce((sum, t) => {
            const created = t.createdAt?.toDate?.() || new Date(t.createdAt);
            const resolved = t.resolvedAt?.toDate?.() || new Date(t.resolvedAt);
            return sum + (resolved - created);
        }, 0);
        avgResolutionTime = Math.round(totalTime / resolvedTickets.length / 3600000); // Convert to hours
    }

    document.getElementById('avgResolutionTime').textContent = avgResolutionTime + 'h';

    // Today's tickets
    const today = new Date().toDateString();
    const todayTickets = allTickets.filter(t => {
        const created = t.createdAt?.toDate?.() || new Date(t.createdAt);
        return created.toDateString() === today;
    }).length;

    document.getElementById('todayTickets').textContent = todayTickets;

    // Resolution rate
    const resolvedPercent = allTickets.length > 0 
        ? Math.round((resolvedTickets.length / allTickets.length) * 100) 
        : 0;

    document.getElementById('resolvedPercent').textContent = resolvedPercent + '%';

    // Overdue tickets (In-Progress for more than 24 hours)
    const now = new Date();
    const overdue = allTickets.filter(t => {
        if (t.status !== 'In-Progress') return false;
        const created = t.createdAt?.toDate?.() || new Date(t.createdAt);
        return (now - created) > 24 * 3600000;
    }).length;

    document.getElementById('overdue').textContent = overdue;
}

// Helper functions
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

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '../index.html';
    }
}

// Export tickets to Premium Beautiful Excel file with gradients
async function exportToExcel() {
    if (!allTickets || allTickets.length === 0) {
        alert('❌ No tickets to export!');
        return;
    }


window.exportToExcel = exportToExcel;
    try {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'IT Ticketing System';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('Tickets');
        const headers = ['Ticket ID', 'Employee Name', 'Employee ID', 'Department', 'Email', 'Phone', 'Equipment', 'Priority', 'Issue Title', 'Description', 'Remote', 'Contact Method', 'Status', 'Assigned To', 'Created', 'Updated', 'Resolved'];

        const headerRow = worksheet.addRow(headers);
        headerRow.height = 30;
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF0EA5E9' }
            };
            cell.font = {
                bold: true,
                size: 11,
                name: 'Calibri',
                color: { argb: 'FFFFFFFF' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = {
                left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } }
            };
        });

        allTickets.forEach((ticket, ticketIndex) => {
            const row = worksheet.addRow([
                ticket.id.substring(0, 8).toUpperCase(),
                ticket.employeeName || '',
                ticket.employeeId || '',
                ticket.department || '',
                ticket.email || '',
                ticket.contactNumber || '',
                ticket.equipment || '',
                ticket.priority || '',
                ticket.issueTitle || '',
                (ticket.issueDescription || '').substring(0, 100),
                ticket.isRemote ? 'Yes' : 'No',
                ticket.contactMethod || '',
                ticket.status || '',
                ticket.assignedTo || '',
                ticket.createdAt ? new Date(ticket.createdAt.toDate?.() || ticket.createdAt).toLocaleDateString() : '',
                ticket.updatedAt ? new Date(ticket.updatedAt.toDate?.() || ticket.updatedAt).toLocaleDateString() : '',
                ticket.resolvedAt ? new Date(ticket.resolvedAt.toDate?.() || ticket.resolvedAt).toLocaleDateString() : ''
            ]);

            row.height = 24;

            row.eachCell((cell, colNum) => {
                let bgColor = (ticketIndex + 1) % 2 === 0 ? 'FFEFF6FF' : 'FFFFFFFF';
                let fontColor = 'FF1F2937';
                let isBold = false;

                if (colNum === 8 && cell.value) {
                    isBold = true;
                    if (cell.value === 'Urgent') {
                        bgColor = 'FFFECACA';
                        fontColor = 'FF7F1D1D';
                    } else if (cell.value === 'High') {
                        bgColor = 'FFFED7AA';
                        fontColor = 'FF78350F';
                    } else if (cell.value === 'Medium') {
                        bgColor = 'FFFEF08A';
                        fontColor = 'FF713F12';
                    } else if (cell.value === 'Low') {
                        bgColor = 'FFBFDBFE';
                        fontColor = 'FF1E3A8A';
                    }
                }

                if (colNum === 13 && cell.value) {
                    isBold = true;
                    if (cell.value === 'Resolved') {
                        bgColor = 'FFC6F6D5';
                        fontColor = 'FF22543D';
                    } else if (cell.value === 'In-Progress') {
                        bgColor = 'FFFEFCBF';
                        fontColor = 'FF744210';
                    } else if (cell.value === 'New') {
                        bgColor = 'FFFFE0E6';
                        fontColor = 'FF742A2A';
                    }
                }

                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: bgColor }
                };
                cell.font = {
                    bold: isBold,
                    size: 11,
                    name: 'Calibri',
                    color: { argb: fontColor }
                };
                cell.alignment = {
                    horizontal: (colNum === 8 || colNum === 13) ? 'center' : 'left',
                    vertical: 'middle',
                    wrapText: true
                };
                cell.border = {
                    left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                    bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } }
                };
            });
        });

        worksheet.columns = [
            { width: 14 }, { width: 18 }, { width: 14 }, { width: 16 }, { width: 24 }, { width: 16 }, { width: 14 },
            { width: 12 }, { width: 24 }, { width: 36 }, { width: 10 }, { width: 16 }, { width: 14 }, { width: 18 },
            { width: 14 }, { width: 14 }, { width: 14 }
        ];

        worksheet.views = [{ state: 'frozen', ySplit: 1 }];

        const buffer = await workbook.xlsx.writeBuffer({ useStyles: true, useSharedStrings: true });
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        link.href = url;
        link.download = `IT_Tickets_Report_${timestamp}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        alert(`✨ Premium Beautiful Excel Report Created!\n\nFile: IT_Tickets_Report_${timestamp}.xlsx\n\n🎨 Features:\n• 📋 ${allTickets.length} tickets with color gradients\n• 🌈 Beautiful pastel gradient colors\n• 🎯 Color-coded status & priority\n• 🔒 Frozen headers\n• 📐 Enhanced spacing & borders\n• ✨ Professional gradient styling`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('❌ Error creating Excel file: ' + error.message);
    }
}

window.exportToExcel = exportToExcel;

console.log("Admin Dashboard loaded");
