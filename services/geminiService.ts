
import { GoogleGenAI, Type } from "@google/genai";
import { SymptomData, HealthGuidance } from "../types";

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
  const rawKey = process.env.API_KEY || "";
  const apiKey = rawKey.replace(/['"]+/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

  if (!apiKey || apiKey === "undefined") {
    throw new Error(`Technical Error: API Key is missing in the browser.`);
  }

  const ai = new GoogleGenAI({ apiKey });

  const userPrompt = `
    SYMPTOM DESCRIPTION: ${data.description}
    PATIENT PROFILE: ${data.age || 'Unknown'} year old ${data.gender}.
    TIMELINE: ${data.duration || 'Not specified'}.
    SEVERITY: ${data.severity}/10.
  `;

  try {
    // Switching to the more stable 'gemini-flash-latest' to avoid the 503 "Model Overloaded" issues
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: "You are an expert medical assistant. Provide informational health guidance based on evidence. Suggest ONLY Over-the-Counter (OTC) medications. NEVER suggest prescription drugs. Be concise, professional, and empathetic.",
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    
    if (!response.text) {
      throw new Error("The AI returned no text.");
    }

    return JSON.parse(response.text);
  } catch (error: any) {
    const msg = error.message || "";
    console.error("Gemini API Error:", error);
    
    // Specifically handle the 503 "Overloaded" error
    if (msg.includes("503") || msg.includes("overloaded")) {
      throw new Error("Google's servers are temporarily busy due to high traffic. Please wait 10 seconds and try again. Your API Key is working correctly.");
    }

    if (msg.includes("403") || msg.includes("API_KEY_INVALID") || msg.includes("key rejected")) {
      throw new Error(`Google Auth Failed: The key was rejected. Ensure the Generative Language API is enabled in your Google Cloud Console.`);
    }

    if (msg.includes("User location is not supported")) {
      throw new Error("Regional Restriction: Gemini is not available in your current location.");
    }
    
    throw new Error(`Analysis Failed: ${msg}`);
  }
}
