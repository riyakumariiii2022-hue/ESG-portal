// Get saved ESG data from localStorage
const savedData = localStorage.getItem("esgData");

if (!savedData) {
    alert("No ESG data found. Please enter company data first.");
    window.location.href = "index.html";
} else {
    const data = JSON.parse(savedData);

    // Display company information
    document.getElementById("companyName").textContent =
        data.companyName;

    document.getElementById("financialYear").textContent =
        data.financialYear;

    // Display environmental data
    document.getElementById("energy").textContent =
        Number(data.environmental.energy).toLocaleString();

    document.getElementById("water").textContent =
        Number(data.environmental.water).toLocaleString();

    // Display social data
    document.getElementById("employees").textContent =
        Number(data.social.employees).toLocaleString();

    document.getElementById("safety").textContent =
        Number(data.social.safety).toLocaleString();
}


// Go back to the company data entry page
function goBack() {
    window.location.href = "index.html";
}


// Open KPI Calculator
function openKPI() {
    window.location.href = "kpi.html";
}


// Open ESG Score
function openESGScore() {
    window.location.href = "esg-score.html";
}


// Show message for modules that are not ready yet
function showComingSoon(moduleName) {
    alert(
        moduleName +
        " is coming soon. We will build this module next!"
    );
}