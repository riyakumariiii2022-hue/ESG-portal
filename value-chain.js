function goBack() {
    window.location.href = "dashboard.html";
}

const STORAGE_KEY = "brsrValueChainSuppliers";

const supplierForm = document.getElementById("supplierForm");
const supplierTable = document.getElementById("supplierTable");
const searchSupplier = document.getElementById("searchSupplier");

let suppliers = [];

try {
    const saved = localStorage.getItem(STORAGE_KEY);
    suppliers = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(suppliers)) {
        suppliers = [];
    }
} catch (error) {
    suppliers = [];
}

function saveSuppliers() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
}

function calculateRisk(supplier) {
    const risks = [
        supplier.environmental,
        supplier.social,
        supplier.governance
    ];

    if (risks.includes("High")) {
        return "High";
    }

    if (risks.includes("Medium")) {
        return "Medium";
    }

    return "Low";
}

function makeBadge(value, type) {
    const className = type === "risk"
        ? "risk-" + value.toLowerCase()
        : "status-" + value.toLowerCase().replace(/\s+/g, "-");

    const badge = document.createElement("span");
    badge.className = "badge " + className;
    badge.textContent = value;

    return badge;
}

function renderSuppliers() {
    const query = searchSupplier.value.trim().toLowerCase();

    const filtered = suppliers.filter(function (supplier) {
        return (
            supplier.name.toLowerCase().includes(query) ||
            supplier.industry.toLowerCase().includes(query)
        );
    });

    supplierTable.replaceChildren();

    if (filtered.length === 0) {
        const row = supplierTable.insertRow();
        const cell = row.insertCell();

        cell.colSpan = 8;
        cell.textContent = suppliers.length === 0
            ? "No suppliers added yet."
            : "No matching suppliers found.";

        updateSummary();
        return;
    }

    filtered.forEach(function (supplier) {
        const row = supplierTable.insertRow();

        const values = [
            supplier.name,
            supplier.industry,
            supplier.environmental,
            supplier.social,
            supplier.governance
        ];

        values.forEach(function (value, index) {
            const cell = row.insertCell();
            cell.textContent = value;

            if (index >= 2) {
                cell.appendChild(makeBadge(value, "risk"));
            }
        });

        const riskCell = row.insertCell();
        riskCell.appendChild(
            makeBadge(calculateRisk(supplier), "risk")
        );

        const statusCell = row.insertCell();
        statusCell.appendChild(
            makeBadge(supplier.assessment, "status")
        );

        const actionCell = row.insertCell();
        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            deleteSupplier(supplier.id);
        });

        actionCell.appendChild(deleteButton);
    });

    updateSummary();
}

function updateSummary() {
    document.getElementById("totalSuppliers").textContent =
        suppliers.length;

    document.getElementById("highRiskSuppliers").textContent =
        suppliers.filter(function (supplier) {
            return calculateRisk(supplier) === "High";
        }).length;

    document.getElementById("pendingAssessments").textContent =
        suppliers.filter(function (supplier) {
            return supplier.assessment !== "Completed";
        }).length;
}

supplierForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const supplier = {
        id: (crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString() + Math.random().toString(16).slice(2)),
        name: document.getElementById("supplierName").value.trim(),
        industry: document.getElementById("industry").value,
        environmental: document.getElementById("environmental").value,
        social: document.getElementById("social").value,
        governance: document.getElementById("governance").value,
        assessment: document.getElementById("assessment").value
    };

    if (!supplier.name) {
        alert("Please enter a supplier name.");
        return;
    }

    suppliers.push(supplier);
    saveSuppliers();

    supplierForm.reset();
    renderSuppliers();
});

function deleteSupplier(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this supplier?"
    );

    if (!confirmed) {
        return;
    }

    suppliers = suppliers.filter(function (supplier) {
        return supplier.id !== id;
    });

    saveSuppliers();
    renderSuppliers();
}

searchSupplier.addEventListener("input", renderSuppliers);

document.getElementById("exportBtn").addEventListener("click", function () {
    if (suppliers.length === 0) {
        alert("There are no suppliers to export.");
        return;
    }

    const headers = [
        "Supplier Name",
        "Industry",
        "Environmental Risk",
        "Social Risk",
        "Governance Risk",
        "Overall Risk",
        "Assessment Status"
    ];

    const rows = suppliers.map(function (supplier) {
        return [
            supplier.name,
            supplier.industry,
            supplier.environmental,
            supplier.social,
            supplier.governance,
            calculateRisk(supplier),
            supplier.assessment
        ];
    });

    function escapeCSV(value) {
        return '"' + String(value).replace(/"/g, '""') + '"';
    }

    const csv = [headers, ...rows]
        .map(function (row) {
            return row.map(escapeCSV).join(",");
        })
        .join("\r\n");

    const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "value-chain-esg-suppliers.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
});

renderSuppliers();