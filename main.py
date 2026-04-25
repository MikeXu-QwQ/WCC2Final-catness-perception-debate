# backend/main.py
import torch
import os
import io
import time

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from PIL import Image
from torchvision import transforms
from models import ResNetRegression, ViTRegression

# -----------------------------
# App
# -----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Static files (frontend)
# -----------------------------
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def serve_frontend():
    return FileResponse("static/index.html")

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

RESNET_PATH = os.path.join(BASE_DIR, "weights", "resnet18_regression.pth")
VIT_PATH = os.path.join(BASE_DIR, "weights", "vit_tiny_regression.pth")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# -----------------------------
# Load Models
# -----------------------------
resnet_model = ResNetRegression()
resnet_model.load_state_dict(torch.load(RESNET_PATH, map_location=device))
resnet_model.to(device)
resnet_model.eval()

vit_model = ViTRegression()
vit_model.load_state_dict(torch.load(VIT_PATH, map_location=device))
vit_model.to(device)
vit_model.eval()

# -----------------------------
# Transform
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# -----------------------------
# Predict
# -----------------------------
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    results = {}

    with torch.inference_mode():

        # ResNet
        start = time.time()
        res_output = resnet_model(image)
        res_time = time.time() - start
        results["resnet"] = {
            "catness": round(float(torch.sigmoid(res_output).item()), 3),
            "inference_time": round(res_time, 4)
        }

        # ViT
        start = time.time()
        vit_output = vit_model(image)
        vit_time = time.time() - start
        results["vit"] = {
            "catness": round(float(torch.sigmoid(vit_output).item()), 3),
            "inference_time": round(vit_time, 4)
        }

    return results