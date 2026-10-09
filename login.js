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

// Real login using the backend
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        message.style.color = "#d93025";
        message.textContent = "Please enter your email and password.";
        return;
    }

    message.style.color = "#555";
    message.textContent = "Logging in...";

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed.");
        }

        message.style.color = "green";
        message.textContent = "Login successful! Opening dashboard...";

        window.location.href = data.redirect || "/dashboard.html";

    } catch (error) {
        message.style.color = "#d93025";
        message.textContent =
            error.message === "Failed to fetch"
                ? "Cannot connect to the server. Please start the backend."
                : error.message;
    }
});

// Forgot password
document.getElementById("forgotPassword").addEventListener("click", function (event) {
    event.preventDefault();
    alert("Password recovery has not been implemented yet.");
});

// Signup
document.getElementById("signupLink").addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "/register.html";
});