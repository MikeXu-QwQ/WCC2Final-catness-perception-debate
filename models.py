# backend/models.py

import torch
import torch.nn as nn
import timm


class ResNetRegression(nn.Module):
    def __init__(self):
        super().__init__()

        self.backbone = timm.create_model(
            "resnet18",
            pretrained=False,
            num_classes=0
        )

        self.regressor = nn.Linear(self.backbone.num_features, 1)

    def forward(self, x):
        features = self.backbone(x)
        output = self.regressor(features)
        return output
    
    

class ViTRegression(nn.Module):
    def __init__(self):
        super().__init__()

        self.backbone = timm.create_model(
            "vit_tiny_patch16_224",
            pretrained=False,
            num_classes=0
        )

        self.regressor = nn.Linear(self.backbone.num_features, 1)

    def forward(self, x):
        features = self.backbone(x)
        return self.regressor(features)