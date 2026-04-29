import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const bullyWords = [
  "stupid",
  "idiot",
  "loser",
  "dumb",
  "ugly",
  "hate",
  "moron",
  "bastard",
  "fool",
  "shut up",
];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const maskWord = (word) => "*".repeat(word.length);

const maskBullyWords = (text) => {
  let filteredText = text;

  for (const word of bullyWords) {
    const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi");
    filteredText = filteredText.replace(regex, (match) => maskWord(match));
  }

  return filteredText;
};

export const filterCyberbullyText = async (text) => {
  if (!text || text.trim() === "") {
    return text;
  }

  // Keep Flask out of the picture: run the ML model via a Python stdin/stdout worker
  // so only the Node backend port is used.
  const prediction = await getPredictionFromWorker(text);
  return prediction === 1 ? maskBullyWords(text) : text;
};

let worker = null;
let workerBuffer = "";
let pending = [];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getIntegratedRoot() {
  const __filename = fileURLToPath(import.meta.url);
  const serverLibDir = path.dirname(__filename); // .../chatApplication/server/lib
  // .../integrated-chat-cyberbully-app
  return path.resolve(serverLibDir, "..", "..", "..");
}

function getCyberbullyWorkerPaths() {
  const integratedRoot = getIntegratedRoot();
  const cyberbullyBackendDir = path.join(integratedRoot, "cyberbully-detection-app", "backend");
  const workerScriptPath = path.join(cyberbullyBackendDir, "cyberbully_worker.py");

  const venvPythonPath = path.join(cyberbullyBackendDir, ".venv", "Scripts", "python.exe");
  const pythonPath =
    process.env.CYBERBULLY_PYTHON_PATH?.trim() ||
    (fs.existsSync(venvPythonPath) ? venvPythonPath : "python");

  return { cyberbullyBackendDir, workerScriptPath, pythonPath };
}

async function startWorkerIfNeeded() {
  if (worker) return;

  const { cyberbullyBackendDir, workerScriptPath, pythonPath } = getCyberbullyWorkerPaths();

  if (!fs.existsSync(workerScriptPath)) {
    console.warn(`[cyberbully] worker script not found: ${workerScriptPath}`);
    return;
  }

  console.log(`[cyberbully] Starting Python model worker... (python: ${pythonPath})`);

  worker = spawn(pythonPath, [workerScriptPath], {
    cwd: cyberbullyBackendDir,
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
  });

  worker.stdout.on("data", (chunk) => {
    workerBuffer += chunk.toString("utf8");
    const parts = workerBuffer.split("\n");
    workerBuffer = parts.pop(); // last partial line stays in buffer

    for (const line of parts) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const pendingResolver = pending.shift();
      if (!pendingResolver) continue;

      try {
        const payload = JSON.parse(trimmed);
        pendingResolver.resolve(payload?.prediction);
      } catch {
        pendingResolver.resolve(0);
      }
    }
  });

  worker.stderr.on("data", (chunk) => {
    // Avoid spamming; but keep stderr for debugging.
    console.warn(`[cyberbully worker stderr] ${chunk.toString("utf8").trim()}`);
  });

  worker.on("exit", () => {
    const toResolve = pending;
    pending = [];
    worker = null;
    workerBuffer = "";
    for (const p of toResolve) {
      p.resolve(0);
    }
  });
}

async function getPredictionFromWorker(text) {
  try {
    await startWorkerIfNeeded();
    if (!worker) return 0;

    // Basic safety guard: avoid sending extremely large messages to worker.
    const maxLen = Number(process.env.CYBERBULLY_MAX_TEXT_LEN || 2000);
    const safeText = text.length > maxLen ? text.slice(0, maxLen) : text;

    const timeoutMs = Number(process.env.CYBERBULLY_PREDICT_TIMEOUT_MS || 8000);
    const prediction = await Promise.race([
      new Promise((resolve) => {
        pending.push({ resolve });
        worker.stdin.write(`${JSON.stringify({ text: safeText })}\n`);
      }),
      new Promise(async (resolve) => {
        await sleep(timeoutMs);
        resolve(0);
      }),
    ]);

    return Number(prediction) === 1 ? 1 : 0;
  } catch {
    return 0;
  }
}
