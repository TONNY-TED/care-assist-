
import { GoogleGenAI, Type } from "@google/genai";
import { SymptomData, HealthGuidance } from "../types";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY
const API_KEY = process.env.API_KEY;

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
      description: "Suggested Over-the-Counter medicines only."
    },
    isEmergency: {
      type: Type.BOOLEAN,
      description: "True if symptoms suggest an emergency."
    }
  },
  required: ["possibleCauses", "immediateActions", "preventiveMeasures", "whenToSeeDoctor", "medicines", "isEmergency"]
};

export async function analyzeSymptoms(data: SymptomData): Promise<HealthGuidance> {
  // 1. Check if the environment variable is even present
  if (!API_KEY || API_KEY === "undefined" || API_KEY.trim() === "") {
    console.error("DEBUG: API_KEY is missing. Ensure your .env file or local environment is set up.");
    throw new Error("API Key Missing: Please ensure process.env.API_KEY is defined.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    System: You are an expert medical assistant providing informational health guidance. 
    Constraint: Suggest ONLY Over-the-Counter (OTC) medications. NEVER suggest prescription drugs.
    
    User Query:
    Description: ${data.description}
    Patient: ${data.age} year old ${data.gender}.
    Timeline: ${data.duration}.
    Severity: ${data.severity}/10.
  `;

  try {
    // Basic Text Task uses gemini-3-flash-preview
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    
    if (!response.text) {
      throw new Error("The AI model returned an empty response.");
    }

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("AI Service Error Log:", error);
    
    const msg = error.message || "";
    
    // Specific check for model availability (404)
    if (msg.includes("404") || msg.includes("model not found")) {
      throw new Error("Model Not Found: 'gemini-3-flash-preview' might be unavailable in your region or for your key type.");
    }
    
    // Specific check for invalid credentials (400/403)
    if (msg.includes("400") || msg.includes("403") || msg.includes("API_KEY_INVALID")) {
      throw new Error("Authentication Failed: The provided API Key is invalid. Check Google AI Studio.");
    }

    throw new Error(`Analysis failed: ${msg || "Unknown connection error"}`);
  }
}
