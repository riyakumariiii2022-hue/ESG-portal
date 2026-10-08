document.getElementById("esgForm").addEventListener("submit", function(event) {

    event.preventDefault();

    const companyName = document.getElementById("companyName").value;
    const financialYear = document.getElementById("financialYear").value;

    const energy = document.getElementById("energy").value;
    const water = document.getElementById("water").value;
    const waste = document.getElementById("waste").value;
    const emissions = document.getElementById("emissions").value;

    const employees = document.getElementById("employees").value;
    const training = document.getElementById("training").value;
    const safety = document.getElementById("safety").value;
    const femaleEmployees = document.getElementById("femaleEmployees").value;

    const complaints = document.getElementById("complaints").value;
    const violations = document.getElementById("violations").value;

    const esgData = {

        companyName: companyName,
        financialYear: financialYear,

        environmental: {
            energy: energy,
            water: water,
            waste: waste,
            emissions: emissions
        },

        social: {
            employees: employees,
            training: training,
            safety: safety,
            femaleEmployees: femaleEmployees
        },

        governance: {
            complaints: complaints,
            violations: violations
        }

    };

    localStorage.setItem("esgData", JSON.stringify(esgData));

    window.location.href = "dashboard.html";

});