// js/appointments.js

function initAppointmentsPage() {
    console.log('Initializing Appointments Page...');
    const appointmentForm = document.getElementById('appointment-form');
    const appointmentDetailsContainer = document.getElementById('appointment-details');
    const doctorSelect = document.getElementById('doctor');

    // Populate doctor dropdown
    populateDoctorDropdown(doctorSelect);

    if (appointmentForm && appointmentDetailsContainer) {
        appointmentForm.addEventListener('submit', (event) => handleAppointmentSubmission(event, appointmentDetailsContainer));
    } else {
        console.error('Appointment form or details container not found.');
    }

    // Optionally display existing upcoming appointments (if needed on this page)
    // displayExistingAppointments();
}


function populateDoctorDropdown(selectElement) {
    if (!selectElement) return;

    // Add the default option first
    selectElement.innerHTML = '<option value="">Select a doctor</option>';

    // Use the doctorOptions created in dataService.js
    doctorOptions.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.value; // Use doctor ID as value
        option.textContent = doc.name;
        selectElement.appendChild(option);
    });
     console.log('Doctor dropdown populated.');
}


async function handleAppointmentSubmission(event, detailsContainer) {
    event.preventDefault();
    console.log('Handling appointment form submission...');
    const form = event.target;
    const formData = new FormData(form);

    // --- Basic Client-Side Validation ---
    let isValid = true;
    const requiredFields = ['appointment-type', 'specialty', 'doctor', 'date', 'time', 'fullname', 'email', 'phone'];
    const validationFeedback = {}; // Store messages

    requiredFields.forEach(id => {
        const input = form.querySelector(`#${id}`);
        const feedbackElement = form.querySelector(`#${id}-feedback`); // Assuming feedback divs have id like 'field-id-feedback'
        if (input && !input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
            if(feedbackElement) feedbackElement.textContent = 'This field is required.';
            validationFeedback[id] = 'This field is required.'; // Store error
        } else if (input) {
            input.classList.remove('is-invalid');
            if(feedbackElement) feedbackElement.textContent = ''; // Clear feedback
        }
    });

     // Email validation
    const emailInput = form.querySelector('#email');
    const emailFeedback = form.querySelector('#email-feedback');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput && emailInput.value && !emailPattern.test(emailInput.value)) {
        isValid = false;
        emailInput.classList.add('is-invalid');
        if(emailFeedback) emailFeedback.textContent = 'Please enter a valid email address.';
        validationFeedback['email'] = 'Invalid email format.';
    } else if (emailInput && emailInput.classList.contains('is-invalid') && emailPattern.test(emailInput.value)) {
        // Clear error if previously invalid but now okay (handles case where required error was shown first)
        emailInput.classList.remove('is-invalid');
         if(emailFeedback) emailFeedback.textContent = '';
    }

    if (!isValid) {
        console.warn('Form validation failed:', validationFeedback);
        showUserMessage('Please correct the errors in the form.', 'error');
        // Find first invalid input and focus it
        const firstInvalid = form.querySelector('.is-invalid');
        if(firstInvalid) firstInvalid.focus();
        return; // Stop submission
    }

    // --- Data Extraction ---
    const appointmentData = {
        type: formData.get('appointment-type'), // Use form element 'name' attributes if using FormData directly
        specialty: form.querySelector('#specialty').value, // Or get value directly
        doctorId: form.querySelector('#doctor').value,
        doctorName: form.querySelector('#doctor option:checked').textContent, // Get selected doctor name
        date: form.querySelector('#date').value,
        time: form.querySelector('#time').value,
        reason: form.querySelector('#reason').value,
        fullName: form.querySelector('#fullname').value,
        email: emailInput.value,
        phone: form.querySelector('#phone').value,
        insurance: form.querySelector('#insurance').value,
    };

    console.log('Appointment Data Submitted:', appointmentData);

    // --- Simulate Saving & Display ---
    const saveResult = dataService.saveAppointment(appointmentData); // Using direct call for localStorage demo

    if (saveResult.success) {
        displayAppointmentConfirmation(saveResult.appointment, detailsContainer);
        showUserMessage('Appointment booked successfully!', 'success');
        form.reset(); // Clear the form
        // Clear validation states
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    } else {
        showUserMessage(`Error booking appointment: ${saveResult.message}`, 'error');
    }
}

