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
    // GET ESG VALUES
    // ========================================

    const employees =
        Number(data.social.employees);

    const femaleEmployees =
        Number(data.social.femaleEmployees);

    const training =
        Number(data.social.training);

    const safety =
        Number(data.social.safety);

    const water =
        Number(data.environmental.water);

    const energy =
        Number(data.environmental.energy);

    const waste =
        Number(data.environmental.waste);


    // ========================================
    // 1. FEMALE EMPLOYEE %
    // ========================================

    let femalePercentage = 0;

    if (employees > 0) {

        femalePercentage =
            (femaleEmployees / employees) * 100;

    }


    document.getElementById("femalePercentage").textContent =
        femalePercentage.toFixed(2);


    // ========================================
    // 2. TRAINING HOURS / EMPLOYEE
    // ========================================

    let trainingPerEmployee = 0;

    if (employees > 0) {

        trainingPerEmployee =
            training / employees;

    }


    document.getElementById("trainingPerEmployee").textContent =
        trainingPerEmployee.toFixed(2);


    // ========================================
    // 3. SAFETY INCIDENT RATE
    // ========================================

    let safetyRate = 0;

    if (employees > 0) {

        safetyRate =
            (safety / employees) * 100;

    }


    document.getElementById("safetyRate").textContent =
        safetyRate.toFixed(2);


    // ========================================
    // 4. WATER / EMPLOYEE
    // ========================================

    let waterPerEmployee = 0;

    if (employees > 0) {

        waterPerEmployee =
            water / employees;

    }


    document.getElementById("waterPerEmployee").textContent =
        waterPerEmployee.toLocaleString(
            undefined,
            {
                maximumFractionDigits: 2
            }
        );


    // ========================================
    // 5. ENERGY / EMPLOYEE
    // ========================================

    let energyPerEmployee = 0;

    if (employees > 0) {

        energyPerEmployee =
            energy / employees;

    }


    document.getElementById("energyPerEmployee").textContent =
        energyPerEmployee.toLocaleString(
            undefined,
            {
                maximumFractionDigits: 2
            }
        );


    // ========================================
    // 6. WASTE / EMPLOYEE
    // ========================================

    let wastePerEmployee = 0;

    if (employees > 0) {

        wastePerEmployee =
            waste / employees;

    }


    document.getElementById("wastePerEmployee").textContent =
        wastePerEmployee.toLocaleString(
            undefined,
            {
                maximumFractionDigits: 4
            }
        );

}


// ========================================
// GO TO DASHBOARD
// ========================================

function goDashboard() {

    window.location.href = "dashboard.html";

}