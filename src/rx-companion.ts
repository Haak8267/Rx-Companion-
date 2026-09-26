import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  AuthStorage,
  createAgentSession,
  DefaultResourceLoader,
  ModelRegistry,
  SessionManager,
  type AgentSession,
  type CreateAgentSessionResult,
} from "@earendil-works/pi-coding-agent";
import type { FactsDb, MedicationsDb } from "./types.js";

export interface RxCompanionConfig {
  agentHomeDir: string;
  provider?: string;
  model?: string;
}

export class RxCompanion {
  private agentHomeDir: string;
  private session: AgentSession | null = null;
  private provider: string;
  private model: string;
  private memoryDir: string;

  constructor(config: RxCompanionConfig) {
    this.agentHomeDir = resolve(config.agentHomeDir);
    this.provider = config.provider ?? process.env.RX_PROVIDER ?? "openrouter";
    this.model = config.model ?? process.env.RX_MODEL ?? "anthropic/claude-sonnet-4";
    this.memoryDir = join(this.agentHomeDir, "memory");
  }

  async init(): Promise<void> {
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

    const result: CreateAgentSessionResult = await createAgentSession({
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

  private async loadSettingsManager() {
    const { SettingsManager } = await import("@earendil-works/pi-coding-agent");
    return SettingsManager.create(process.cwd(), this.agentHomeDir);
  }

  async chat(message: string): Promise<string> {
    if (!this.session) {
      throw new Error("RxCompanion not initialized. Call init() first.");
    }

    await this.session.prompt(message);

    const allMsgs = this.session.state.messages;
    for (let i = allMsgs.length - 1; i >= 0; i--) {
      const msg = allMsgs[i] as any;
      if (msg && msg.role === "assistant") {
        if (msg.errorMessage) return String(msg.errorMessage);
        const content = msg.content;
        if (typeof content === "string") return content;
        if (Array.isArray(content)) {
          const texts = content.filter((c: any) => c.type === "text").map((c: any) => c.text).join("");
          if (texts) return texts;
        }
      }
    }

    return "";
  }

  async getMedications(): Promise<MedicationsDb> {
    const filePath = join(this.memoryDir, "medications.json");
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as MedicationsDb;
  }

  async updateMedications(data: MedicationsDb): Promise<void> {
    const filePath = join(this.memoryDir, "medications.json");
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async getFacts(): Promise<FactsDb> {
    const filePath = join(this.memoryDir, "facts.json");
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content) as FactsDb;
  }

  async updateFacts(data: FactsDb): Promise<void> {
    const filePath = join(this.memoryDir, "facts.json");
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async newSession(): Promise<void> {
    if (this.session) {
      this.session.dispose();
      this.session = null;
    }
    await this.init();
  }

  dispose(): void {
    this.session?.dispose();
  }
}
