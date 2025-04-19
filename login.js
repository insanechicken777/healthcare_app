// js/login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');

    // --- SECURITY WARNING ---
    // THESE CREDENTIALS ARE HARDCODED AND VISIBLE IN BROWSER SOURCE CODE.
    // THIS IS EXTREMELY INSECURE. DO NOT USE FOR REAL APPLICATIONS.
    const validUsername = "parthivanil007";
    const validPassword = "hello";
    // --- END SECURITY WARNING ---

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Stop form from submitting the traditional way

            // Clear previous errors
            loginError.textContent = '';
            loginError.style.display = 'none';
            usernameInput.classList.remove('is-invalid');
            passwordInput.classList.remove('is-invalid');

            // Get trimmed input values
            const enteredUsername = usernameInput.value.trim();
            const enteredPassword = passwordInput.value.trim(); // Usually don't trim passwords, but fine for this demo

            // Basic check for empty fields
            if (!enteredUsername || !enteredPassword) {
                loginError.textContent = 'Please enter both username and password.';
                loginError.style.display = 'block';
                if (!enteredUsername) usernameInput.classList.add('is-invalid');
                if (!enteredPassword) passwordInput.classList.add('is-invalid');
                return; // Stop processing
            }

            // Check credentials (INSECURE HARDCODED CHECK)
            if (enteredUsername === validUsername && enteredPassword === validPassword) {
                // --- Login Successful ---
                console.log('Login successful!');

                // Optional: Display a success message before redirecting
                // (Requires showUserMessage function from app.js if you use that)
                // showUserMessage('Login successful! Redirecting...', 'success', 2000);

                // Redirect to the main page (index.html)
                // Add a slight delay if showing a message
                // setTimeout(() => {
                    window.location.href = 'index.html'; // Redirect to home page
                // }, 500); // Adjust delay as needed

            } else {
                // --- Login Failed ---
                console.log('Login failed: Invalid credentials.');
                loginError.textContent = 'Invalid username or password.';
                loginError.style.display = 'block';
                // Mark both fields as potentially incorrect
                usernameInput.classList.add('is-invalid');
                passwordInput.classList.add('is-invalid');
            }
        });
    } else {
        console.error("Login form not found!");
    }
});