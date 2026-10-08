function goBack() {
    window.location.href = "dashboard.html";
}

const comparisonForm = document.getElementById("comparisonForm");

const year1 = document.getElementById("year1");
const year2 = document.getElementById("year2");

function updateYearHeadings() {
    document.getElementById("previousHeading").textContent =
        "Previous Year: " + year1.value;

    document.getElementById("currentHeading").textContent =
        "Current Year: " + year2.value;
}

year1.addEventListener("change", updateYearHeadings);
year2.addEventListener("change", updateYearHeadings);

updateYearHeadings();

comparisonForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (year1.value === year2.value) {
        alert("Please select two different financial years.");
        return;
    }

    const metrics = [
        {
            name: "Energy Consumption",
            id1: "energy1",
            id2: "energy2",
            unit: "kWh",
            lowerIsBetter: true
        },
        {
            name: "Water Consumption",
            id1: "water1",
            id2: "water2",
            unit: "litres",
            lowerIsBetter: true
        },
        {
            name: "Total Employees",
            id1: "employees1",
            id2: "employees2",
            unit: "employees",
            lowerIsBetter: false
        },
        {
            name: "Safety Incidents",
            id1: "safety1",
            id2: "safety2",
            unit: "incidents",
            lowerIsBetter: true
        }
    ];

    const results = [];

    for (const metric of metrics) {
        const previous = Number(
            document.getElementById(metric.id1).value
        );

        const current = Number(
            document.getElementById(metric.id2).value
        );

        if (
            !Number.isFinite(previous) ||
            !Number.isFinite(current) ||
            previous < 0 ||
            current < 0
        ) {
            alert("Please enter valid, non-negative values.");
            return;
        }

        if (
            metric.unit === "employees" ||
            metric.unit === "incidents"
        ) {
            if (
                !Number.isInteger(previous) ||
                !Number.isInteger(current)
            ) {
                alert(
                    "Employee and safety incident counts must be whole numbers."
                );
                return;
            }
        }

        const difference = current - previous;

        // Percentage change is undefined when the previous value is zero.
        const percentageChange = previous === 0
            ? null
            : (difference / previous) * 100;

        let status;

        if (difference === 0) {
            status = "Unchanged";
        } else if (
            (difference < 0 && metric.lowerIsBetter) ||
            (difference > 0 && !metric.lowerIsBetter)
        ) {
            status = "Improved based on this metric";
        } else {
            status = "Increased/decreased; review context";
        }

        results.push({
            ...metric,
            previous,
            current,
            difference,
            percentageChange,
            status
        });
    }

    displayResults(results);
});

function formatNumber(value) {
    return value.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

function displayResults(results) {
    const container = document.getElementById("results");

    let html = `
        <p>
            Comparing <strong>${year1.value}</strong> with
            <strong>${year2.value}</strong>
        </p>

        <div class="result-table-wrapper">
            <table class="result-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>${year1.value}</th>
                        <th>${year2.value}</th>
                        <th>Change</th>
                        <th>Percentage Change</th>
                        <th>Interpretation</th>
                    </tr>
                </thead>
                <tbody>
    `;

    results.forEach(function (item) {
        const change = item.difference;
        const changeClass = change < 0
            ? "decrease"
            : change > 0
                ? "increase"
                : "unchanged";

        const percentage = item.percentageChange === null
            ? "N/A (previous value is zero)"
            : (
                (item.percentageChange > 0 ? "+" : "") +
                item.percentageChange.toFixed(2) +
                "%"
            );

        html += `
            <tr>
                <td>${item.name}</td>
                <td>${formatNumber(item.previous)} ${item.unit}</td>
                <td>${formatNumber(item.current)} ${item.unit}</td>
                <td class="${changeClass}">
                    ${change > 0 ? "+" : ""}${formatNumber(change)}
                    ${item.unit}
                </td>
                <td>${percentage}</td>
                <td>${item.status}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>

        <div class="summary">
            <strong>How to read these results</strong>
            <p>
                A decrease in energy, water, or safety incidents may be
                positive, but the result should be checked against business
                activity, reporting boundaries, and data quality.
            </p>
            <p>
                An increase in employee count is not automatically an
                improvement in overall ESG performance.
            </p>
        </div>
    `;

    container.innerHTML = html;
}