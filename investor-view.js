const COMPANY_STORAGE_KEY = "esgData";
const RISK_STORAGE_KEY = "brsrRiskHeatmap";

function goBack() {
    window.location.href = "dashboard.html";
}

function openRiskHeatmap() {
    window.location.href = "risk-heatmap.html";
}


// Format numeric values

function formatValue(value) {
    if (
        value === null ||
        value === undefined ||
        value === "" ||
        !Number.isFinite(Number(value))
    ) {
        return "Not available";
    }

    return Number(value).toLocaleString("en-IN");
}


// Load company data

function loadCompanyData() {
    let data = null;

    try {
        const savedData = localStorage.getItem(COMPANY_STORAGE_KEY);

        if (savedData) {
            data = JSON.parse(savedData);
        }
    } catch (error) {
        console.error("Unable to read company data:", error);
    }

    if (!data || typeof data !== "object") {
        document.getElementById("companyName").textContent =
            "Company not entered";

        document.getElementById("financialYear").textContent =
            "Financial year not entered";

        return;
    }

    const environmental = data.environmental || {};
    const social = data.social || {};

    const companyName =
        typeof data.companyName === "string" && data.companyName.trim()
            ? data.companyName.trim()
            : "Company not entered";

    const financialYear =
        typeof data.financialYear === "string" && data.financialYear.trim()
            ? data.financialYear.trim()
            : "Financial year not entered";

    const energy = formatValue(environmental.energy);
    const water = formatValue(environmental.water);
    const employees = formatValue(social.employees);
    const safety = formatValue(social.safety);

    document.getElementById("companyName").textContent = companyName;
    document.getElementById("financialYear").textContent = financialYear;

    document.getElementById("energyValue").textContent = energy;
    document.getElementById("waterValue").textContent = water;
    document.getElementById("employeeValue").textContent = employees;
    document.getElementById("safetyValue").textContent = safety;

    document.getElementById("environmentEnergy").textContent = energy;
    document.getElementById("environmentWater").textContent = water;

    document.getElementById("socialEmployees").textContent = employees;
    document.getElementById("socialSafety").textContent = safety;

    const environmentAvailable =
        environmental.energy !== undefined &&
        environmental.energy !== "" &&
        environmental.water !== undefined &&
        environmental.water !== "";

    const socialAvailable =
        social.employees !== undefined &&
        social.employees !== "" &&
        social.safety !== undefined &&
        social.safety !== "";

    document.getElementById("environmentStatus").textContent =
        environmentAvailable ? "Values entered" : "Incomplete";

    document.getElementById("socialStatus").textContent =
        socialAvailable ? "Values entered" : "Incomplete";
}


// Risk scoring must match the Risk Heatmap prototype

function getRiskLevel(score) {
    if (score >= 15) {
        return "High";
    }

    if (score >= 6) {
        return "Medium";
    }

    return "Low";
}


// Load saved risks

function loadRisks() {
    try {
        const saved = localStorage.getItem(RISK_STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        // Ignore malformed entries rather than breaking the page.
        return parsed.filter(risk =>
            risk &&
            typeof risk.title === "string" &&
            Number.isFinite(Number(risk.likelihood)) &&
            Number.isFinite(Number(risk.impact))
        );
    } catch (error) {
        console.error("Unable to read saved risks:", error);
        return [];
    }
}


// Render risk summary and table

function loadRiskSummary() {
    const risks = loadRisks();

    let high = 0;
    let medium = 0;
    let low = 0;

    const tableBody = document.getElementById("riskTableBody");

    tableBody.innerHTML = "";

    risks.forEach(risk => {
        const score =
            Number(risk.likelihood) * Number(risk.impact);

        const level = getRiskLevel(score);

        if (level === "High") {
            high++;
        } else if (level === "Medium") {
            medium++;
        } else {
            low++;
        }

        const row = document.createElement("tr");

        function addCell(value) {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
            return cell;
        }

        addCell(risk.title);
        addCell(risk.category || "Not specified");
        addCell(score);

        const levelCell = addCell("");

        const badge = document.createElement("span");

        badge.className = "badge badge-" + level.toLowerCase();
        badge.textContent = level;

        levelCell.appendChild(badge);

        addCell(risk.status || "Open");

        tableBody.appendChild(row);
    });

    document.getElementById("totalRiskCount").textContent = risks.length;
    document.getElementById("highRiskCount").textContent = high;
    document.getElementById("mediumRiskCount").textContent = medium;
    document.getElementById("lowRiskCount").textContent = low;

    document.getElementById("noRisksMessage").style.display =
        risks.length === 0 ? "block" : "none";
}


// Initial page setup

loadCompanyData();
loadRiskSummary();