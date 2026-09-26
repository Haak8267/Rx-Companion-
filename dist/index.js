import "dotenv/config";
import express from "express";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { RxCompanion } from "./rx-companion.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, "..", "public")));
const PORT = parseInt(process.env.PORT ?? "3000", 10);
const AGENT_HOME_DIR = join(import.meta.dirname, "..", "agent-home");
const brain = new RxCompanion({
    agentHomeDir: AGENT_HOME_DIR,
});
async function main() {
    await brain.init();
    console.log(`Rx Companion brain initialized`);
    app.post("/api/chat", async (req, res) => {
        try {
            const { message } = req.body;
            if (!message) {
                res.status(400).json({ error: "message is required" });
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
        res.sendFile(join(__dirname, "..", "public", "index.html"));
    });
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", agent: "Rx Companion" });
    });
    app.use((req, res, next) => {
        if (req.method === "GET" && !req.path.startsWith("/api/") && req.path !== "/health") {
            res.sendFile(join(__dirname, "..", "public", "index.html"));
        }
        else {
            next();
        }
    });
    if (process.env.VERCEL !== "1") {
        app.listen(PORT, () => {
            console.log(`Rx Companion API running on http://localhost:${PORT}`);
        });
    }
}
main().catch((err) => {
    console.error("Failed to start Rx Companion:", err);
    brain.dispose();
    process.exit(1);
});
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