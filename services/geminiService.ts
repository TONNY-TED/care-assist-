
import { GoogleGenAI, Type } from "@google/genai";
import { SymptomData, HealthGuidance } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    possibleCauses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of common informational causes."
    },
    immediateActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Non-medicinal steps to take immediately."
    },
    preventiveMeasures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "How to avoid this issue in the future."
    },
    whenToSeeDoctor: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Red flags that require professional attention."
    },
    medicines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          dosage: { type: Type.STRING },
          warnings: { type: Type.STRING }
        },
        required: ["name", "dosage", "warnings"]
      },
      description: "Suggested Over-the-Counter medicines only. Strictly NO prescription-only drugs."
    },
    isEmergency: {
      type: Type.BOOLEAN,
      description: "True if symptoms suggest an emergency."
    },
    reasoning: {
      type: Type.STRING,
      description: "A brief explanation of why these actions and OTC medicines were suggested based on the symptoms."
    }
  },
  required: ["possibleCauses", "immediateActions", "preventiveMeasures", "whenToSeeDoctor", "medicines", "isEmergency", "reasoning"]
};

export async function analyzeSymptoms(data: SymptomData): Promise<HealthGuidance> {
  const prompt = `
    System: You are an expert medical assistant. You provide informational health guidance based on user symptoms. 
    Constraint: Suggest ONLY Over-the-Counter (OTC) medications. NEVER suggest prescription-only drugs.
    
    User Query:
    Description: ${data.description}
    Patient Profile: ${data.age} years old, ${data.gender}.
    Timeline: ${data.duration}.
    Self-reported Severity: ${data.severity}/10.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        // Using thinkingConfig to ensure the model carefully considers symptom interactions
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze symptoms. Please try again or seek professional help.");
  }
}
