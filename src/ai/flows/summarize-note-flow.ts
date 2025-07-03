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
  prompt: `Du bist ein Experte für das Zusammenfassen von Lerninhalten für Schüler.
Deine Aufgabe ist es, aus dem folgenden Lernzettel eine prägnante Zusammenfassung zu erstellen, die ausschließlich aus Stichpunkten besteht.

**Anweisungen:**
1.  Analysiere den Inhalt und extrahiere die wichtigsten Kernaussagen, Fakten und Konzepte.
2.  Formatiere deine gesamte Antwort als eine einzige Markdown-Liste. Verwende für jeden Punkt einen Stichpunkt (z.B. mit "- " oder "* ").
3.  Formuliere die Stichpunkte kurz und prägnant. Lange Fließtext-Absätze sind nicht erlaubt.
4.  Die Zusammenfassung muss auf Deutsch sein.

Hier ist der Lernzettel, der zusammengefasst werden soll:
---
Titel: {{noteTitle}}

Inhalt:
{{noteContent}}
---

Erstelle jetzt die Zusammenfassung in Form einer Stichpunktliste und gib das Ergebnis im vorgegebenen JSON-Format zurück.`,
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
