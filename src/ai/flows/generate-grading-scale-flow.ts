
'use server';
/**
 * @fileOverview An AI that generates a grading scale from a maximum point value.
 *
 * - generateGradingScale - A function that creates a grading scale.
 * - GradingScaleInput - The input type for the function.
 * - GradingScaleOutput - The return type for the function.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GradingScaleInputSchema = z.object({
  maxPoints: z.number().positive("Maximale Punktzahl muss eine positive Zahl sein."),
  apiKey: z.string().optional().describe("Optional Google AI API Key."),
});
export type GradingScaleInput = z.infer<typeof GradingScaleInputSchema>;

const GradingScaleOutputSchema = z.object({
  scale: z.record(z.string(), z.number()).describe("Ein Objekt, das den Punkteschlüssel darstellt. Die Schlüssel sind die Noten (z.B. '1', '2', '3') und die Werte sind die dafür mindestens benötigten Punkte.")
});
export type GradingScaleOutput = z.infer<typeof GradingScaleOutputSchema>;

export async function generateGradingScale(input: GradingScaleInput): Promise<GradingScaleOutput> {
  return generateGradingScaleFlow(input);
}

const generateGradingScaleFlow = ai.defineFlow(
  {
    name: 'generateGradingScaleFlow',
    inputSchema: GradingScaleInputSchema,
    outputSchema: GradingScaleOutputSchema,
  },
  async (input) => {
    const { apiKey, ...promptData } = input;
    const localAi = genkit({plugins: [googleAI({ apiKey: apiKey ?? undefined })]});
    
    const prompt = localAi.definePrompt({
      name: 'generateGradingScalePrompt',
      input: {schema: z.object({ maxPoints: z.number() })},
      output: {schema: GradingScaleOutputSchema},
      prompt: `Du bist ein Experte für deutsche Notensysteme. Erstelle einen detaillierten IHK-Punkteschlüssel (oder einen vergleichbar standardisierten Schlüssel) für eine Prüfung mit einer maximalen Punktzahl von {{maxPoints}} Punkten.

      Der Schlüssel sollte die Punkte für die Noten 1 bis 6 definieren.
  
      Beispiel für 100 Punkte:
      - Note 1 (sehr gut): 100-92 Punkte
      - Note 2 (gut): 91-81 Punkte
      - Note 3 (befriedigend): 80-67 Punkte
      - Note 4 (ausreichend): 66-50 Punkte
      - Note 5 (mangelhaft): 49-30 Punkte
      - Note 6 (ungenügend): 29-0 Punkte
  
      Gib als Ergebnis nur das JSON-Objekt zurück, das die Note (als String) der Mindestpunktzahl für diese Note zuordnet.
      Beispiel-Output für 100 Punkte:
      { "scale": { "1": 92, "2": 81, "3": 67, "4": 50, "5": 30, "6": 0 } }
      `,
    });

    const {output} = await prompt(promptData);
    if (!output?.scale) {
        throw new Error("AI failed to generate a grading scale.");
    }
    return output;
  }
);
