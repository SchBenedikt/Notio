'use server';
/**
 * @fileOverview An AI that creates a spaced repetition study session.
 *
 * - createStudySession - A function that selects cards for a new session.
 * - StudySessionInput - The input type for the function.
 * - StudySessionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getDueDate } from '@/lib/srs';


const SrsDataSchema = z.object({
    interval: z.number(),
    easeFactor: z.number(),
    repetitions: z.number(),
    lastReviewed: z.string(),
}).optional();

const StudyCardForSrsSchema = z.object({
  id: z.string(),
  term: z.string(),
  definition: z.string(),
  srs: SrsDataSchema,
});
export type StudyCardForSrs = z.infer<typeof StudyCardForSrsSchema>;

const StudySessionInputSchema = z.object({
  cards: z.array(StudyCardForSrsSchema).describe('The list of all flashcards in the set with their SRS data.'),
  maxCards: z.number().default(15).describe('The maximum number of cards to include in the session.')
});
export type StudySessionInput = z.infer<typeof StudySessionInputSchema>;


const StudySessionOutputSchema = z.object({
  cardIds: z.array(z.string()).describe('An array of card IDs to be studied in this session.'),
  sessionTitle: z.string().describe('A short, encouraging title for this study session in German.'),
});
export type StudySessionOutput = z.infer<typeof StudySessionOutputSchema>;

export async function createStudySession(input: StudySessionInput): Promise<StudySessionOutput> {
    return studySessionFlow(input);
}


const prompt = ai.definePrompt({
  name: 'studySessionPrompt',
  input: {schema: StudySessionInputSchema},
  output: {schema: StudySessionOutputSchema},
  prompt: `Du bist ein intelligenter Lern-Coach. Deine Aufgabe ist es, eine personalisierte Lerneinheit basierend auf dem Spaced-Repetition-Prinzip zu erstellen.
  Analysiere die folgende Liste von Karteikarten und ihren Lerndaten (Interval, Ease Factor, letztes Abfragedatum).

  Wähle bis zu {{maxCards}} Karten für die heutige Lernsitzung aus. Deine Auswahl sollte nach folgender Priorität erfolgen:
  1. Karten, deren Fälligkeitsdatum (letztes Abfragedatum + Intervall) heute oder in der Vergangenheit liegt. Wähle die am längsten überfälligen Karten zuerst aus.
  2. Neue Karten, die noch nie abgefragt wurden (keine SRS-Daten).
  3. Fülle die Sitzung mit den Karten auf, deren Wiederholungsintervall am kürzesten ist, bis das Limit von {{maxCards}} Karten erreicht ist.

  Gib eine Liste der IDs der ausgewählten Karten zurück.
  Erstelle außerdem einen kurzen, motivierenden Titel auf Deutsch für diese Lernsitzung.

  Heutiges Datum: ${new Date().toLocaleDateString('de-DE')}

  Karten:
  {{#each cards}}
  - ID: {{this.id}}
    - Begriff: "{{this.term}}"
    {{#if this.srs}}
    - Intervall: {{this.srs.interval}} Tage
    - Letzte Abfrage: {{this.srs.lastReviewed}}
    {{else}}
    - Status: Neue Karte
    {{/if}}
  {{/each}}
  
  Antworte im vorgegebenen JSON-Format.`,
});

const studySessionFlow = ai.defineFlow(
  {
    name: 'studySessionFlow',
    inputSchema: StudySessionInputSchema,
    outputSchema: StudySessionOutputSchema,
  },
  async (input) => {
    if (input.cards.length === 0) {
      return { cardIds: [], sessionTitle: "Leeres Lernset" };
    }
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to create a study session.");
    }
    // As a fallback if the AI returns no cards but there are cards due
    if (output.cardIds.length === 0 && input.cards.length > 0) {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const dueCards = input.cards
            .filter(card => !card.srs || getDueDate(card) <= today)
            .slice(0, input.maxCards);
        return {
            cardIds: dueCards.map(c => c.id),
            sessionTitle: "Deine heutige Lerneinheit"
        }
    }
    return output;
  }
);
