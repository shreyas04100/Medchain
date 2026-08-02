from datetime import datetime, timezone
import os
from typing import Any
import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from train import get_or_train

app = FastAPI(title="MedChain Sentinel AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load or train model at startup
model, scaler, metrics = get_or_train()
feature_names: list[str] = metrics.get("feature_names", [])
num_features: int = metrics.get("num_features", 0)


class PredictRequest(BaseModel):
    features: list[float]


class AnalyzeRequest(BaseModel):
    records: list[list[float]]


def _score_to_level(score: float) -> str:
    if score >= 0.75:
        return "CRITICAL"
    if score >= 0.5:
        return "HIGH"
    if score >= 0.25:
        return "MEDIUM"
    return "LOW"


def _predict_single(features: list[float]) -> dict[str, Any]:
    if len(features) != num_features:
        raise HTTPException(
            status_code=422,
            detail=f"Expected {num_features} features, got {len(features)}",
        )
    arr = np.array(features).reshape(1, -1)
    arr_s = scaler.transform(arr)
    raw = model.predict(arr_s)[0]          # -1 anomaly, 1 normal
    score_raw = model.score_samples(arr_s)[0]  # more negative = more anomalous

    # Normalise score_raw to [0,1] risk score
    # Typical range for IsolationForest score_samples is roughly [-0.5, 0.5]
    risk_score = float(np.clip((-score_raw + 0.5) / 1.0, 0.0, 1.0))
    is_anomaly = raw == -1
    confidence = round(abs(score_raw) * 2, 4)
    confidence = min(confidence, 1.0)

    return {
        "prediction": "ANOMALY" if is_anomaly else "NORMAL",
        "risk_score": round(risk_score, 4),
        "risk_level": _score_to_level(risk_score),
        "confidence": round(confidence, 4),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.get("/model-info")
def model_info():
    return {
        "model_type": metrics.get("model_type"),
        "num_features": num_features,
        "dataset_size": metrics.get("dataset_size"),
        "training_time_seconds": metrics.get("training_time_seconds"),
        "accuracy": metrics.get("accuracy"),
        "precision": metrics.get("precision"),
        "recall": metrics.get("recall"),
        "f1_score": metrics.get("f1_score"),
        "confusion_matrix": metrics.get("confusion_matrix"),
        "contamination": metrics.get("contamination"),
    }


@app.post("/predict")
def predict(req: PredictRequest):
    return _predict_single(req.features)


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    results = [_predict_single(row) for row in req.records]
    anomaly_count = sum(1 for r in results if r["prediction"] == "ANOMALY")
    avg_risk = round(sum(r["risk_score"] for r in results) / len(results), 4) if results else 0.0
    return {
        "total": len(results),
        "anomalies": anomaly_count,
        "normal": len(results) - anomaly_count,
        "average_risk_score": avg_risk,
        "overall_risk_level": _score_to_level(avg_risk),
        "predictions": results,
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=False)
