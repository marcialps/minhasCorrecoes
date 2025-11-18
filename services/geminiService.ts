
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import {
  FEEDBACK_PROMPT_TEMPLATE,
  SYSTEM_INSTRUCTION,
  FEEDBACK_RESPONSE_SCHEMA,
  GRADE_RANGES,
} from "../constants";
import { GeneratedFeedbackContent } from "../types";

// Helper function for Base64 encoding
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Function to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        // reader.result is ArrayBuffer or string
        const result = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(result);
        resolve(encode(bytes));
      } else {
        reject('Failed to read file');
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export const generateFeedback = async (
  studentName: string,
  activityTitle: string,
  uc: string,
  grade: number,
  activityPromptContent: string,
): Promise<GeneratedFeedbackContent> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not defined. Please ensure it is set as an environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const gradeRange = GRADE_RANGES.find(
    (range) => grade >= range.min && grade <= range.max,
  );

  const gradeDescription = gradeRange
    ? gradeRange.description
    : 'retorno padrão, focando em análise de desempenho e próximos passos.';

  const prompt = FEEDBACK_PROMPT_TEMPLATE(
    studentName,
    activityTitle,
    uc,
    grade,
    gradeDescription,
    activityPromptContent,
  );

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Using a more capable model for complex text generation
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: FEEDBACK_RESPONSE_SCHEMA,
        temperature: 0.8, // Adjust for creativity
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 1024, // Sufficient tokens for detailed feedback
        thinkingConfig: { thinkingBudget: 256 },
      },
    });

    const jsonStr = response.text?.trim();

    if (!jsonStr) {
      throw new Error("Empty response from Gemini API.");
    }

    // Attempt to parse JSON. Gemini might occasionally return markdown wrapped JSON
    let parsed: GeneratedFeedbackContent;
    try {
        parsed = JSON.parse(jsonStr);
    } catch (e) {
        // Attempt to extract JSON from a markdown code block if direct parsing fails
        const jsonMatch = jsonStr.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            parsed = JSON.parse(jsonMatch[1]);
        } else {
            throw new Error(`Failed to parse Gemini response as JSON: ${jsonStr}`);
        }
    }


    if (!parsed || typeof parsed.feedbackText !== 'string' || !Array.isArray(parsed.actionableSuggestions)) {
      throw new Error(`Invalid schema in Gemini response: ${jsonStr}`);
    }

    return parsed;
  } catch (error) {
    console.error("Error generating feedback with Gemini API:", error);
    // Provide a more user-friendly error message
    if (error instanceof Error) {
      throw new Error(`Falha ao gerar feedback: ${error.message}. Verifique a sua chave API e tente novamente.`);
    }
    throw new Error("Falha desconhecida ao gerar feedback.");
  }
};
