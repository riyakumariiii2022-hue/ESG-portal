function checkContradiction() {

    const metric = document.getElementById("metric").value;

    const value1 = Number(document.getElementById("source1").value);
    const value2 = Number(document.getElementById("source2").value);
    const value3 = Number(document.getElementById("source3").value);

    const result = document.getElementById("result");

    const resultIcon = document.getElementById("resultIcon");
    const resultTitle = document.getElementById("resultTitle");
    const resultMessage = document.getElementById("resultMessage");
    const resultDetails = document.getElementById("resultDetails");


    // Check empty values

    if (
        document.getElementById("source1").value === "" ||
        document.getElementById("source2").value === "" ||
        document.getElementById("source3").value === ""
    ) {

        alert("Please enter all three source values.");

        return;
    }


    result.classList.remove("hidden");


    // Check whether all values are same

    if (
        value1 === value2 &&
        value2 === value3
    ) {

        result.className = "result no-conflict";

        resultIcon.textContent = "✓";

        resultTitle.textContent = "No Conflict Detected";

        resultMessage.textContent =
            "All sources contain the same value.";

        resultDetails.innerHTML =
            "<strong>" + metric + "</strong><br><br>" +
            "HR / Internal Report: " + value1 + "<br>" +
            "Annual Report: " + value2 + "<br>" +
            "BRSR Data: " + value3;

    }

    else {

        result.className = "result conflict";

        resultIcon.textContent = "⚠️";

        resultTitle.textContent = "CONFLICT DETECTED";

        resultMessage.textContent =
            "The same ESG metric has different values across sources. Please verify before BRSR submission.";

        resultDetails.innerHTML =
            "<strong>" + metric + "</strong><br><br>" +
            "HR / Internal Report: " + value1 + "<br>" +
            "Annual Report: " + value2 + "<br>" +
            "BRSR Data: " + value3 +
            "<br><br>" +
            "<strong>Action Required:</strong> Verify the source data and supporting evidence.";

    }

}


function goDashboard() {

    window.location.href = "dashboard.html";

}