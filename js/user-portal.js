// User Portal JavaScript - Cloud Storage Disabled
// File uploads removed - using Firestore only

// DOM Elements
const ticketForm = document.getElementById('ticketForm');
const formMessage = document.getElementById('formMessage');

// File attachments functionality removed - Cloud Storage disabled
// Users can email files to IT support instead

// Form Submission
ticketForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const ticketData = {
        employeeName: document.getElementById('employeeName').value,
        employeeId: document.getElementById('employeeId').value,
        department: document.getElementById('department').value,
        contactNumber: document.getElementById('contactNumber').value,
        email: document.getElementById('email').value,
        equipment: document.getElementById('equipment').value,
        priority: document.getElementById('priority').value,
        issueTitle: document.getElementById('issueTitle').value,
        issueDescription: document.getElementById('issueDescription').value,
        isRemote: document.getElementById('remote').checked,
        contactMethod: document.querySelector('input[name="contactMethod"]:checked').value,
        status: 'New',
        createdAt: new Date(),
        resolvedAt: null,
        assignedTo: null,
        attachments: []
    };

    try {
        // Show loading state
        const submitBtn = ticketForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        // File attachments disabled - Cloud Storage not available
        ticketData.attachments = [];

        // Save ticket to Firestore
        const docRef = await db.collection('tickets').add(ticketData);
        
        // Send notification to IT team
        await db.collection('notifications').add({
            type: 'new_ticket',
            ticketId: docRef.id,
            employeeName: ticketData.employeeName,
            email: ticketData.email,
            issueTitle: ticketData.issueTitle,
            priority: ticketData.priority,
            createdAt: new Date(),
            read: false
        });

        // Success message
        showMessage(`Ticket #${docRef.id.substring(0, 8).toUpperCase()} submitted successfully! We'll get back to you soon.`, 'success');
        
        // Reset form
        ticketForm.reset();

        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = 'user-tickets.html?ticketId=' + docRef.id;
        }, 2000);

    } catch (error) {
        console.error('Error submitting ticket:', error);
        showMessage('Error submitting ticket: ' + error.message, 'error');
    } finally {
        const submitBtn = ticketForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Ticket';
    }
});

function showMessage(message, type) {
    formMessage.className = `p-4 rounded-lg ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`;
    formMessage.textContent = message;
    formMessage.classList.remove('hidden');
    
    if (type === 'success') {
        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 3000);
    }
}

// Initialize
console.log("User Portal loaded");
