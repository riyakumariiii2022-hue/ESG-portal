const LANGUAGE_STORAGE_KEY = "brsrPreferredLanguage";

let currentLanguage = "en-IN";
let recognition = null;


// Navigate back to dashboard

function goBack() {
    window.location.href = "dashboard.html";
}


// Read saved company data

function getCompanyData() {
    try {
        const saved = localStorage.getItem("esgData");

        if (!saved) {
            return null;
        }

        return JSON.parse(saved);
    } catch (error) {
        console.error("Unable to load company data:", error);
        return null;
    }
}


// Get the selected language

function getSelectedLanguage() {
    return document.getElementById("languageSelect").value;
}


// Save and apply language

function applyLanguage() {
    currentLanguage = getSelectedLanguage();

    try {
        localStorage.setItem(
            LANGUAGE_STORAGE_KEY,
            currentLanguage
        );
    } catch (error) {
        console.warn("Could not save language preference:", error);
    }

    const selectedOption =
        document.getElementById("languageSelect")
            .selectedOptions[0];

    document.getElementById("languageMessage").textContent =
        "Selected language: " + selectedOption.textContent;

    document.getElementById("speechMessage").textContent =
        "Language preference applied. Speech availability depends on your browser.";

    if (recognition) {
        recognition.lang = currentLanguage;
    }
}


// Load saved language

function loadLanguagePreference() {
    try {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);

        const select = document.getElementById("languageSelect");

        if (
            saved &&
            Array.from(select.options).some(option => option.value === saved)
        ) {
            select.value = saved;
        }
    } catch (error) {
        console.warn("Could not load language preference:", error);
    }

    currentLanguage = getSelectedLanguage();
    applyLanguage();
}


// Read text aloud

function readAloud(text) {
    if (!("speechSynthesis" in window)) {
        document.getElementById("speechMessage").textContent =
            "Text-to-speech is not supported by this browser.";

        return;
    }

    const textToRead = String(text || "").trim();

    if (!textToRead) {
        document.getElementById("speechMessage").textContent =
            "Please enter text or generate a company summary first.";

        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToRead);

    utterance.lang = currentLanguage;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = function () {
        document.getElementById("speechMessage").textContent =
            "Reading aloud...";
    };

    utterance.onend = function () {
        document.getElementById("speechMessage").textContent =
            "Finished reading.";
    };

    utterance.onerror = function (event) {
        document.getElementById("speechMessage").textContent =
            "Speech could not be completed: " + event.error;
    };

    window.speechSynthesis.speak(utterance);
}


// Stop speech output

function stopSpeech() {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();

        document.getElementById("speechMessage").textContent =
            "Speech stopped.";
    }
}


// Format values for spoken output

function formatSpokenValue(value) {
    if (
        value === undefined ||
        value === null ||
        value === "" ||
        !Number.isFinite(Number(value))
    ) {
        return "not available";
    }

    return Number(value).toLocaleString("en-IN");
}


// Generate a company summary

function generateCompanySummary() {
    const data = getCompanyData();

    if (!data) {
        const message =
            "No company information has been saved yet. " +
            "Please enter company information on the main page first.";

        document.getElementById("speechText").value = message;
        readAloud(message);

        return;
    }

    const environmental = data.environmental || {};
    const social = data.social || {};

    const companyName = data.companyName || "Company not entered";
    const year = data.financialYear || "Financial year not entered";

    const summary =
        "Company summary. " +
        "Company name: " + companyName + ". " +
        "Financial year: " + year + ". " +
        "Energy consumption: " +
        formatSpokenValue(environmental.energy) + ". " +
        "Water consumption: " +
        formatSpokenValue(environmental.water) + ". " +
        "Number of employees: " +
        formatSpokenValue(social.employees) + ". " +
        "Recorded safety incidents: " +
        formatSpokenValue(social.safety) + ". " +
        "These are saved prototype values and have not been independently verified.";

    document.getElementById("speechText").value = summary;

    readAloud(summary);
}


// Start voice recognition

function startListening() {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        document.getElementById("voiceStatus").textContent =
            "Voice recognition is unavailable";

        document.getElementById("voiceDescription").textContent =
            "Try a supported browser, or type your text in the box above.";

        return;
    }

    if (recognition) {
        try {
            recognition.abort();
        } catch (error) {
            console.warn(error);
        }
    }

    recognition = new SpeechRecognition();

    recognition.lang = currentLanguage;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {
        document.getElementById("voiceStatus").textContent =
            "Listening...";

        document.getElementById("voiceDescription").textContent =
            "Speak your command now.";

        document.getElementById("transcript").textContent =
            "Listening for speech...";
    };

    recognition.onresult = function (event) {
        const transcript =
            event.results[0][0].transcript.trim();

        document.getElementById("transcript").textContent =
            transcript;

        handleVoiceCommand(transcript);
    };

    recognition.onerror = function (event) {
        document.getElementById("voiceStatus").textContent =
            "Voice input error";

        document.getElementById("voiceDescription").textContent =
            "Error: " + event.error +
            ". Check microphone permissions and browser support.";
    };

    recognition.onend = function () {
        document.getElementById("voiceStatus").textContent =
            "Voice input is ready";
    };

    try {
        recognition.start();
    } catch (error) {
        document.getElementById("voiceDescription").textContent =
            "Could not start voice input. Please try again.";
    }
}


// Stop voice recognition

function stopListening() {
    if (recognition) {
        recognition.stop();
    }

    document.getElementById("voiceStatus").textContent =
        "Listening stopped";

    document.getElementById("voiceDescription").textContent =
        "Press Start Listening when you are ready.";
}


// Handle simple English voice commands

function handleVoiceCommand(command) {
    const text = command.toLowerCase();
    const data = getCompanyData();

    if (
        text.includes("summary") ||
        text.includes("company")
    ) {
        generateCompanySummary();
        return;
    }

    if (!data) {
        const message =
            "No company information is available. Please enter company data first.";

        document.getElementById("speechText").value = message;
        readAloud(message);

        return;
    }

    const environmental = data.environmental || {};
    const social = data.social || {};

    let message = "";

    if (text.includes("energy")) {
        message =
            "The recorded energy consumption is " +
            formatSpokenValue(environmental.energy) + ".";
    } else if (text.includes("water")) {
        message =
            "The recorded water consumption is " +
            formatSpokenValue(environmental.water) + ".";
    } else if (text.includes("employee") || text.includes("workforce")) {
        message =
            "The recorded employee count is " +
            formatSpokenValue(social.employees) + ".";
    } else if (text.includes("safety") || text.includes("incident")) {
        message =
            "The recorded safety incident count is " +
            formatSpokenValue(social.safety) + ".";
    } else {
        message =
            "Sorry, I did not recognize that command. " +
            "Try company summary, energy, water, employees, or safety.";
    }

    document.getElementById("speechText").value = message;

    readAloud(message);
}


// Event listeners

document.getElementById("applyLanguage")
    .addEventListener("click", applyLanguage);

document.getElementById("readButton")
    .addEventListener("click", function () {
        readAloud(document.getElementById("speechText").value);
    });

document.getElementById("stopButton")
    .addEventListener("click", stopSpeech);

document.getElementById("summaryButton")
    .addEventListener("click", generateCompanySummary);

document.getElementById("startListeningButton")
    .addEventListener("click", startListening);

document.getElementById("stopListeningButton")
    .addEventListener("click", stopListening);


// Initial setup

loadLanguagePreference();