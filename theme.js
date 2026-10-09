const themeButton = document.getElementById("themeToggle");

// Apply the saved theme when the page opens
let currentTheme = localStorage.getItem("bbsr-theme") || "light";

document.documentElement.setAttribute("data-theme", currentTheme);

// Update button text
function updateButton() {
    if (themeButton) {
        themeButton.textContent =
            currentTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
    }
}

updateButton();

// Switch between Dark Mode and Light Mode
if (themeButton) {
    themeButton.addEventListener("click", function () {
        currentTheme = currentTheme === "light" ? "dark" : "light";

        document.documentElement.setAttribute("data-theme", currentTheme);

        localStorage.setItem("bbsr-theme", currentTheme);

        updateButton();
    });
}