let catnessChart;
let timeChart;

function renderCharts(data) {

    const catnessCtx = document.getElementById('catnessChart');
    const timeCtx = document.getElementById('timeChart');

    if (catnessChart) catnessChart.destroy();
    if (timeChart) timeChart.destroy();

    catnessChart = new Chart(catnessCtx, {
        type: 'bar',
        data: {
            labels: ['ResNet', 'ViT'],
            datasets: [{
                label: 'Catness Score',
                data: [data.resnet.catness, data.vit.catness],
                backgroundColor: ['#4f46e5', '#16a34a']
            }]
        },
        options: {
            scales: {
                y: { min: 0, max: 1 }
            }
        }
    });

    timeChart = new Chart(timeCtx, {
        type: 'bar',
        data: {
            labels: ['ResNet', 'ViT'],
            datasets: [{
                label: 'Inference Time (seconds)',
                data: [data.resnet.inference_time, data.vit.inference_time],
                backgroundColor: ['#ef4444', '#f59e0b']
            }]
        }
    });

    document.getElementById("result-text").innerHTML =
        `<strong>ResNet:</strong> ${data.resnet.catness.toFixed(3)} 
         <br>
         <strong>ViT:</strong> ${data.vit.catness.toFixed(3)}`;
}

async function uploadImage() {

    const fileInput = document.getElementById("imageInput");
    const preview = document.getElementById("preview");

    if (fileInput.files.length === 0) {
        alert("Please select an image.");
        return;
    }

    const file = fileInput.files[0];

    // ✅ 图片预览
    preview.src = URL.createObjectURL(file);

    const formData = new FormData();
    formData.append("file", file);

   const response = await fetch("/predict", {
    method: "POST",
    body: formData
    });

    const data = await response.json();

    renderCharts(data);
}