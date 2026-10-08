const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const message = document.getElementById("message");

// Show or hide password
togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.textContent = "Hide";
    } else {
        passwordInput.type = "password";
        togglePassword.textContent = "Show";
    }
});

// Login demonstration
loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        message.style.color = "#d93025";
        message.textContent = "Please enter your email and password.";
        return;
    }

    // This is a UI demonstration, not real authentication.
    message.style.color = "#b56b00";
    message.textContent =
        "Login page is ready, but authentication is not configured yet.";
});

// Forgot password demonstration
document.getElementById("forgotPassword").addEventListener("click", function (event) {
    event.preventDefault();
    alert("Password recovery will be available after backend setup.");
});

// Signup demonstration
document.getElementById("signupLink").addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "register.html";
});