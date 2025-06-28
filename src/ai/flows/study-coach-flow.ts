'use server';
/**
 * @fileOverview An AI-powered study coach that provides feedback and tips.
 *
 * - studyCoachFlow - A function that analyzes grades and provides study advice.
 * - StudyCoachInput - The input type for the studyCoachFlow function.
 * - StudyCoachOutput - The return type for the studyCoachFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudyCoachInputSchema = z.object({
  subjectName: z.string().describe('The name of the subject.'),
  grades: z
    .array(
      z.object({
        value: z.number(),
        type: z.string(),
        notes: z.string().optional(),
        weight: z.number(),
      })
    )
    .describe('A list of grades for the subject.'),
});
export type StudyCoachInput = z.infer<typeof StudyCoachInputSchema>;

const StudyCoachOutputSchema = z.object({
  analysis: z.string().describe('A short, encouraging analysis of the current learning situation.'),
  tips: z.array(z.string()).describe('A list of 3-5 concrete learning tips.'),
});
export type StudyCoachOutput = z.infer<typeof StudyCoachOutputSchema>;

export async function getStudyCoachTips(input: StudyCoachInput): Promise<StudyCoachOutput> {
  return studyCoachFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studyCoachPrompt',
  input: {schema: StudyCoachInputSchema},
  output: {schema: StudyCoachOutputSchema},
  prompt: `Du bist ein positiver und motivierender Lern-Coach für Schüler in Deutschland.
Analysiere die folgenden Noten für das Fach '{{subjectName}}'.
Gib eine kurze, aufmunternde Einschätzung der aktuellen Situation und dann 3-5 konkrete, umsetzbare Lerntipps.
Berücksichtige dabei die Notenwerte (1=sehr gut, 6=ungenügend), die Notentypen ('Schulaufgabe' ist wichtiger als 'mündliche Note') und eventuelle Notizen des Schülers.
Die Gewichtung gibt an, wie stark eine Note zählt.
Sprich den Schüler direkt und freundlich mit 'Du' an. Antworte auf Deutsch.

Hier sind die Noten:
{{#each grades}}
- Note: {{value}}, Typ: {{type}}, Gewichtung: {{weight}}{{#if notes}}, Notiz: "{{notes}}"{{/if}}
{{/each}}

Gib deine Antwort im vorgegebenen JSON-Format.`,
});

const studyCoachFlow = ai.defineFlow(
  {
    name: 'studyCoachFlow',
    inputSchema: StudyCoachInputSchema,
    outputSchema: StudyCoachOutputSchema,
  },
  async (input) => {
    // If there are no grades, return a default message
    if (input.grades.length === 0) {
      return {
        analysis: "Für dieses Fach gibt es noch keine Noten.",
        tips: ["Füge deine erste Note hinzu, um eine Analyse und Lerntipps zu erhalten!", "Ein guter Start ist die halbe Miete. Viel Erfolg!"],
      };
    }

    const {output} = await prompt(input);
    return output!;
  }
);
