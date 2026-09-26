import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { AuthStorage, createAgentSession, DefaultResourceLoader, ModelRegistry, SessionManager, } from "@earendil-works/pi-coding-agent";
export class RxCompanion {
    agentHomeDir;
    session = null;
    provider;
    model;
    memoryDir;
    isServerless;
    constructor(config) {
        this.agentHomeDir = resolve(config.agentHomeDir);
        this.provider = config.provider ?? process.env.RX_PROVIDER ?? "openrouter";
        this.model = config.model ?? process.env.RX_MODEL ?? "anthropic/claude-sonnet-4";
        this.isServerless = process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
        this.memoryDir = this.isServerless ? "/tmp/rx-companion/memory" : join(this.agentHomeDir, "memory");
    }
    async init() {
        const hasKey = Boolean(process.env.OPENROUTER_API_KEY) ||
            Boolean(process.env.ANTHROPIC_API_KEY) ||
            Boolean(process.env.OPENAI_API_KEY) ||
            Boolean(process.env.GOOGLE_API_KEY);
        if (!hasKey) {
            throw new Error("No AI provider API key found. Please set OPENROUTER_API_KEY in your environment variables.");
        }
        const authStorage = AuthStorage.create();
        if (process.env.OPENROUTER_API_KEY) {
            authStorage.setRuntimeApiKey("openrouter", process.env.OPENROUTER_API_KEY);
        }
        if (process.env.ANTHROPIC_API_KEY) {
            authStorage.setRuntimeApiKey("anthropic", process.env.ANTHROPIC_API_KEY);
        }
        if (process.env.OPENAI_API_KEY) {
            authStorage.setRuntimeApiKey("openai", process.env.OPENAI_API_KEY);
        }
        if (process.env.GOOGLE_API_KEY) {
            authStorage.setRuntimeApiKey("google", process.env.GOOGLE_API_KEY);
        }
        const modelRegistry = ModelRegistry.create(authStorage);
        const loader = new DefaultResourceLoader({
            cwd: process.cwd(),
            agentDir: this.agentHomeDir,
        });
        await loader.reload();
        const settingsManager = await this.loadSettingsManager();
        const sessionsDir = this.isServerless
            ? "/tmp/rx-companion/sessions"
            : join(this.agentHomeDir, "sessions");
        try {
            await mkdir(sessionsDir, { recursive: true });
        }
        catch { }
        const result = await createAgentSession({
            cwd: process.cwd(),
            agentDir: this.agentHomeDir,
            model: modelRegistry.find(this.provider, this.model),
            authStorage,
            modelRegistry,
            resourceLoader: loader,
            settingsManager,
            sessionManager: SessionManager.create(sessionsDir),
            tools: [],
        });
        this.session = result.session;
    }
    async loadSettingsManager() {
        const { SettingsManager } = await import("@earendil-works/pi-coding-agent");
        return SettingsManager.create(process.cwd(), this.agentHomeDir);
    }
    async chat(message) {
        if (!this.session) {
            throw new Error("RxCompanion not initialized. Call init() first.");
        }
        await this.session.prompt(message);
        const allMsgs = this.session.state.messages;
        for (let i = allMsgs.length - 1; i >= 0; i--) {
            const msg = allMsgs[i];
            if (msg && msg.role === "assistant") {
                if (msg.errorMessage)
                    return String(msg.errorMessage);
                const content = msg.content;
                if (typeof content === "string")
                    return content;
                if (Array.isArray(content)) {
                    const texts = content.filter((c) => c.type === "text").map((c) => c.text).join("");
                    if (texts)
                        return texts;
                }
            }
        }
        return "";
    }
    async getMedications() {
        const fallbackPath = join(this.agentHomeDir, "memory", "medications.json");
        const filePath = join(this.memoryDir, "medications.json");
        try {
            if (this.isServerless && !existsSync(filePath) && existsSync(fallbackPath)) {
                await mkdir(this.memoryDir, { recursive: true });
                await copyFile(fallbackPath, filePath);
            }
            const target = existsSync(filePath) ? filePath : fallbackPath;
            const content = await readFile(target, "utf-8");
            return JSON.parse(content);
        }
        catch {
            return {
                schema_version: "0.1",
                note: "Medication records store",
                patients: [],
            };
        }
    }
    async updateMedications(data) {
        await mkdir(this.memoryDir, { recursive: true });
        const filePath = join(this.memoryDir, "medications.json");
        await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    }
    async getFacts() {
        const fallbackPath = join(this.agentHomeDir, "memory", "facts.json");
        const filePath = join(this.memoryDir, "facts.json");
        try {
            if (this.isServerless && !existsSync(filePath) && existsSync(fallbackPath)) {
                await mkdir(this.memoryDir, { recursive: true });
                await copyFile(fallbackPath, filePath);
            }
            const target = existsSync(filePath) ? filePath : fallbackPath;
            const content = await readFile(target, "utf-8");
            return JSON.parse(content);
        }
        catch {
            return {
                schema_version: "0.1",
                note: "Patient facts store",
                primary_user: { role: "", notes: "" },
                household: { other_people_supported: [] },
                preferences: { reminder_style: "", units: "", region_for_emergency_numbers: "" },
            };
        }
    }
    async updateFacts(data) {
        await mkdir(this.memoryDir, { recursive: true });
        const filePath = join(this.memoryDir, "facts.json");
        await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    }
    async newSession() {
        if (this.session) {
            this.session.dispose();
            this.session = null;
        }
        await this.init();
    }
    dispose() {
        this.session?.dispose();
    }
}
//# sourceMappingURL=rx-companion.js.map