'use server';
/**
 * @fileOverview An AI that generates a comprehensive test from a study set.
 *
 * - generateStudySetTest - A function that creates test questions of various types.
 * - StudySetTestInput - The input type for the function.
 * - StudySetTestOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudyCardSchema = z.object({
  id: z.string(),
  term: z.string(),
  definition: z.string(),
});

const StudySetTestInputSchema = z.object({
  title: z.string().describe('The title of the study set.'),
  description: z.string().optional().describe('The description of the study set.'),
  cards: z.array(StudyCardSchema).describe('The list of flashcards (term and definition).'),
});
export type StudySetTestInput = z.infer<typeof StudySetTestInputSchema>;

const MultipleChoiceQuestionSchema = z.object({
    type: z.enum(['multiple-choice']),
    question: z.string().describe("The multiple choice question."),
    options: z.array(z.string()).describe("An array of 4 plausible answers. One must be correct."),
    correctAnswer: z.string().describe("The exactly correct answer from the options array."),
    explanation: z.string().describe("A brief explanation of why the answer is correct."),
});

const WrittenQuestionSchema = z.object({
    type: z.enum(['written']),
    question: z.string().describe("The definition is provided as the question, asking for the term."),
    correctAnswer: z.string().describe("The term is the correct answer."),
    explanation: z.string().describe("A simple confirmation or explanation of the term."),
});

const TrueFalseQuestionSchema = z.object({
    type: z.enum(['true-false']),
    statement: z.string().describe("A statement that is either true or false, created from a term-definition pair."),
    correctAnswer: z.enum(['Wahr', 'Falsch']).describe("The correct answer, either 'Wahr' or 'Falsch'."),
    explanation: z.string().describe("A brief explanation of why the statement is true or false."),
});

const TestQuestionSchema = z.discriminatedUnion('type', [
    MultipleChoiceQuestionSchema,
    WrittenQuestionSchema,
    TrueFalseQuestionSchema
]);

const StudySetTestOutputSchema = z.object({
  questions: z.array(TestQuestionSchema).describe('An array of 5 to 10 generated test questions of various types.'),
});
export type StudySetTestOutput = z.infer<typeof StudySetTestOutputSchema>;


export async function generateStudySetTest(input: StudySetTestInput): Promise<StudySetTestOutput> {
  return studySetTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studySetTestPrompt',
  input: {schema: StudySetTestInputSchema},
  output: {schema: StudySetTestOutputSchema},
  prompt: `Du bist ein erfahrener Lehrer, der einen umfassenden Test aus einem Lernset erstellt.
Deine Aufgabe ist es, einen Test mit 5 bis 10 Fragen zu generieren, der verschiedene Frage-Typen mischt: Multiple-Choice, offene schriftliche Fragen und Wahr/Falsch-Fragen.
- **Multiple-Choice:** Erstelle eine klare Frage mit 4 plausiblen Antwortmöglichkeiten, von denen nur eine korrekt ist.
- **Schriftlich:** Gib eine Definition vor und frage nach dem korrekten Begriff.
- **Wahr/Falsch:** Formuliere eine Aussage über einen Begriff und seine Definition. Diese Aussage muss entweder klar wahr oder klar falsch sein. Manchmal sollte die Aussage korrekt sein, manchmal sollte sie einen falschen Begriff zur Definition zuordnen.
- Variiere die Fragetypen, um den Test abwechslungsreich zu gestalten.
- Gib für jede Frage eine kurze Erklärung, warum die Antwort korrekt ist.

Lernset-Titel: {{title}}
{{#if description}}Lernset-Beschreibung: {{description}}{{/if}}

Karten:
{{#each cards}}
- Begriff: "{{term}}", Definition: "{{definition}}"
{{/each}}

Erstelle den Test und gib das Ergebnis im vorgegebenen JSON-Format mit den unterschiedlichen Objekten im 'questions'-Array zurück.`,
});

const studySetTestFlow = ai.defineFlow(
  {
    name: 'studySetTestFlow',
    inputSchema: StudySetTestInputSchema,
    outputSchema: StudySetTestOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output?.questions || output.questions.length === 0) {
        throw new Error("AI failed to generate test questions.");
    }
    return output;
  }
);
