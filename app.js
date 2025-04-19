// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    loadPartials();
    setActiveNavLink();
    setupMobileMenu();
    updateCopyrightYear();

    // Initialize page-specific scripts if they exist
    if (typeof initAppointmentsPage === 'function') initAppointmentsPage();
    if (typeof initDoctorsPage === 'function') initDoctorsPage();
    if (typeof initPrescriptionsPage === 'function') initPrescriptionsPage();
    if (typeof initContactPage === 'function') initContactPage();

});

// Function to load HTML partials (header/footer)
async function loadPartials() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    try {
        const [headerRes, footerRes] = await Promise.all([
            fetch('header.html'),
            fetch('footer.html')
        ]);

        if (headerRes.ok && headerPlaceholder) {
            headerPlaceholder.innerHTML = await headerRes.text();
            // Re-run mobile menu setup after header is loaded
            setupMobileMenu();
            // Re-set active link after header is loaded
             setActiveNavLink();
        } else {
            console.error('Failed to load header or placeholder not found');
        }

        if (footerRes.ok && footerPlaceholder) {
            footerPlaceholder.innerHTML = await footerRes.text();
             // Re-run copyright year update after footer is loaded
            updateCopyrightYear();
        } else {
             console.error('Failed to load footer or placeholder not found');
        }
        console.log('Partials loaded successfully.');

    } catch (error) {
        console.error('Error loading partials:', error);
    }
}


// Function to highlight the active navigation link
function setActiveNavLink() {
    const navLinks = document.querySelectorAll('#nav-links a');
    // Get the current page filename (e.g., "index.html", "appointments.html")
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    // Normalize for root access (e.g., accessing '/' which loads index.html)
    const pageName = currentPage.replace('.html', '');

    navLinks.forEach(link => {
        link.classList.remove('active');
        // Match based on data-page attribute added in header.html
        const linkPage = link.getAttribute('data-page');
        if (linkPage === pageName || (pageName === 'index' && linkPage === 'home')) { // Adjust 'home' if needed
             link.classList.add('active');
             console.log(`Active link set for: ${linkPage}`);
        }
    });
}

// Function to set up mobile menu toggle
function setupMobileMenu() {
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (toggleButton && navLinks) {
        toggleButton.addEventListener('click', () => {
            const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
            navLinks.classList.toggle('active');
            toggleButton.setAttribute('aria-expanded', !isExpanded);
            // Optional: Change icon on toggle
            toggleButton.querySelector('i').classList.toggle('fa-bars');
            toggleButton.querySelector('i').classList.toggle('fa-times');
            console.log('Mobile menu toggled');
        });
    } else {
         // This might run before header is loaded, so check again in loadPartials
         // console.log('Mobile menu elements not found yet.');
    }
}

// Function to update copyright year
function updateCopyrightYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
        console.log('Copyright year updated.');
    } else {
         // This might run before footer is loaded
         // console.log('Copyright year span not found yet.');
    }
}

// --- Helper Functions ---

// Simple function to format date (can be expanded)
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
        return dateString; // Return original if formatting fails
    }
}

function showUserMessage(message, type = 'info', duration = 4000) {
     // Create message element
     const messageDiv = document.createElement('div');
     messageDiv.className = `user-message user-message-${type}`; // info, success, error
     messageDiv.textContent = message;

     document.body.appendChild(messageDiv);

     // Animate in
     setTimeout(() => messageDiv.classList.add('show'), 10);

     // Remove after duration
     setTimeout(() => {
         messageDiv.classList.remove('show');
         // Remove from DOM after transition
         messageDiv.addEventListener('transitionend', () => messageDiv.remove());
     }, duration);

     console.log(`User Message (${type}): ${message}`);
}


// Add the CSS for user-message to your styles.css!