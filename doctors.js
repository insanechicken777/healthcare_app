// js/doctors.js

let allDoctors = []; // Store all doctors fetched initially

function initDoctorsPage() {
    console.log('Initializing Doctors Page...');
    const doctorsGrid = document.querySelector('.doctors-grid');
    const searchInput = document.getElementById('doctor-search');
    const specialtyFilter = document.getElementById('specialty-filter');

    if (!doctorsGrid) {
        console.error('Doctors grid container not found.');
        return;
    }

    loadDoctors(doctorsGrid);

    // Add event listeners for filtering/searching
    if (searchInput) {
        searchInput.addEventListener('input', () => filterDoctors(doctorsGrid));
    }
    if (specialtyFilter) {
        specialtyFilter.addEventListener('change', () => filterDoctors(doctorsGrid));
    }
}

async function loadDoctors(gridContainer) {
    gridContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i><p>Loading doctors...</p></div>'; // Loading state
    try {
        allDoctors = await dataService.getDoctors(); // Fetch via service
        populateSpecialtyFilter(allDoctors); // Populate filter based on fetched data
        displayDoctors(allDoctors, gridContainer); // Display all initially
        console.log('Doctors loaded successfully.');
    } catch (error) {
        console.error('Error loading doctors:', error);
        gridContainer.innerHTML = '<p class="text-center text-danger">Could not load doctor information.</p>';
    }
}

function populateSpecialtyFilter(doctors) {
     const specialtyFilter = document.getElementById('specialty-filter');
     if (!specialtyFilter) return;

     const specialties = [...new Set(doctors.map(doc => doc.specialty))].sort(); // Get unique, sorted specialties

     specialtyFilter.innerHTML = '<option value="">All Specialties</option>'; // Reset and add default

     specialties.forEach(spec => {
         const option = document.createElement('option');
         option.value = spec;
         option.textContent = spec;
         specialtyFilter.appendChild(option);
     });
     console.log('Specialty filter populated.');
}


function displayDoctors(doctorsToDisplay, gridContainer) {
    gridContainer.innerHTML = ''; // Clear previous content or loading indicator

    if (doctorsToDisplay.length === 0) {
        gridContainer.innerHTML = '<p class="text-center text-muted">No doctors found matching your criteria.</p>';
        return;
    }

    doctorsToDisplay.forEach(doctor => {
        const card = document.createElement('div');
        card.className = 'doctor-card card'; // Use card styling
        card.innerHTML = `
            <div class="doctor-image">
                <img src="${doctor.image || 'doctor-placeholder.png'}" alt="Photo of ${doctor.name}">
            </div>
            <div class="doctor-info">
                <h3>${doctor.name}</h3>
                <p class="specialty">${doctor.specialty}</p>
                <p class="experience"><i class="fas fa-clock" aria-hidden="true"></i> ${doctor.experience} Experience</p>
                <p class="education"><i class="fas fa-graduation-cap" aria-hidden="true"></i> ${doctor.education}</p>
                <p class="description">${doctor.description.substring(0, 100)}...</p> <!-- Short description -->
            </div>
            <div class="doctor-actions">
                 <button class="btn btn-outline-primary view-profile-btn" data-doctor-id="${doctor.id}">
                    <i class="fas fa-user" aria-hidden="true"></i> View Profile
                 </button>
                <a href="appointments.html?doctorId=${doctor.id}&specialty=${encodeURIComponent(doctor.specialty)}" class="btn btn-primary"> <!-- Link to appointments with prefill -->
                    <i class="fas fa-calendar-plus" aria-hidden="true"></i> Book Now
                </a>
            </div>
        `;
        gridContainer.appendChild(card);
    });

    // Add event listeners for the newly created "View Profile" buttons
    addProfileButtonListeners();
    console.log(`Displayed ${doctorsToDisplay.length} doctors.`);
}

function addProfileButtonListeners() {
    document.querySelectorAll('.view-profile-btn').forEach(button => {
        // Remove existing listener to prevent duplicates if re-rendering
        button.replaceWith(button.cloneNode(true));
    });
     document.querySelectorAll('.view-profile-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const doctorId = event.currentTarget.getAttribute('data-doctor-id');
            showDoctorProfileModal(doctorId);
        });
    });

}

function filterDoctors(gridContainer) {
    const searchInput = document.getElementById('doctor-search');
    const specialtyFilter = document.getElementById('specialty-filter');

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedSpecialty = specialtyFilter ? specialtyFilter.value : '';

     console.log(`Filtering doctors. Search: "${searchTerm}", Specialty: "${selectedSpecialty}"`);

    const filteredDoctors = allDoctors.filter(doctor => {
        const nameMatch = doctor.name.toLowerCase().includes(searchTerm);
        const specialtyMatch = !selectedSpecialty || doctor.specialty === selectedSpecialty;
        return nameMatch && specialtyMatch;
    });

    displayDoctors(filteredDoctors, gridContainer);
}


// Function to show doctor profile in a modal
async function showDoctorProfileModal(doctorId) {
     console.log(`Showing profile modal for doctor ID: ${doctorId}`);
    try {
        const doctor = await dataService.getDoctorById(doctorId);
        if (!doctor) {
            showUserMessage('Could not find doctor details.', 'error');
            return;
        }

        // Create or get modal element
        let modal = document.getElementById('doctorProfileModal');
        if (modal) modal.remove(); // Remove existing modal if present

        modal = document.createElement('div');
        modal.id = 'doctorProfileModal';
        modal.className = 'modal'; // Use common modal styles
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'profileModalTitle');

        modal.innerHTML = `
            <div class="modal-content profile-modal-content">
                 <button class="close-modal" aria-label="Close profile dialog">×</button>
                 <div class="profile-header">
                     <img src="${doctor.image || 'doctor-placeholder.png'}" alt="Profile photo of ${doctor.name}">
                     <div>
                         <h4 id="profileModalTitle">${doctor.name}</h4>
                         <p>${doctor.specialty}</p>
                     </div>
                 </div>
                 <div class="profile-details">
                     <p><strong>Experience:</strong> ${doctor.experience}</p>
                     <p><strong>Education:</strong> ${doctor.education}</p>
                     <p><strong>About:</strong> ${doctor.description}</p>
            
                 </div>
                 <div class="modal-actions">
                    <button class="btn btn-secondary close-modal-btn">Close</button>
                     <a href="appointments.html?doctorId=${doctor.id}&specialty=${encodeURIComponent(doctor.specialty)}" class="btn btn-primary">
                         <i class="fas fa-calendar-plus" aria-hidden="true"></i> Book Appointment
                    </a>
                 </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Show modal
        // Need slight delay for CSS transition if using fadeIn animation
        setTimeout(() => modal.style.display = 'flex', 10);

        // Add event listeners to close modal
        modal.querySelector('.close-modal').addEventListener('click', () => closeModal(modal));
        modal.querySelector('.close-modal-btn').addEventListener('click', () => closeModal(modal));
        modal.addEventListener('click', (event) => {
            if (event.target === modal) { // Click outside content
                closeModal(modal);
            }
        });

    } catch (error) {
        console.error('Error showing doctor profile:', error);
        showUserMessage('Error displaying doctor profile.', 'error');
    }
}

function closeModal(modalElement) {
    if (modalElement) {
        modalElement.style.display = 'none';
        // Optional: Remove from DOM after hiding if you create it each time
        modalElement.remove();
        console.log('Modal closed.');
    }
}