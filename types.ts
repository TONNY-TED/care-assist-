
export interface SymptomData {
  description: string;
  age: number | '';
  gender: string;
  duration: string;
  severity: number;
}

export interface OTCRecommendation {
  name: string;
  dosage: string;
  warnings: string;
}

export interface HealthGuidance {
  possibleCauses: string[];
  immediateActions: string[];
  preventiveMeasures: string[];
  whenToSeeDoctor: string[];
  medicines: OTCRecommendation[];
  isEmergency: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  data: SymptomData;
  guidance: HealthGuidance;
}
