import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CYBERBULLY_API_URL_DEFAULT = "http://127.0.0.1:5000/predict";

let startedChild = null;

async function isApiUp(apiUrl) {
  const endpoint = apiUrl || CYBERBULLY_API_URL_DEFAULT;

  // If Flask is running, this will return either 200 (for valid input)
  // or 400 (if input validation fails). Both indicate the server is up.
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "hello" }),
    });
    return res.ok || res.status === 400;
  } catch {
    return false;
  }
}

export async function startCyberbullyApiIfNeeded() {
  const autoStart = process.env.CYBERBULLY_AUTO_START;
  if (autoStart === "false") return null;

  const apiUrl = process.env.CYBERBULLY_API_URL?.trim() || CYBERBULLY_API_URL_DEFAULT;

  // Avoid spawning duplicates if user already started Flask.
  if (await isApiUp(apiUrl)) return null;

  if (startedChild) return startedChild;

  const __filename = fileURLToPath(import.meta.url);
  const serverLibDir = path.dirname(__filename); // .../chatApplication/server/lib

  const integratedRoot = path.resolve(serverLibDir, "..", "..", ".."); // .../integrated-chat-cyberbully-app
  const cyberbullyBackendDir = path.join(
    integratedRoot,
    "cyberbully-detection-app",
    "backend",
  );
  const appPyPath = path.join(cyberbullyBackendDir, "app.py");

  const venvPythonPath = path.join(
    cyberbullyBackendDir,
    ".venv",
    "Scripts",
    "python.exe",
  );

  const pythonPath =
    process.env.CYBERBULLY_PYTHON_PATH?.trim() ||
    (fs.existsSync(venvPythonPath) ? venvPythonPath : "python");

  if (!fs.existsSync(appPyPath)) {
    console.warn(
      `[cyberbully] app.py not found at: ${appPyPath}. Skipping auto-start.`,
    );
    return null;
  }

  console.log(`[cyberbully] Starting Flask API... (python: ${pythonPath})`);
  startedChild = spawn(pythonPath, [appPyPath], {
    cwd: cyberbullyBackendDir,
    stdio: "inherit",
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
  });

  const timeoutMs = Number(process.env.CYBERBULLY_START_TIMEOUT_MS || 15000);
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    // Wait until Flask is actually reachable before continuing.
    if (await isApiUp(apiUrl)) {
      console.log("[cyberbully] Flask API is up.");
      return startedChild;
    }
    await sleep(500);
  }

  console.warn("[cyberbully] Flask API did not become ready in time.");
  return startedChild;
}

