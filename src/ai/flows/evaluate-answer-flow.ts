
'use server';
/**
 * @fileOverview An AI that evaluates a user's answer in a quiz.
 *
 * - evaluateAnswer - A function that checks if an answer is correct, accounting for typos.
 * - EvaluateAnswerInput - The input type for the function.
 * - EvaluateAnswerOutput - The return type for the function.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EvaluateAnswerInputSchema = z.object({
  userAnswer: z.string().describe("The answer the user provided."),
  correctTerm: z.string().describe("The correct term the user was supposed to provide."),
  definition: z.string().describe("The definition or prompt shown to the user for context."),
  apiKey: z.string().optional().describe("Optional Google AI API Key."),
});
export type EvaluateAnswerInput = z.infer<typeof EvaluateAnswerInputSchema>;

const EvaluateAnswerOutputSchema = z.object({
  isCorrect: z.boolean().describe("Is the user's answer fundamentally correct, even with a typo?"),
  isTypo: z.boolean().describe("If the answer is incorrect, is it likely just a minor typo or spelling mistake?"),
  feedback: z.string().describe("A short, helpful feedback message for the user in German. If it's a typo, point it out gently. If it's wrong, provide the correct answer."),
});
export type EvaluateAnswerOutput = z.infer<typeof EvaluateAnswerOutputSchema>;

export async function evaluateAnswer(input: EvaluateAnswerInput): Promise<EvaluateAnswerOutput> {
  // Quick check for perfect match to save an API call
  if (input.userAnswer.trim().toLowerCase() === input.correctTerm.trim().toLowerCase()) {
    return {
      isCorrect: true,
      isTypo: false,
      feedback: "Perfekt!",
    };
  }
  return evaluateAnswerFlow(input);
}

const evaluateAnswerFlow = ai.defineFlow(
  {
    name: 'evaluateAnswerFlow',
    inputSchema: EvaluateAnswerInputSchema,
    outputSchema: EvaluateAnswerOutputSchema,
  },
  async (input) => {
    const { apiKey, ...promptData } = input;
    const localAi = genkit({plugins: [googleAI({ apiKey: apiKey ?? undefined })]});
    
    const prompt = localAi.definePrompt({
      name: 'evaluateAnswerPrompt',
      input: {schema: z.object({ userAnswer: z.string(), correctTerm: z.string(), definition: z.string() })},
      output: {schema: EvaluateAnswerOutputSchema},
      prompt: `Du bist ein hilfreicher und verständnisvoller Lern-Assistent. Deine Aufgabe ist es, die Antwort eines Schülers im "Schreiben"-Lernmodus zu bewerten. Der Schüler bekommt eine Definition und muss den korrekten Begriff eingeben.

  Kontext:
  - Definition: "{{definition}}"
  - Korrekter Begriff: "{{correctTerm}}"
  - Antwort des Schülers: "{{userAnswer}}"

  Deine Analyse:
  1.  **Korrektheit (isCorrect):** Ist die Antwort des Schülers grundsätzlich korrekt? Wenn die Antwort nur ein offensichtlicher Tippfehler des richtigen Begriffs ist (z.B. "Mitochomdrium" statt "Mitochondrium"), werte sie als korrekt (isCorrect: true). Wenn die Antwort ein völlig anderes Wort oder Konzept ist, ist sie falsch (isCorrect: false).
  2.  **Tippfehler (isTypo):** Bewerte, ob es sich bei einer falschen Antwort um einen kleinen Tippfehler handelt (z.B. ein oder zwei vertauschte/falsche Buchstaben). Setze isTypo entsprechend. Wenn die Antwort korrekt ist, ist isTypo immer false.
  3.  **Feedback (feedback):** Gib eine kurze, hilfreiche Rückmeldung auf Deutsch.
      - Bei einer korrekten Antwort (auch mit Tippfehler): Lobe den Schüler, z.B. "Richtig!" oder "Sehr gut!". Wenn es ein Tippfehler war, füge eine kurze Korrektur hinzu, z.B. "Genau richtig! Kleiner Hinweis: Es schreibt sich '{{correctTerm}}'."
      - Bei einer falschen Antwort (kein Tippfehler): Gib die richtige Antwort an, z.B. "Nicht ganz. Die richtige Antwort lautet '{{correctTerm}}'."

  Antworte im vorgegebenen JSON-Format.`,
    });

    const {output} = await prompt(promptData);
    if (!output) {
        throw new Error("AI failed to evaluate the answer.");
    }
    return output;
  }
);
