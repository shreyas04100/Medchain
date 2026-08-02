import glob
import time
import json
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
)

DATA_DIR = Path(__file__).parent / "data" / "CICIDS2017"
MODELS_DIR = Path(__file__).parent / "saved_models"
MODELS_DIR.mkdir(exist_ok=True)

MODEL_PATH = MODELS_DIR / "best_model.joblib"
SCALER_PATH = MODELS_DIR / "scaler.joblib"
METRICS_PATH = MODELS_DIR / "training_metrics.json"


def load_and_merge() -> pd.DataFrame:
    files = glob.glob(str(DATA_DIR / "*.csv"))
    if not files:
        raise FileNotFoundError(f"No CSV files found in {DATA_DIR}")
    frames = []
    for f in files:
        try:
            df = pd.read_csv(f, encoding="utf-8", low_memory=False)
            frames.append(df)
            print(f"  Loaded {Path(f).name}: {len(df)} rows")
        except Exception as e:
            print(f"  Warning: could not read {f}: {e}")
    return pd.concat(frames, ignore_index=True)


def preprocess(df: pd.DataFrame):
    df.columns = df.columns.str.strip()

    # Identify label column
    label_col = None
    for candidate in [" Label", "Label", "label"]:
        if candidate in df.columns:
            label_col = candidate
            break
    if label_col is None:
        raise ValueError("Label column not found in dataset")

    # Binary encode: BENIGN=0, everything else=1
    y = (df[label_col].str.strip() != "BENIGN").astype(int).values

    # Select numeric features only
    df_num = df.drop(columns=[label_col]).select_dtypes(include=[np.number])

    # Remove inf and NaN
    df_num.replace([np.inf, -np.inf], np.nan, inplace=True)
    df_num.dropna(axis=1, how="all", inplace=True)
    df_num.fillna(df_num.median(numeric_only=True), inplace=True)

    # Drop duplicate rows
    mask = ~df_num.duplicated()
    df_num = df_num[mask]
    y = y[mask]

    return df_num.values, y, list(df_num.columns)


def train():
    print("Loading and merging datasets...")
    df = load_and_merge()
    print(f"Total rows before preprocessing: {len(df)}")

    print("Preprocessing...")
    X, y, feature_names = preprocess(df)
    print(f"Dataset size after preprocessing: {len(X)} rows, {X.shape[1]} features")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    # Contamination = fraction of anomalies in training set
    contamination = float(np.mean(y_train))
    contamination = max(0.01, min(contamination, 0.5))

    print(f"Training Isolation Forest (contamination={contamination:.4f})...")
    start = time.time()
    model = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        max_samples="auto",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train_s)
    training_time = round(time.time() - start, 2)

    # IsolationForest: -1 = anomaly, 1 = normal → map to 1/0
    raw_pred = model.predict(X_test_s)
    y_pred = np.where(raw_pred == -1, 1, 0)

    acc = round(accuracy_score(y_test, y_pred), 4)
    prec = round(precision_score(y_test, y_pred, zero_division=0), 4)
    rec = round(recall_score(y_test, y_pred, zero_division=0), 4)
    f1 = round(f1_score(y_test, y_pred, zero_division=0), 4)
    cm = confusion_matrix(y_test, y_pred).tolist()

    metrics = {
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "confusion_matrix": cm,
        "training_time_seconds": training_time,
        "dataset_size": int(len(X)),
        "num_features": int(X.shape[1]),
        "feature_names": feature_names,
        "contamination": contamination,
        "model_type": "IsolationForest",
    }

    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\n=== Training Complete ===")
    print(f"Accuracy:  {acc}")
    print(f"Precision: {prec}")
    print(f"Recall:    {rec}")
    print(f"F1 Score:  {f1}")
    print(f"Training Time: {training_time}s")
    print(f"Saved to {MODELS_DIR}")
    return metrics


def load_model():
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    with open(METRICS_PATH) as f:
        metrics = json.load(f)
    return model, scaler, metrics


def get_or_train():
    if MODEL_PATH.exists() and SCALER_PATH.exists() and METRICS_PATH.exists():
        print("Saved model found. Loading...")
        return load_model()
    print("No saved model found. Training...")
    metrics = train()
    return load_model()


if __name__ == "__main__":
    train()