function displayAppointmentConfirmation(data, container) {
     console.log('Displaying appointment confirmation...');
    const formattedDate = formatDate(data.date); // Use helper function

    const detailsHTML = `
        <div class="appointment-confirmation">
            <h3><i class="fas fa-check-circle" aria-hidden="true"></i> Appointment Booked Successfully</h3>
            <div class="confirmation-details">
                <div class="detail-row">
                    <span class="detail-label">Patient Name:</span>
                    <span class="detail-value">${data.fullName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Appointment Type:</span>
                    <span class="detail-value">${data.type}</span>
                </div>
                 <div class="detail-row">
                    <span class="detail-label">Specialty:</span>
                    <span class="detail-value">${data.specialty}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Doctor:</span>
                    <span class="detail-value">${data.doctorName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${data.time}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Reason for Visit:</span>
                    <span class="detail-value">${data.reason || 'Not specified'}</span>
                </div>
                 <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${data.email}</span>
                </div>
                 <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${data.phone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Insurance:</span>
                    <span class="detail-value">${data.insurance || 'Not provided'}</span>
                </div>
                 <div class="detail-row">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value">${data.id}</span>
                </div>
            </div>
            <div class="appointment-actions">
                <button class="btn btn-secondary" onclick="window.print()">
                    <i class="fas fa-print" aria-hidden="true"></i> Print Details
                </button>
                <a href="prescriptions.html" class="btn btn-outline-primary">
                    <i class="fas fa-prescription" aria-hidden="true"></i> View Prescriptions
                </a>
            </div>
        </div>`;

    container.innerHTML = detailsHTML;
    container.classList.add('active'); // Show the container

    // Scroll to the details
    container.scrollIntoView({ behavior: 'smooth' });
}


// Optional: Function to display upcoming appointments (if needed on this page)
async function displayExistingAppointments() {
    const upcomingAppointmentsSection = document.querySelector('.existing-appointments'); // Add this section to appointments.html if needed
    if (!upcomingAppointmentsSection) return;

    const appointmentList = upcomingAppointmentsSection.querySelector('.appointment-list');
    if(!appointmentList) return;

    appointmentList.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i><p>Loading appointments...</p></div>'; // Loading state

    try {
        const appointments = await dataService.getAppointments(); // Fetch from localStorage via service
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingAppointments = appointments
            .filter(appt => new Date(appt.date) >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ASC

         appointmentList.innerHTML = ''; // Clear loading

        if (upcomingAppointments.length > 0) {
            upcomingAppointments.forEach(appointment => {
                const appointmentItem = document.createElement('div');
                appointmentItem.className = 'appointment-item card'; // Style as a card
                appointmentItem.innerHTML = `
                    <h4>${appointment.doctorName}</h4>
                    <p><strong>Specialty:</strong> ${appointment.specialty}</p>
                    <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
                    <p><strong>Time:</strong> ${appointment.time}</p>
                    <p><strong>Type:</strong> ${appointment.type}</p>
                    <p><small>Booking ID: ${appointment.id}</small></p>
                 `;
                appointmentList.appendChild(appointmentItem);
            });
        } else {
            appointmentList.innerHTML = '<p class="text-center text-muted">You have no upcoming appointments.</p>';
        }
         console.log('Existing appointments displayed.');
    } catch (error) {
        console.error("Error displaying existing appointments:", error);
        appointmentList.innerHTML = '<p class="text-center text-danger">Could not load appointments.</p>';
    }
}