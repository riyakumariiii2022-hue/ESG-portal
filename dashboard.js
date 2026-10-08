// ========================================
// GET SAVED ESG DATA
// ========================================

const savedData = localStorage.getItem("esgData");


// ========================================
// CHECK DATA
// ========================================

if (!savedData) {

    alert("No ESG data found. Please enter company data first.");

    window.location.href = "index.html";

} else {

    const data = JSON.parse(savedData);


    // ========================================
    // COMPANY INFORMATION
    // ========================================

    document.getElementById("companyName").textContent =
        data.companyName;

    document.getElementById("financialYear").textContent =
        data.financialYear;


    // ========================================
    // ENVIRONMENTAL DATA
    // ========================================

    document.getElementById("energy").textContent =
        Number(data.environmental.energy).toLocaleString();

    document.getElementById("water").textContent =
        Number(data.environmental.water).toLocaleString();


    // ========================================
    // SOCIAL DATA
    // ========================================

    document.getElementById("employees").textContent =
        Number(data.social.employees).toLocaleString();

    document.getElementById("safety").textContent =
        Number(data.social.safety).toLocaleString();

}


// ========================================
// GO BACK TO DATA ENTRY
// ========================================

function goBack() {

    window.location.href = "index.html";

}
// ========================================
// OPEN KPI CALCULATOR
// ========================================

function openKPI() {

    window.location.href = "kpi.html";

}