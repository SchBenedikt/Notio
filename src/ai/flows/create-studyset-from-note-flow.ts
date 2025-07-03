
'use server';
/**
 * @fileOverview An AI that generates a Study Set from a study note.
 *
 * - generateStudySetFromNote - A function that creates flashcards from text.
 * - GenerateStudySetFromNoteInput - The input type for the function.
 * - GenerateStudySetFromNoteOutput - The return type for the function.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateStudySetFromNoteInputSchema = z.object({
  noteTitle: z.string().describe('The title of the study note, to be used as context.'),
  noteContent: z.string().describe('The full content of the study note in Markdown format.'),
  apiKey: z.string().optional().describe("Optional Google AI API Key."),
});
export type GenerateStudySetFromNoteInput = z.infer<typeof GenerateStudySetFromNoteInputSchema>;

const StudyCardSchema = z.object({
  term: z.string().describe('The key term, concept, or question for the flashcard front.'),
  definition: z.string().describe('The definition, answer, or explanation for the flashcard back.'),
});

const GenerateStudySetFromNoteOutputSchema = z.object({
  title: z.string().describe('A concise and relevant title for the new study set, based on the note title.'),
  description: z.string().optional().describe('A brief description of what this study set covers.'),
  cards: z.array(StudyCardSchema).describe('An array of 10-20 generated flashcards based on the most important information in the note.'),
});
export type GenerateStudySetFromNoteOutput = z.infer<typeof GenerateStudySetFromNoteOutputSchema>;

export async function generateStudySetFromNote(input: GenerateStudySetFromNoteInput): Promise<GenerateStudySetFromNoteOutput> {
  return createStudySetFromNoteFlow(input);
}

const createStudySetFromNoteFlow = ai.defineFlow(
  {
    name: 'createStudySetFromNoteFlow',
    inputSchema: GenerateStudySetFromNoteInputSchema,
    outputSchema: GenerateStudySetFromNoteOutputSchema,
  },
  async (input) => {
    const { apiKey, ...promptData } = input;
    const localAi = genkit({plugins: [googleAI({ apiKey: apiKey ?? undefined })]});
    
    const prompt = localAi.definePrompt({
      name: 'createStudySetFromNotePrompt',
      input: {schema: z.object({ noteTitle: z.string(), noteContent: z.string() })},
      output: {schema: GenerateStudySetFromNoteOutputSchema},
      prompt: `Du bist ein erfahrener Lehrer, der Schülern beim Lernen hilft.
    Deine Aufgabe ist es, aus dem folgenden Lernzettel ein prägnantes und hilfreiches Karteikarten-Set (Lernset) zu erstellen.
    Analysiere den Inhalt und extrahiere die wichtigsten Schlüsselkonzepte, Definitionen, Fakten und Zusammenhänge.

    - Leite aus dem Titel des Lernzettels ('{{noteTitle}}') einen passenden Titel für das neue Lernset ab.
    - Erstelle zwischen 10 und 20 Karteikarten. Jede Karte soll einen klaren Begriff (term) und eine zugehörige Definition (definition) haben.
    - Die Begriffe und Definitionen sollten kurz und leicht verständlich sein. Formuliere alles auf Deutsch.

    Hier ist der Lernzettel:
    ---
    Titel: {{noteTitle}}

    Inhalt:
    {{noteContent}}
    ---

    Erstelle das Lernset und gib das Ergebnis im vorgegebenen JSON-Format zurück.`,
    });

    const {output} = await prompt(promptData);
    if (!output?.cards || output.cards.length === 0) {
        throw new Error("AI failed to generate study set from the note.");
    }
    return output;
  }
);
