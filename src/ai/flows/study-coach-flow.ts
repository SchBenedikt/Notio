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
  subjectCategory: z.string().describe('The category of the subject (Hauptfach or Nebenfach).'),
  writtenWeight: z.number().nullable().optional().describe('The weight for written grades for this subject.'),
  oralWeight: z.number().nullable().optional().describe('The weight for oral grades for this subject.'),
  targetGrade: z.number().nullable().optional().describe("The student's target grade for this subject."),
  grades: z
    .array(
      z.object({
        name: z.string().nullable().optional(),
        value: z.number(),
        type: z.string(),
        notes: z.string().nullable().optional(),
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
Analysiere die folgenden Noten für das Fach '{{subjectName}}' ({{subjectCategory}}).
{{#if targetGrade}}Der Schüler hat sich eine Wunschnote von {{targetGrade}} zum Ziel gesetzt. Beziehe das in deine Analyse mit ein und gib konkrete Tipps, wie dieses Ziel erreicht werden kann. Vergleiche den aktuellen Schnitt mit der Wunschnote.{{/if}}
Gib eine kurze, aufmunternde Einschätzung der aktuellen Situation und dann 3-5 konkrete, umsetzbare Lerntipps.
Berücksichtige dabei die Notenwerte (1=sehr gut, 6=ungenügend), die Notentypen ('Schulaufgabe' ist wichtiger als 'mündliche Note') und eventuelle Notizen des Schülers.
{{#if writtenWeight}}
Für dieses Hauptfach gilt eine spezielle Gewichtung: Schriftliche Noten zählen {{writtenWeight}}-fach und mündliche Noten {{oralWeight}}-fach.
{{else}}
Die einzelne Gewichtung (x-Wert) gibt an, wie stark eine Note zählt.
{{/if}}
Sprich den Schüler direkt und freundlich mit 'Du' an. Antworte auf Deutsch.

Hier sind die Noten:
{{#each grades}}
- Bezeichnung: {{#if this.name}}{{this.name}}{{else}}{{this.type}}{{/if}}, Note: {{this.value}}, Gewichtung: {{this.weight}}{{#if this.notes}}, Notiz: "{{this.notes}}"{{/if}}
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
