
import { GoogleGenAI, Type } from "@google/genai";
import { SymptomData, HealthGuidance } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    possibleCauses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of common informational causes, not medical diagnoses."
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
      description: "True if symptoms suggest a life-threatening emergency."
    }
  },
  required: ["possibleCauses", "immediateActions", "preventiveMeasures", "whenToSeeDoctor", "medicines", "isEmergency"]
};

export async function analyzeSymptoms(data: SymptomData): Promise<HealthGuidance> {
  const prompt = `
    Analyze these symptoms and provide informational health guidance. 
    Age: ${data.age}
    Gender: ${data.gender}
    Duration: ${data.duration}
    Severity: ${data.severity}/10
    Description: ${data.description}

    Rules:
    1. NEVER provide a final medical diagnosis.
    2. Suggest only standard OTC medications (e.g. Paracetamol, Ibuprofen, Antacids).
    3. Include safe general dosage guidelines and critical warnings for each medication.
    4. If symptoms imply high risk (chest pain, stroke signs, etc.), set isEmergency to true.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      }
    });

    const result = JSON.parse(response.text);
    return result as HealthGuidance;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze symptoms. Please try again.");
  }
}
