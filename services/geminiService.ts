
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const difficultyLabel = DIFFICULTY_LABELS[baseDifficulty];
  
  // تحديث البرومبت لفرض نمط "Quick Snippets"
  const prompt = `Generate a high-stakes "Quick Snippet" programming question for ${language}.
  User Level: ${difficultyLabel}
  Stage: ${stage}
  
  CRITICAL RULES:
  1. STYLE: "Quick Snippet" - The logic must be solvable in under 10 seconds.
  2. CODE LENGTH: If a code snippet is provided, it MUST be 3 to 4 lines MAX.
  3. READABILITY: Use clear, concise code that fits perfectly on a mobile screen.
  4. QUESTION TEXT: Keep the question very brief (1 short sentence).
  5. LANGUAGE: Question text and explanation MUST be in ${uiLang === 'ar' ? 'Arabic' : 'English'}.
  6. CODE: Programming code MUST stay in English.
  
  Example Style:
  let a = [1, 2];
  let b = a;
  b.push(3);
  console.log(a.length);
  
  Return only JSON format.`;

  const budget = stage <= 1 ? 500 : 2000;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: budget },
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

  return JSON.parse(response.text.trim()) as Question;
}
