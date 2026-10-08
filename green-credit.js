function goBack() {
    window.location.href = "dashboard.html";
}

const STORAGE_KEY = "brsrGreenCreditActivities";

const creditForm = document.getElementById("creditForm");
const activityTable = document.getElementById("activityTable");
const searchActivity = document.getElementById("searchActivity");

let activities = [];

try {
    const saved = localStorage.getItem(STORAGE_KEY);
    activities = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(activities)) {
        activities = [];
    }
} catch (error) {
    activities = [];
}

// These are illustrative demo multipliers, NOT official credit rules.
const DEMO_MULTIPLIERS = {
    "Tree Plantation": 1,
    "Water Conservation": 0.001,
    "Waste Management": 0.01,
    "Mangrove Conservation": 1,
    "Other": 0
};

function saveActivities() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(activities)
    );
}

function estimateCredits(activity) {
    return activity.quantity *
        DEMO_MULTIPLIERS[activity.activityType];
}

function createBadge(text, className) {
    const badge = document.createElement("span");
    badge.className = "badge " + className;
    badge.textContent = text;
    return badge;
}

function formatNumber(value, decimals = 2) {
    return Number(value).toLocaleString("en-IN", {
        maximumFractionDigits: decimals
    });
}

function renderActivities() {
    const query = searchActivity.value.trim().toLowerCase();

    const filtered = activities.filter(function (activity) {
        return (
            activity.name.toLowerCase().includes(query) ||
            activity.activityType.toLowerCase().includes(query)
        );
    });

    activityTable.replaceChildren();

    if (filtered.length === 0) {
        const row = activityTable.insertRow();
        const cell = row.insertCell();

        cell.colSpan = 8;
        cell.textContent = activities.length === 0
            ? "No activities registered yet."
            : "No matching activities found.";
    } else {
        filtered.forEach(function (activity) {
            const row = activityTable.insertRow();

            const values = [
                activity.name,
                activity.activityType,
                formatNumber(activity.quantity) + " " + activity.unit,
                activity.date,
                "₹" + formatNumber(activity.investment),
                formatNumber(estimateCredits(activity))
            ];

            values.forEach(function (value) {
                const cell = row.insertCell();
                cell.textContent = value;
            });

            const statusCell = row.insertCell();

            const statusClass = activity.status === "Verified"
                ? "status-verified"
                : activity.status === "In Progress"
                    ? "status-in-progress"
                    : "status-pending";

            statusCell.appendChild(
                createBadge(activity.status, statusClass)
            );

            const actionCell = row.insertCell();

            const statusButton = document.createElement("button");
            statusButton.className = "secondary-btn";
            statusButton.textContent = "Update Status";
            statusButton.style.marginTop = "0";

            statusButton.addEventListener("click", function () {
                updateStatus(activity.id);
            });

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.textContent = "Delete";
            deleteButton.style.marginLeft = "6px";

            deleteButton.addEventListener("click", function () {
                deleteActivity(activity.id);
            });

            actionCell.append(statusButton, deleteButton);
        });
    }

    updateSummary();
}

function updateSummary() {
    document.getElementById("totalActivities").textContent =
        activities.length;

    document.getElementById("pendingActivities").textContent =
        activities.filter(function (activity) {
            return activity.status !== "Verified";
        }).length;

    const totalInvestment = activities.reduce(function (total, activity) {
        return total + activity.investment;
    }, 0);

    document.getElementById("totalInvestment").textContent =
        "₹" + formatNumber(totalInvestment);
}

creditForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const activity = {
        id: Date.now().toString() +
            Math.random().toString(16).slice(2),

        name: document.getElementById("activityName").value.trim(),

        activityType: document.getElementById("activityType").value,

        quantity: Number(document.getElementById("quantity").value),

        unit: document.getElementById("unit").value,

        date: document.getElementById("activityDate").value,

        investment: Number(document.getElementById("investment").value),

        description: document.getElementById("description").value.trim(),

        status: "Pending"
    };

    if (
        !activity.name ||
        !activity.date ||
        !Number.isFinite(activity.quantity) ||
        activity.quantity <= 0 ||
        !Number.isFinite(activity.investment) ||
        activity.investment < 0
    ) {
        alert("Please enter valid activity information.");
        return;
    }

    activities.push(activity);
    saveActivities();

    creditForm.reset();
    renderActivities();
});

function updateStatus(id) {
    const activity = activities.find(function (item) {
        return item.id === id;
    });

    if (!activity) {
        return;
    }

    const statuses = ["Pending", "In Progress", "Verified"];

    const currentIndex = statuses.indexOf(activity.status);
    const nextIndex = (currentIndex + 1) % statuses.length;

    const nextStatus = statuses[nextIndex];

    if (nextStatus === "Verified") {
        const confirmed = confirm(
            "Mark this activity as verified? " +
            "Only do this if verification has actually occurred."
        );

        if (!confirmed) {
            return;
        }
    }

    activity.status = nextStatus;

    saveActivities();
    renderActivities();
}

function deleteActivity(id) {
    if (!confirm("Delete this activity?")) {
        return;
    }

    activities = activities.filter(function (activity) {
        return activity.id !== id;
    });

    saveActivities();
    renderActivities();
}

searchActivity.addEventListener("input", renderActivities);

document.getElementById("exportBtn").addEventListener("click", function () {
    if (activities.length === 0) {
        alert("There are no activities to export.");
        return;
    }

    const headers = [
        "Activity",
        "Activity Type",
        "Quantity",
        "Unit",
        "Date",
        "Investment INR",
        "Illustrative Estimate Only",
        "Status",
        "Description"
    ];

    const rows = activities.map(function (activity) {
        return [
            activity.name,
            activity.activityType,
            activity.quantity,
            activity.unit,
            activity.date,
            activity.investment,
            estimateCredits(activity),
            activity.status,
            activity.description
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
    link.download = "green-credit-activities.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
});

renderActivities();