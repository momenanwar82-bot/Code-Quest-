
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Difficulty } from "../types";

const DIFFICULTY_LABELS = {
  [Difficulty.Beginner]: "Beginner (Entry level, basic syntax)",
  [Difficulty.Intermediate]: "Intermediate (Functions, logic, standard libraries)",
  [Difficulty.Advanced]: "Advanced (Design patterns, optimization, complex logic)",
  [Difficulty.Expert]: "Expert (Architecture, deep language internals, concurrency)",
  [Difficulty.Master]: "Master (World-class challenges, obscure edge cases, high-level abstraction)"
};

export async function generateProgrammingQuestion(
  language: string, 
  stage: number, 
  questionNum: number,
  uiLang: 'ar' | 'en' = 'ar',
  baseDifficulty: Difficulty = Difficulty.Intermediate
): Promise<Question> {
  // Fix: Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const difficultyLabel = DIFFICULTY_LABELS[baseDifficulty];
  
  const prompt = `Generate a unique, high-quality multiple-choice programming question for ${language}.
  Selected User Level: ${difficultyLabel}
  Current Progress: Question ${questionNum + 1} of 15.
  Stage Complexity: ${stage} of 5.
  Provide a code snippet if relevant.
  The text of the question and explanation MUST be in ${uiLang === 'ar' ? 'Arabic' : 'English'}. 
  Code should stay in English format.
  Ensure the options are challenging and the correct answer is indisputable.
  Return only JSON.`;

  // Fix: Using gemini-3-pro-preview for complex programming tasks as per guidelines.
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      // Fix: Adding thinkingBudget for better reasoning in code generation.
      thinkingConfig: { thinkingBudget: 4000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING },
          codeSnippet: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            minItems: 4,
            maxItems: 4
          },
          correctAnswerIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ["id", "text", "options", "correctAnswerIndex", "explanation"]
      }
    }
  });

  // Fix: Correctly accessing the text property (not calling as a function) and trimming.
  return JSON.parse(response.text.trim()) as Question;
}
