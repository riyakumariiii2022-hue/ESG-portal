function goBack() {
    window.location.href = "dashboard.html";
}

const carbonForm = document.getElementById("carbonForm");

carbonForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const electricity = Number(
        document.getElementById("electricity").value
    );

    const electricityFactor = Number(
        document.getElementById("electricityFactor").value
    );

    const fuel = Number(
        document.getElementById("fuel").value
    );

    const fuelFactor = Number(
        document.getElementById("fuelFactor").value
    );

    const values = [
        electricity,
        electricityFactor,
        fuel,
        fuelFactor
    ];

    const invalid = values.some(function (value) {
        return !Number.isFinite(value) || value < 0;
    });

    if (invalid) {
        alert("Please enter valid, non-negative numbers.");
        return;
    }

    // Calculate estimated emissions in kg CO2 equivalent
    const electricityEmissions =
        electricity * electricityFactor;

    const fuelEmissions =
        fuel * fuelFactor;

    const totalEmissions =
        electricityEmissions + fuelEmissions;

    const tonnesEmissions =
        totalEmissions / 1000;

    // Display results
    document.getElementById("electricityResult").textContent =
        electricityEmissions.toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });

    document.getElementById("fuelResult").textContent =
        fuelEmissions.toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });

    document.getElementById("totalResult").textContent =
        totalEmissions.toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });

    document.getElementById("tonnesResult").textContent =
        "Total: " +
        tonnesEmissions.toLocaleString("en-IN", {
            maximumFractionDigits: 3
        }) +
        " tonnes CO₂e";
});