const uploadForm = document.getElementById("uploadForm");
const pdfFile = document.getElementById("pdfFile");
const fileName = document.getElementById("fileName");
const uploadBtn = document.getElementById("uploadBtn");
const statusMessage = document.getElementById("statusMessage");
const resultCard = document.getElementById("resultCard");

pdfFile.addEventListener("change", () => {
    const file = pdfFile.files[0];

    fileName.textContent = file
        ? file.name
        : "PDF files only";

    statusMessage.textContent = "";
});

uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = pdfFile.files[0];

    if (!file) {
        statusMessage.textContent = "Please select a PDF file.";
        return;
    }

    if (file.type !== "application/pdf" ||
        !file.name.toLowerCase().endsWith(".pdf")) {
        statusMessage.textContent = "Please select a valid PDF file.";
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        statusMessage.textContent = "The PDF must be smaller than 10 MB.";
        return;
    }

    const formData = new FormData();
    formData.append("report", file);

    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading and extracting...";
    statusMessage.textContent = "Please wait while the server processes your report.";
    resultCard.hidden = true;

    try {
        const response = await fetch("/api/reports/upload", {
            method: "POST",
            body: formData,
            credentials: "same-origin"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Upload failed.");
        }

        document.getElementById("resultMessage").textContent =
            `Processed file: ${data.fileName}`;

        document.getElementById("charCount").textContent =
            Number(data.characterCount).toLocaleString();

        document.getElementById("wordCount").textContent =
            Number(data.wordCount).toLocaleString();

        document.getElementById("extractedText").textContent =
            data.text || "No text was extracted from this PDF.";

        resultCard.hidden = false;
        statusMessage.textContent = data.text
            ? "PDF uploaded and text extracted successfully!"
            : "PDF uploaded, but no readable text was found. It may be a scanned document.";

    } catch (error) {
        statusMessage.textContent =
            error.message || "Cannot connect to the backend server.";
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Upload & Extract Text";
    }
});