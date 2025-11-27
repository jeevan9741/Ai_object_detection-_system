document.getElementById("ai").addEventListener("change", toggleAi);
document.getElementById("fps").addEventListener("input", changeFps);

const video = document.getElementById("video");
const c1 = document.getElementById("c1");
const ctx1 = c1.getContext("2d");

let cameraAvailable = false;
let aiEnabled = false;
let fps = 50; // default slider value
let detecting = false; // prevents overlapping AI calls

/* Camera settings */
let facingMode = "environment";
let constraints = {
    audio: false,
    video: { facingMode: facingMode }
};

/* Start camera */
function camera() {
    if (!cameraAvailable) {
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(stream => {
                cameraAvailable = true;
                video.srcObject = stream;
            })
            .catch(err => {
                cameraAvailable = false;
                if (modelIsLoaded && err.name === "NotAllowedError") {
                    document.getElementById("loadingText").innerText =
                        "Waiting for camera permission...";
                }
                setTimeout(camera, 1000);
            });
    }
}

camera();

/* Main loop */
window.onload = function () {
    timerCallback();
};

function timerCallback() {
    if (isReady()) {
        setResolution();
        ctx1.drawImage(video, 0, 0, c1.width, c1.height);

        if (aiEnabled && !detecting) {
            detecting = true;

            ai().then(() => {
                detecting = false;
            });
        }
    }
    setTimeout(timerCallback, 1000 / fps); // correct FPS handling
}

/* Check if model + camera are ready */
function isReady() {
    if (modelIsLoaded && cameraAvailable) {
        document.getElementById("loadingText").style.display = "none";
        document.getElementById("ai").disabled = false;
        return true;
    }
    return false;
}

/* Dynamically adjust canvas */
function setResolution() {
    if (video.videoWidth && video.videoHeight) {
        c1.width = video.videoWidth;
        c1.height = video.videoHeight;
    }
}

/* Toggle AI */
function toggleAi() {
    aiEnabled = document.getElementById("ai").checked;
}

/* Change FPS */
function changeFps() {
    fps = parseInt(document.getElementById("fps").value);
}

/* AI function */
async function ai() {
    try {
        const results = await objectDetector.detect(c1);

        ctx1.lineWidth = 2;
        ctx1.font = "15px Arial";

        results.forEach(obj => {
            ctx1.strokeStyle = "red";
            ctx1.fillStyle = "red";

            ctx1.beginPath();
            ctx1.rect(obj.x, obj.y, obj.width, obj.height);
            ctx1.stroke();

            ctx1.fillText(
                `${obj.label} - ${(obj.confidence * 100).toFixed(1)}%`,
                obj.x + 5,
                obj.y + 15
            );

            console.log(obj.label);
        });
    } catch (error) {
        console.error("Detection error:", error);
    }
}
