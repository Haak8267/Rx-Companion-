import type { FactsDb, MedicationsDb } from "./types.js";
export interface RxCompanionConfig {
    agentHomeDir: string;
    provider?: string;
    model?: string;
}
export declare class RxCompanion {
    private agentHomeDir;
    private session;
    private provider;
    private model;
    private memoryDir;
    constructor(config: RxCompanionConfig);
    init(): Promise<void>;
    private loadSettingsManager;
    chat(message: string): Promise<string>;
    getMedications(): Promise<MedicationsDb>;
    updateMedications(data: MedicationsDb): Promise<void>;
    getFacts(): Promise<FactsDb>;
    updateFacts(data: FactsDb): Promise<void>;
    newSession(): Promise<void>;
    dispose(): void;
}
//# sourceMappingURL=rx-companion.d.ts.map