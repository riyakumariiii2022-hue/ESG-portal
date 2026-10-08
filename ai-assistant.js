const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");

function goBack() {
    window.location.href = "dashboard.html";
}

function getAnswer(question) {
    const text = question.toLowerCase();

    if (text.includes("brsr")) {
        return "BRSR stands for Business Responsibility and Sustainability Reporting. It helps eligible listed companies report their performance on environmental, social, and governance matters.";
    }

    if (text.includes("esg")) {
        return "ESG stands for Environmental, Social, and Governance. Environmental covers areas such as energy and water. Social includes employee welfare and safety. Governance covers ethical business practices and accountability.";
    }

    if (text.includes("carbon")) {
        return "A carbon footprint represents greenhouse gas emissions associated with an activity, organization, or product. Reliable calculations need suitable activity data and appropriate emission factors.";
    }

    if (text.includes("water")) {
        return "Water-related ESG information may include water withdrawal, consumption, recycling, and discharge. The reporting boundary and units should be clearly defined.";
    }

    if (text.includes("energy")) {
        return "Energy-related reporting may include electricity consumption, fuel use, renewable energy, and energy intensity. Keep the reporting period and measurement units consistent.";
    }

    if (text.includes("governance")) {
        return "Governance covers how an organization is managed, including board oversight, business ethics, accountability, and mechanisms for raising concerns.";
    }

    if (text.includes("social") || text.includes("employee")) {
        return "Social ESG information can cover employee welfare, diversity, training, health and safety, and community-related impacts.";
    }

    return "I can currently answer basic demo questions about BRSR, ESG, carbon footprint, water, energy, social responsibility, and governance. Try asking about one of these topics.";
}

chatForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const question = userInput.value.trim();

    if (!question) {
        return;
    }

    addMessage(question, "user");

    const answer = getAnswer(question);

    addMessage(answer, "bot");

    userInput.value = "";
    userInput.focus();
});

function addMessage(text, type) {
    const message = document.createElement("div");

    message.className = "message " + type;
    message.textContent = text;

    chatMessages.appendChild(message);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}