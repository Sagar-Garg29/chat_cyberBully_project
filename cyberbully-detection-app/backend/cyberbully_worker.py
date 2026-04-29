import sys
import json
import os

import joblib


def load_model():
    # By default look for model next to this script.
    model_path = os.environ.get("CYBERBULLY_MODEL_PATH", "cyberbully_model.pkl")
    return joblib.load(model_path)


MODEL = load_model()


def predict_one(text: str) -> int:
    # Model predicts 1 => Cyberbullying Detected, 0 => Safe / Non-Bullying
    pred = MODEL.predict([text])[0]
    return int(pred)


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            payload = json.loads(line)
            text = payload.get("text", "")
            if not text:
                out = {"prediction": 0}
            else:
                out = {"prediction": predict_one(text)}
        except Exception:
            out = {"prediction": 0}

        sys.stdout.write(json.dumps(out) + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    main()

