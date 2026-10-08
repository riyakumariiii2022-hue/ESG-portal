const STORAGE_KEY = "brsrRiskHeatmap";

let risks = loadRisks();
let selectedCell = null;


// Load saved risks safely

function loadRisks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Could not load saved risks:", error);
        return [];
    }
}


// Save risks

function saveRisks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(risks));
    } catch (error) {
        alert("Unable to save risks in this browser.");
        console.error(error);
    }
}


// Calculate risk score

function calculateScore(likelihood, impact) {
    return Number(likelihood) * Number(impact);
}


// Determine risk level

function getRiskLevel(score) {
    if (score >= 15) {
        return "High";
    }

    if (score >= 6) {
        return "Medium";
    }

    return "Low";
}


// Back to dashboard

function goBack() {
    window.location.href = "dashboard.html";
}


// Add a risk

document.getElementById("riskForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("riskTitle").value.trim();
    const category = document.getElementById("riskCategory").value;
    const likelihood = Number(document.getElementById("likelihood").value);
    const impact = Number(document.getElementById("impact").value);
    const status = document.getElementById("riskStatus").value;
    const mitigation = document.getElementById("mitigation").value.trim();

    if (!title) {
        alert("Please enter a risk title.");
        return;
    }

    const risk = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
        title,
        category,
        likelihood,
        impact,
        score: calculateScore(likelihood, impact),
        status,
        mitigation,
        createdAt: new Date().toISOString()
    };

    risks.push(risk);

    saveRisks();

    selectedCell = null;

    document.getElementById("riskForm").reset();

    renderEverything();
});


// Render all sections

function renderEverything() {
    renderSummary();
    renderHeatmap();
    renderRiskTable();
}


// Update summary cards

function renderSummary() {
    const total = risks.length;

    const high = risks.filter(risk =>
        getRiskLevel(risk.score) === "High"
    ).length;

    const medium = risks.filter(risk =>
        getRiskLevel(risk.score) === "Medium"
    ).length;

    const low = risks.filter(risk =>
        getRiskLevel(risk.score) === "Low"
    ).length;

    document.getElementById("totalRisks").textContent = total;
    document.getElementById("highRisks").textContent = high;
    document.getElementById("mediumRisks").textContent = medium;
    document.getElementById("lowRisks").textContent = low;
}


// Render heatmap

function renderHeatmap() {
    const grid = document.getElementById("heatmapGrid");

    grid.innerHTML = "";

    /*
       Display impact from 5 down to 1.
       Display likelihood from 1 to 5.
    */

    for (let impact = 5; impact >= 1; impact--) {
        for (let likelihood = 1; likelihood <= 5; likelihood++) {

            const score = calculateScore(likelihood, impact);
            const level = getRiskLevel(score);

            const count = risks.filter(risk =>
                Number(risk.likelihood) === likelihood &&
                Number(risk.impact) === impact
            ).length;

            const cell = document.createElement("button");

            cell.type = "button";

            cell.className =
                "heat-cell heat-" + level.toLowerCase();

            if (
                selectedCell &&
                selectedCell.likelihood === likelihood &&
                selectedCell.impact === impact
            ) {
                cell.classList.add("selected");
            }

            cell.innerHTML = `
                <strong>${count}</strong>
                <span>Score ${score}</span>
            `;

            cell.title =
                `Likelihood: ${likelihood}, Impact: ${impact}, ` +
                `Score: ${score}, Risks: ${count}. Click to filter.`;

            cell.setAttribute(
                "aria-label",
                `Likelihood ${likelihood}, impact ${impact}, ` +
                `${count} risks, ${level} risk`
            );

            cell.addEventListener("click", function () {
                if (
                    selectedCell &&
                    selectedCell.likelihood === likelihood &&
                    selectedCell.impact === impact
                ) {
                    selectedCell = null;
                } else {
                    selectedCell = {
                        likelihood,
                        impact
                    };
                }

                renderHeatmap();
                renderRiskTable();
            });

            grid.appendChild(cell);
        }
    }
}


// Create a safe text element

function createTextCell(value) {
    const td = document.createElement("td");

    td.textContent = value;

    return td;
}


