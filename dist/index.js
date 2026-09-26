import "dotenv/config";
import express from "express";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { RxCompanion } from "./rx-companion.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
// Resolve public folder and agent-home directory safely
const publicDir = existsSync(join(__dirname, "..", "public"))
    ? join(__dirname, "..", "public")
    : join(process.cwd(), "public");
const agentHomeDir = existsSync(join(__dirname, "..", "agent-home"))
    ? join(__dirname, "..", "agent-home")
    : join(process.cwd(), "agent-home");
app.use(express.static(publicDir));
const PORT = parseInt(process.env.PORT ?? "3000", 10);
const brain = new RxCompanion({
    agentHomeDir,
});
let brainInitPromise = null;
let brainInitError = null;
async function ensureBrain() {
    if (brainInitError) {
        throw brainInitError;
    }
    if (!brainInitPromise) {
        brainInitPromise = brain.init().catch((err) => {
            brainInitError = err instanceof Error ? err : new Error(String(err));
            console.error("Rx Companion initialization error:", brainInitError);
            throw brainInitError;
        });
    }
    await brainInitPromise;
}
// Routes registered immediately
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        agent: "Rx Companion",
        initialized: brainInitPromise !== null && brainInitError === null,
    });
});
app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            res.status(400).json({ error: "message is required" });
            return;
        }
        try {
            await ensureBrain();
        }
        catch (initErr) {
            const msg = initErr instanceof Error ? initErr.message : String(initErr);
            res.status(503).json({
                error: `Agent initialization failed: ${msg}. Please ensure your API key (OPENROUTER_API_KEY) is set in your environment variables.`,
            });
            return;
        }
        const reply = await brain.chat(message);
        const response = { reply, sessionId: "default" };
        res.json(response);
    }
    catch (err) {
        const error = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ error });
    }
});
app.get("/api/medications", async (_req, res) => {
    try {
        const data = await brain.getMedications();
        res.json(data);
    }
    catch (err) {
        const error = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ error });
    }
});
app.put("/api/medications", async (req, res) => {
    try {
        await brain.updateMedications(req.body);
        res.json({ status: "ok" });
    }
    catch (err) {
        const error = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ error });
    }
});
app.get("/api/facts", async (_req, res) => {
    try {
        const data = await brain.getFacts();
        res.json(data);
    }
    catch (err) {
        const error = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ error });
    }
});
app.put("/api/facts", async (req, res) => {
    try {
        await brain.updateFacts(req.body);
        res.json({ status: "ok" });
    }
    catch (err) {
        const error = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ error });
    }
});
app.post("/api/reset", async (_req, res) => {
    try {
        await brain.newSession();
        res.json({ status: "ok" });
    }
    catch (err) {
        const error = err instanceof Error ? err.message : "Internal server error";
        res.status(500).json({ error });
    }
});
app.get("/", (_req, res) => {
    res.sendFile(join(publicDir, "index.html"));
});
app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api/") && req.path !== "/health") {
        res.sendFile(join(publicDir, "index.html"));
    }
    else {
        next();
    }
});
// Start listening if not running in serverless / Vercel
if (process.env.VERCEL !== "1") {
    ensureBrain()
        .then(() => console.log("Rx Companion brain initialized"))
        .catch((err) => console.warn("Background brain init warning:", err.message));
    app.listen(PORT, () => {
        console.log(`Rx Companion API running on http://localhost:${PORT}`);
    });
}
process.on("SIGINT", () => {
    brain.dispose();
    process.exit(0);
});
process.on("SIGTERM", () => {
    brain.dispose();
    process.exit(0);
});
export default app;
export { app };
//# sourceMappingURL=index.js.map