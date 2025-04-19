// script.js - Complete rewrite for appointment booking functionality

document.addEventListener('DOMContentLoaded', function() {
    // Get the appointment form element
    const appointmentForm = document.getElementById('appointment-form');
    
    // Get the appointment details container
    const appointmentDetails = document.getElementById('appointment-details');
    
    // Add event listener to the form submission
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentSubmission);
    }
    
    // Function to handle form submission
    function handleAppointmentSubmission(event) {
        // Prevent the default form submission behavior
        event.preventDefault();
        
        // Get all form values
        const appointmentType = document.getElementById('appointment-type').value;
        const specialty = document.getElementById('specialty').value;
        const doctor = document.getElementById('doctor').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const reason = document.getElementById('reason').value;
        const fullName = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const insurance = document.getElementById('insurance').value;
        
        // Format the date for better display
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Create HTML for displaying appointment details
        const detailsHTML = `
            <div class="appointment-confirmation">
                <h3><i class="fas fa-check-circle"></i> Appointment Booked Successfully</h3>
                <div class="confirmation-details">
                    <div class="detail-row">
                        <span class="detail-label">Appointment Type:</span>
                        <span class="detail-value">${appointmentType}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Specialty:</span>
                        <span class="detail-value">${specialty}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Doctor:</span>
                        <span class="detail-value">${doctor}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">${formattedDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Time:</span>
                        <span class="detail-value">${time}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Reason for Visit:</span>
                        <span class="detail-value">${reason || 'Not specified'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Patient Name:</span>
                        <span class="detail-value">${fullName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${phone}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Insurance:</span>
                        <span class="detail-value">${insurance || 'Not provided'}</span>
                    </div>
                </div>
                <div class="appointment-actions">
                    <button class="btn-secondary" onclick="window.print()">
                        <i class="fas fa-print"></i> Print Details
                    </button>
                    <button class="btn-outline" onclick="location.href='prescriptions.html'">
                        <i class="fas fa-prescription"></i> View Prescriptions
                    </button>
                </div>
            </div>
        `;
        
        // Update the appointment details container
        appointmentDetails.innerHTML = detailsHTML;
        appointmentDetails.classList.add('active');
        
        // Scroll to the appointment details
        appointmentDetails.scrollIntoView({
            behavior: 'smooth'
        });
        
        // Save appointment to local storage for future reference
        saveAppointment({
            type: appointmentType,
            specialty: specialty,
            doctor: doctor,
            date: date,
            time: time,
            reason: reason,
            fullName: fullName,
            email: email,
            phone: phone,
            insurance: insurance,
            createdAt: new Date().toISOString()
        });
    }
    
    // Function to save appointment to local storage
    function saveAppointment(appointmentData) {
        // Get existing appointments from local storage
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        
        // Add new appointment
        appointments.push(appointmentData);
        
        // Save back to local storage
        localStorage.setItem('appointments', JSON.stringify(appointments));
    }
    
    // Function to display existing appointments (if any)
    function displayExistingAppointments() {
        const upcomingAppointmentsSection = document.querySelector('.existing-appointments');
        
        if (!upcomingAppointmentsSection) return;
        
        // Get appointments from local storage
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        
        // Filter for upcoming appointments (today or future)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingAppointments = appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            return appointmentDate >= today;
        });
        
        // Sort by date
        upcomingAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Get the appointment list container
        const appointmentList = upcomingAppointmentsSection.querySelector('.appointment-list');
        
        // Clear existing content
        appointmentList.innerHTML = '';
        
        // Display upcoming appointments or a message if none
        if (upcomingAppointments.length > 0) {
            upcomingAppointments.forEach(appointment => {
                const appointmentDate = new Date(appointment.date);
                const formattedDate = appointmentDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
                
                const appointmentItem = document.createElement('div');
                appointmentItem.className = 'appointment-item';
                appointmentItem.innerHTML = `
                    <p><strong>${appointment.doctor}</strong> - ${appointment.specialty}</p>
                    <p>Date: ${formattedDate}</p>
                    <p>Time: ${appointment.time}</p>
                    <p>Type: ${appointment.type}</p>
                `;
                
                appointmentList.appendChild(appointmentItem);
            });
        } else {
            appointmentList.innerHTML = '<p class="no-appointments">You have no upcoming appointments.</p>';
        }
    }
    
    // Initialize the page
    displayExistingAppointments();
});
