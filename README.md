<<<<<<< HEAD
# chat_cyberBully_project
=======
# Integrated Chat + Cyberbully Detection

This folder combines both projects in one place so they feel like a single integrated project.

## Folder Structure

- `chatApplication/client` -> Main chat frontend
- `chatApplication/server` -> Main chat backend (already integrated with bully detection API)
- `cyberbully-detection-app/backend` -> Flask bully detection API used by chat backend
- `cyberbully-detection-app/frontend` -> Original standalone cyberbully demo frontend (optional)

## Run Order

1. (Optional) Train model once
2. Start chat backend (Node). This will auto-start the Python model worker internally.
3. Start chat frontend

## Commands

### 1) (Optional) Train model once

```powershell
cd "cyberbully-detection-app\backend"
.\.venv\Scripts\activate
python train_model.py
```

Note: runtime ke liye `app.py` chalana zaroori nahi hai. Chat backend Node me Python worker use karta hai (taaki extra port na open ho).

### 2) Chat Backend (Node/Express)

```powershell
cd "chatApplication\server"
npm install
npm run server
```

Optional env in `chatApplication/server/.env`:

```env
CYBERBULLY_PREDICT_TIMEOUT_MS=8000
CYBERBULLY_MAX_TEXT_LEN=2000
```

### 3) Chat Frontend (React/Vite)

```powershell
cd "chatApplication\client"
npm install
npm run dev
```

Open the shown localhost URL in browser.

## Expected Behavior

When users send chat text, the chat backend calls the cyberbully API.
If cyberbullying is detected, configured bully words are masked using `*`.
>>>>>>> 05e11fd (CareChat: integrated chat + cyberbully detection)
