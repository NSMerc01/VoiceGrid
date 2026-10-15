
const grid = document.getElementById("grid");
const status = document.getElementById("status");

const rows = "ABCDEFGHIJ";
const columns = 23;

// Store all 230 circles
const circles = {};

// Create column labels 1 through 23
const corner = document.createElement("div");
grid.appendChild(corner);

for (let col = 1; col <= columns; col++) {
    const label = document.createElement("div");
    label.className = "column-label";
    label.textContent = col;
    grid.appendChild(label);
}

// Create 10 rows, A through J
for (const row of rows) {

    // Create the row label
    const rowLabel = document.createElement("div");
    rowLabel.className = "row-label";
    rowLabel.textContent = row;
    grid.appendChild(rowLabel);

    // Create 23 circles in each row
    for (let col = 1; col <= columns; col++) {

        const circle = document.createElement("div");
        circle.className = "circle";

        // Example: B9
        const coordinate = row + col;
        circle.id = coordinate;

        // Store the circle for later use
        circles[coordinate] = circle;

        grid.appendChild(circle);
    }
}

// Keep track of the selected circle
let selectedCircle = null;

// Select a circle by coordinate
function selectCircle(coordinate) {

    coordinate = coordinate.toUpperCase();

    const circle = circles[coordinate];

    if (!circle) {
        status.textContent =
            "Invalid coordinate: " + coordinate;
        return;
    }

    circle.classList.remove("completed");
    circle.classList.add("selected");

    selectedCircle = circle;

    status.textContent =
        coordinate + " selected";
}

// Mark the selected circle as completed
function markDone() {

    if (!selectedCircle) {
        status.textContent = "No circle selected";
        return;
    }

    selectedCircle.classList.remove("selected");
    selectedCircle.classList.add("completed");

    status.textContent =
        selectedCircle.id + " completed";

    selectedCircle = null;
}

// Temporary keyboard testing
document.addEventListener("keydown", function(event) {

    // Press Enter to complete the selected circle
    if (event.key === "Enter") {
        markDone();
    }
});

const startButton = document.getElementById("startButton");

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    status.textContent =
        "Speech recognition is not supported in this browser.";
    startButton.disabled = true;
} else {
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    let listening = false;
    let shouldListen = false;

    recognition.onstart = function() {
        listening = true;
        startButton.textContent = "Stop Listening";
        status.textContent = "Listening...";
    };

    recognition.onresult = function(event) {
        for (let i = event.resultIndex;
             i < event.results.length; i++) {

            if (!event.results[i].isFinal) continue;

            const spoken = event.results[i][0].transcript
                .trim()
                .toUpperCase();

            if (/\bDONE\b/.test(spoken)) {
                markDone();
                continue;
            }

            const normalized = spoken
                .replace(/\bONE\b/g, "1")
                .replace(/\bTWO\b/g, "2")
                .replace(/\bTHREE\b/g, "3")
                .replace(/\bFOUR\b/g, "4")
                .replace(/\bFIVE\b/g, "5")
                .replace(/\bSIX\b/g, "6")
                .replace(/\bSEVEN\b/g, "7")
                .replace(/\bEIGHT\b/g, "8")
                .replace(/\bNINE\b/g, "9")
                .replace(/\bTEN\b/g, "10");

            const match = normalized.match(
                /\b([A-J])[\s,.-]*(2[0-3]|1[0-9]|[1-9])\b/
            );

            if (match) {
                selectCircle(match[1] + match[2]);
            } else {
                status.textContent =
                    "Not recognized: " + spoken;
            }
        }
    };

    recognition.onerror = function(event) {
        status.textContent =
            "Microphone error: " + event.error;

        if (event.error === "not-allowed" ||
            event.error === "service-not-allowed") {
            shouldListen = false;
        }
    };

    recognition.onend = function() {
        listening = false;

        if (shouldListen) {
            try {
                recognition.start();
            } catch (error) {
                status.textContent =
                    "Could not restart listening.";
            }
        } else {
            startButton.textContent = "Start Listening";
        }
    };

    startButton.addEventListener("click", function() {
        if (shouldListen) {
            shouldListen = false;
            if (listening) recognition.stop();
            startButton.textContent = "Start Listening";
            status.textContent = "Stopped";
        } else {
            shouldListen = true;
            recognition.start();
        }
    });
}

