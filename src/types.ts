export interface MedicationSchedule {
  frequency: string;
  times: string[];
}

export interface Medication {
  name: string;
  generic_name: string;
  strength: string;
  form: string;
  schedule: MedicationSchedule;
  prescriber: string;
  start_date: string;
  purpose: string;
  notes: string;
}

export interface Patient {
  patient_id: string;
  display_name: string;
  relationship_to_primary_user: string;
  medications: Medication[];
  allergies: string[];
  conditions_volunteered: string[];
}

export interface MedicationsDb {
  schema_version: string;
  note: string;
  patients: Patient[];
}

export interface FactsDb {
  schema_version: string;
  note: string;
  primary_user: {
    role: string;
    notes: string;
  };
  household: {
    other_people_supported: string[];
  };
  preferences: {
    reminder_style: string;
    units: string;
    region_for_emergency_numbers: string;
  };
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface AgentConfig {
  agentName: string;
  agentHomeDir: string;
  model?: string;
  provider?: string;
}
