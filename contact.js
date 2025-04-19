// js/contact.js

function initContactPage() {
    console.log('Initializing Contact Page...');
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
}

function handleContactFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    console.log('Handling contact form submission...');

     // --- Basic Client-Side Validation ---
     let isValid = true;
     const requiredFields = ['name', 'email', 'subject', 'message'];

     requiredFields.forEach(id => {
         const input = form.querySelector(`#${id}`);
         const feedbackElement = form.querySelector(`#${id}-feedback`);
         if (input && !input.value.trim()) {
             isValid = false;
             input.classList.add('is-invalid');
             if(feedbackElement) feedbackElement.textContent = 'This field is required.';
         } else if (input) {
             input.classList.remove('is-invalid');
             if(feedbackElement) feedbackElement.textContent = '';
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
     } else if (emailInput && emailInput.classList.contains('is-invalid') && emailPattern.test(emailInput.value)) {
         emailInput.classList.remove('is-invalid');
          if(emailFeedback) emailFeedback.textContent = '';
     }


     if (!isValid) {
        console.warn('Contact form validation failed.');
        showUserMessage('Please correct the errors in the form.', 'error');
        const firstInvalid = form.querySelector('.is-invalid');
        if(firstInvalid) firstInvalid.focus();
        return; // Stop submission
     }

    // --- Simulate Form Submission ---
    const formData = new FormData(form);
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');

    console.log('Contact Form Data:', { name, email, subject, message });

    // Simulate sending data to a backend
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Sending...';

    setTimeout(() => { // Simulate network delay
        // Assume success
        console.log('Contact form submitted (simulated).');
        showUserMessage(`Thank you, ${name}! Your message has been sent.`, 'success');
        form.reset(); // Clear the form
        submitButton.disabled = false;
        submitButton.innerHTML = 'Send Message';
         // Clear validation states
         form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        // In a real app, handle potential server errors here
    }, 1500);
}