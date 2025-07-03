'use server';
/**
 * @fileOverview An AI that summarizes a study note.
 *
 * - summarizeNote - A function that creates a summary from text.
 * - SummarizeNoteInput - The input type for the function.
 * - SummarizeNoteOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNoteInputSchema = z.object({
  noteTitle: z.string().describe('The title of the study note.'),
  noteContent: z.string().describe('The full content of the study note in Markdown format.'),
});
export type SummarizeNoteInput = z.infer<typeof SummarizeNoteInputSchema>;

const SummarizeNoteOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the note in German, formatted as a Markdown list with bullet points.'),
});
export type SummarizeNoteOutput = z.infer<typeof SummarizeNoteOutputSchema>;

export async function summarizeNote(input: SummarizeNoteInput): Promise<SummarizeNoteOutput> {
  return summarizeNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNotePrompt',
  input: {schema: SummarizeNoteInputSchema},
  output: {schema: SummarizeNoteOutputSchema},
  prompt: `Du bist ein Experte für das Zusammenfassen von Lerninhalten.
Deine Aufgabe ist es, aus dem folgenden Lernzettel eine prägnante Zusammenfassung zu erstellen.
Formatiere die Zusammenfassung als Markdown-Liste mit den wichtigsten Kernaussagen, Fakten und Konzepten.
Verwende Stichpunkte, um die Informationen übersichtlich zu gliedern. Die Zusammenfassung sollte auf Deutsch sein.

Hier ist der Lernzettel:
---
Titel: {{noteTitle}}

Inhalt:
{{noteContent}}
---

Erstelle die Zusammenfassung und gib das Ergebnis im vorgegebenen JSON-Format zurück.`,
});

const summarizeNoteFlow = ai.defineFlow(
  {
    name: 'summarizeNoteFlow',
    inputSchema: SummarizeNoteInputSchema,
    outputSchema: SummarizeNoteOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output?.summary) {
        throw new Error("AI failed to generate a summary from the note.");
    }
    return output;
  }
);
