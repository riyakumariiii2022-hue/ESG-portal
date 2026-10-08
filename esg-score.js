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
    // GET VALUES
    // ========================================

    const energy = Number(data.environmental.energy);
    const water = Number(data.environmental.water);
    const waste = Number(data.environmental.waste);
    const emissions = Number(data.environmental.emissions);

    const employees = Number(data.social.employees);
    const femaleEmployees = Number(data.social.femaleEmployees);
    const training = Number(data.social.training);
    const safety = Number(data.social.safety);

    const complaints = Number(data.governance.complaints);
    const violations = Number(data.governance.violations);


    // ========================================
    // ENVIRONMENTAL SCORE
    // ========================================

    let environmentalScore = 100;

    // Higher emissions reduce score
    if (emissions > 100000) {
        environmentalScore -= 30;
    } else if (emissions > 50000) {
        environmentalScore -= 20;
    } else if (emissions > 10000) {
        environmentalScore -= 10;
    }

    // Higher waste reduces score
    if (waste > 10000) {
        environmentalScore -= 20;
    } else if (waste > 5000) {
        environmentalScore -= 10;
    }

    // Higher water consumption reduces score
    if (water > 100000000) {
        environmentalScore -= 20;
    } else if (water > 50000000) {
        environmentalScore -= 10;
    }

    // Higher energy consumption reduces score
    if (energy > 1000000) {
        environmentalScore -= 20;
    } else if (energy > 500000) {
        environmentalScore -= 10;
    }


    environmentalScore =
        Math.max(0, Math.min(100, environmentalScore));


    // ========================================
    // SOCIAL SCORE
    // ========================================

    let socialScore = 100;


    // Female employee representation
    let femalePercentage = 0;

    if (employees > 0) {

        femalePercentage =
            (femaleEmployees / employees) * 100;

    }

    if (femalePercentage < 10) {
        socialScore -= 20;
    } else if (femalePercentage < 20) {
        socialScore -= 10;
    }


    // Training
    let trainingPerEmployee = 0;

    if (employees > 0) {

        trainingPerEmployee =
            training / employees;

    }

    if (trainingPerEmployee < 1) {
        socialScore -= 15;
    }


    // Safety incidents
    if (safety > 20) {
        socialScore -= 30;
    } else if (safety > 10) {
        socialScore -= 15;
    }


    socialScore =
        Math.max(0, Math.min(100, socialScore));


    // ========================================
    // GOVERNANCE SCORE
    // ========================================

    let governanceScore = 100;


    // Customer complaints
    if (complaints > 100) {
        governanceScore -= 20;
    } else if (complaints > 50) {
        governanceScore -= 10;
    }


    // Ethics violations
    if (violations > 10) {
        governanceScore -= 40;
    } else if (violations > 5) {
        governanceScore -= 25;
    } else if (violations > 0) {
        governanceScore -= 10;
    }


    governanceScore =
        Math.max(0, Math.min(100, governanceScore));


    // ========================================
    // OVERALL ESG SCORE
    // ========================================

    const overallScore =
        (environmentalScore * 0.40) +
        (socialScore * 0.35) +
        (governanceScore * 0.25);


    const finalScore =
        Math.round(overallScore);


    // ========================================
    // DISPLAY SCORES
    // ========================================

    document.getElementById("environmentalScore").textContent =
        Math.round(environmentalScore);

    document.getElementById("socialScore").textContent =
        Math.round(socialScore);

    document.getElementById("governanceScore").textContent =
        Math.round(governanceScore);

    document.getElementById("overallScore").textContent =
        finalScore;


    // ========================================
    // SCORE STATUS
    // ========================================

    let status = "";
    let message = "";

    if (finalScore >= 80) {

        status = "Strong ESG Performance";
        message =
            "The available ESG data indicates strong overall performance.";

    } else if (finalScore >= 60) {

        status = "Needs Improvement";
        message =
            "The company shows moderate ESG performance with areas requiring improvement.";

    } else {

        status = "High ESG Risk";
        message =
            "The available data indicates significant areas that require attention.";

    }


    document.getElementById("scoreStatus").textContent =
        status;

    document.getElementById("scoreMessage").textContent =
        message;

}


// ========================================
// GO TO DASHBOARD
// ========================================

function goDashboard() {

    window.location.href = "dashboard.html";

}