// Render risk register

function renderRiskTable() {
    const tableBody = document.getElementById("riskTableBody");

    tableBody.innerHTML = "";

    const searchText = document
        .getElementById("searchRisk")
        .value.trim()
        .toLowerCase();

    const categoryFilter =
        document.getElementById("categoryFilter").value;

    const levelFilter =
        document.getElementById("levelFilter").value;

    const statusFilter =
        document.getElementById("statusFilter").value;

    const filteredRisks = risks.filter(risk => {

        const matchesSearch =
            risk.title.toLowerCase().includes(searchText) ||
            risk.category.toLowerCase().includes(searchText) ||
            risk.mitigation.toLowerCase().includes(searchText);

        const matchesCategory =
            categoryFilter === "All" ||
            risk.category === categoryFilter;

        const level = getRiskLevel(risk.score);

        const matchesLevel =
            levelFilter === "All" ||
            level === levelFilter;

        const matchesStatus =
            statusFilter === "All" ||
            risk.status === statusFilter;

        const matchesCell =
            !selectedCell ||
            (
                Number(risk.likelihood) === selectedCell.likelihood &&
                Number(risk.impact) === selectedCell.impact
            );

        return (
            matchesSearch &&
            matchesCategory &&
            matchesLevel &&
            matchesStatus &&
            matchesCell
        );
    });

    filteredRisks.forEach(risk => {

        const row = document.createElement("tr");

        row.appendChild(createTextCell(risk.title));
        row.appendChild(createTextCell(risk.category));
        row.appendChild(createTextCell(risk.likelihood));
        row.appendChild(createTextCell(risk.impact));
        row.appendChild(createTextCell(risk.score));

        // Risk level badge

        const level = getRiskLevel(risk.score);
        const levelCell = document.createElement("td");
        const levelBadge = document.createElement("span");

        levelBadge.className =
            "badge badge-" + level.toLowerCase();

        levelBadge.textContent = level;

        levelCell.appendChild(levelBadge);
        row.appendChild(levelCell);

        // Status badge

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        let statusClass = "status-open";

        if (risk.status === "In Progress") {
            statusClass = "status-progress";
        } else if (risk.status === "Mitigated") {
            statusClass = "status-mitigated";
        }

        statusBadge.className = "badge " + statusClass;
        statusBadge.textContent = risk.status;

        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        // Delete button

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            deleteRisk(risk.id);
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });

    document.getElementById("emptyMessage").style.display =
        filteredRisks.length === 0 ? "block" : "none";
}


// Delete a risk

function deleteRisk(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this risk?"
    );

    if (!confirmed) {
        return;
    }

    risks = risks.filter(risk => risk.id !== id);

    saveRisks();

    renderEverything();
}


// Export risk register as CSV

function exportRisks() {
    if (risks.length === 0) {
        alert("There are no risks to export.");
        return;
    }

    const headers = [
        "Risk Title",
        "Category",
        "Likelihood",
        "Impact",
        "Risk Score",
        "Risk Level",
        "Status",
        "Mitigation Plan",
        "Created At"
    ];

    const rows = risks.map(risk => [
        risk.title,
        risk.category,
        risk.likelihood,
        risk.impact,
        risk.score,
        getRiskLevel(risk.score),
        risk.status,
        risk.mitigation,
        risk.createdAt
    ]);

    function escapeCSV(value) {
        let text = String(value ?? "");

        // Prevent spreadsheet formula injection.
        if (/^[\s]*[=+\-@]/.test(text)) {
            text = "'" + text;
        }

        return '"' + text.replace(/"/g, '""') + '"';
    }

    const csvContent = [
        headers.map(escapeCSV).join(","),
        ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "ESG_Risk_Register.csv";

    document.body.appendChild(link);

    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}


// Search and filters

document.getElementById("searchRisk")
    .addEventListener("input", renderRiskTable);

document.getElementById("categoryFilter")
    .addEventListener("change", renderRiskTable);

document.getElementById("levelFilter")
    .addEventListener("change", renderRiskTable);

document.getElementById("statusFilter")
    .addEventListener("change", renderRiskTable);


// Initial render

renderEverything();