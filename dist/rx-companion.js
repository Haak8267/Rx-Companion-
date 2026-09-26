import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { AuthStorage, createAgentSession, DefaultResourceLoader, ModelRegistry, SessionManager, } from "@earendil-works/pi-coding-agent";
export class RxCompanion {
    agentHomeDir;
    session = null;
    provider;
    model;
    memoryDir;
    constructor(config) {
        this.agentHomeDir = resolve(config.agentHomeDir);
        this.provider = config.provider ?? process.env.RX_PROVIDER ?? "openrouter";
        this.model = config.model ?? process.env.RX_MODEL ?? "anthropic/claude-sonnet-4";
        this.memoryDir = join(this.agentHomeDir, "memory");
    }
    async init() {
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
        const result = await createAgentSession({
            cwd: process.cwd(),
            agentDir: this.agentHomeDir,
            model: modelRegistry.find(this.provider, this.model),
            authStorage,
            modelRegistry,
            resourceLoader: loader,
            settingsManager,
            sessionManager: SessionManager.create(join(this.agentHomeDir, "sessions")),
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
        const filePath = join(this.memoryDir, "medications.json");
        const content = await readFile(filePath, "utf-8");
        return JSON.parse(content);
    }
    async updateMedications(data) {
        const filePath = join(this.memoryDir, "medications.json");
        await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    }
    async getFacts() {
        const filePath = join(this.memoryDir, "facts.json");
        const content = await readFile(filePath, "utf-8");
        return JSON.parse(content);
    }
    async updateFacts(data) {
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