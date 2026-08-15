import "dotenv/config";
import express from "express";
import { join } from "node:path";
import { RxCompanion } from "./rx-companion.js";
const app = express();
app.use(express.json());
const PORT = parseInt(process.env.PORT ?? "3000", 10);
const AGENT_HOME_DIR = join(import.meta.dirname, "..", "agent-home");
const brain = new RxCompanion({
    agentHomeDir: AGENT_HOME_DIR,
});
async function main() {
    await brain.init();
    console.log(`Rx Companion brain initialized`);
    app.post("/chat", async (req, res) => {
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
    app.get("/medications", async (_req, res) => {
        try {
            const data = await brain.getMedications();
            res.json(data);
        }
        catch (err) {
            const error = err instanceof Error ? err.message : "Internal server error";
            res.status(500).json({ error });
        }
    });
    app.put("/medications", async (req, res) => {
        try {
            await brain.updateMedications(req.body);
            res.json({ status: "ok" });
        }
        catch (err) {
            const error = err instanceof Error ? err.message : "Internal server error";
            res.status(500).json({ error });
        }
    });
    app.get("/facts", async (_req, res) => {
        try {
            const data = await brain.getFacts();
            res.json(data);
        }
        catch (err) {
            const error = err instanceof Error ? err.message : "Internal server error";
            res.status(500).json({ error });
        }
    });
    app.put("/facts", async (req, res) => {
        try {
            await brain.updateFacts(req.body);
            res.json({ status: "ok" });
        }
        catch (err) {
            const error = err instanceof Error ? err.message : "Internal server error";
            res.status(500).json({ error });
        }
    });
    app.post("/reset", async (_req, res) => {
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
        res.json({
            agent: "Rx Companion",
            version: "0.1.0",
            endpoints: {
                "GET  /": "this page",
                "GET  /health": "health check",
                "POST /chat": "send a message to the agent",
                "GET  /medications": "list medications",
                "PUT  /medications": "update medications",
                "GET  /facts": "list facts",
                "PUT  /facts": "update facts",
                "POST /reset": "start a new session",
            },
        });
    });
    app.get("/health", (_req, res) => {
        res.json({ status: "ok", agent: "Rx Companion" });
    });
    app.listen(PORT, () => {
        console.log(`Rx Companion API running on http://localhost:${PORT}`);
    });
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
//# sourceMappingURL=index.js.map