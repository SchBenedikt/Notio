'use server';
/**
 * @fileOverview An AI that generates a quiz from a study set.
 *
 * - generateStudySetQuiz - A function that creates quiz questions.
 * - StudySetQuizInput - The input type for the function.
 * - StudySetQuizOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudyCardSchema = z.object({
  id: z.string(),
  term: z.string(),
  definition: z.string(),
});

const StudySetQuizInputSchema = z.object({
  title: z.string().describe('The title of the study set.'),
  description: z.string().optional().describe('The description of the study set.'),
  cards: z.array(StudyCardSchema).describe('The list of flashcards (term and definition).'),
});
export type StudySetQuizInput = z.infer<typeof StudySetQuizInputSchema>;

const QuizQuestionSchema = z.object({
    question: z.string().describe('The quiz question, based on either a term or a definition.'),
    options: z.array(z.string()).describe('An array of 4-5 potential answers (multiple choice). One of them must be the correct one.'),
    correctAnswer: z.string().describe('The exactly correct answer from the options array.'),
    explanation: z.string().describe('A brief explanation of why the answer is correct, especially if the question is tricky.'),
});

const StudySetQuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('An array of 5 to 10 generated quiz questions.'),
});
export type StudySetQuizOutput = z.infer<typeof StudySetQuizOutputSchema>;

export async function generateStudySetQuiz(input: StudySetQuizInput): Promise<StudySetQuizOutput> {
  return studySetQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studySetQuizPrompt',
  input: {schema: StudySetQuizInputSchema},
  output: {schema: StudySetQuizOutputSchema},
  prompt: `Du bist ein erfahrener Lehrer, der Schülern beim Lernen hilft.
Deine Aufgabe ist es, ein Multiple-Choice-Quiz aus dem folgenden Lernset zu erstellen.
Das Quiz sollte zwischen 5 und 10 Fragen umfassen.
Die Fragen sollten das Wissen über die Begriffe und ihre Definitionen testen. Stelle abwechselnd Fragen, bei denen man den Begriff zu einer Definition finden muss und umgekehrt.
Formuliere die Fragen klar und verständlich.
Erstelle für jede Frage 4 plausible Antwortmöglichkeiten, von denen nur eine korrekt ist. Die falschen Antworten sollten thematisch verwandt, aber eindeutig falsch sein.
Gib eine kurze Erklärung, warum die richtige Antwort korrekt ist.

Lernset-Titel: {{title}}
{{#if description}}Lernset-Beschreibung: {{description}}{{/if}}

Karten:
{{#each cards}}
- Begriff: "{{term}}", Definition: "{{definition}}"
{{/each}}

Erstelle das Quiz und gib das Ergebnis im vorgegebenen JSON-Format zurück.`,
});

const studySetQuizFlow = ai.defineFlow(
  {
    name: 'studySetQuizFlow',
    inputSchema: StudySetQuizInputSchema,
    outputSchema: StudySetQuizOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output?.questions || output.questions.length === 0) {
        throw new Error("AI failed to generate quiz questions.");
    }
    return output;
  }
);
