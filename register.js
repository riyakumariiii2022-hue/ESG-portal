const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const company = document.getElementById("company").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        showMessage("Passwords do not match.", "red");
        return;
    }

    showMessage("Creating your account...", "#137750");

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName,
                company,
                email,
                password,
                confirmPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || "Registration failed.", "red");
            return;
        }

        showMessage(data.message, "#137750");

        setTimeout(() => {
            window.location.href = data.redirect;
        }, 1000);

    } catch (error) {
        showMessage(
            "Cannot connect to the server. Please start the backend.",
            "red"
        );
    }
});

function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
}