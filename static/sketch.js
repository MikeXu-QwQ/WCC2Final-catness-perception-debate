async function analyzeImage() {

    const input = document.getElementById("imageInput");
    const file = input.files[0];

    if (!file) {
        alert("Please select an image first.");
        return;
    }

    
    const preview = document.getElementById("preview");
    preview.src = URL.createObjectURL(file);

    
    const bgMusic = document.getElementById("bgMusic");
    bgMusic.play().catch(() => {});

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("/predict", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        console.log("Backend response:", data);  

        const dialogueBox = document.getElementById("dialogueBox");
        const winnerBox = document.getElementById("winnerBox");

        dialogueBox.innerHTML = "";
        winnerBox.innerHTML = "";

        const resScore = data.resnet.catness;
        const vitScore = data.vit.catness;

        
        const resnetBubble = document.createElement("div");
        resnetBubble.className = "bubble resnet-bubble";
        resnetBubble.innerText =
            "ResNet: I think catness is " + resScore.toFixed(3) +
            " (Time: " + data.resnet.inference_time + "s)";

        const vitBubble = document.createElement("div");
        vitBubble.className = "bubble vit-bubble";
        vitBubble.innerText =
            "ViT: I perceive catness as " + vitScore.toFixed(3) +
            " (Time: " + data.vit.inference_time + "s)";

        dialogueBox.appendChild(resnetBubble);
        dialogueBox.appendChild(vitBubble);

        
        let winnerText = "";

        if (resScore > vitScore) {
            winnerText = "🏆 ResNet Wins!";
        } else if (vitScore > resScore) {
            winnerText = "🏆 ViT Wins!";
        } else {
            winnerText = "🤝 It's a Tie!";
        }

        winnerBox.innerText = winnerText;

        
        const successSound = document.getElementById("successSound");
        successSound.play().catch(() => {});

    } catch (error) {
        console.error("Error:", error);
        alert("Prediction failed. Check backend.");
    }
}