'use server';
/**
 * @fileOverview An AI tutor that can chat with the student and process files.
 *
 * - getTutorResponse - A function that handles the chat conversation.
 * - ChatMessage - The type for a single chat message.
 * - TutorChatInput - The input type for the getTutorResponse function.
 * - TutorChatOutput - The return type for the getTutorResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AttachmentSchema = z.object({
  name: z.string(),
  dataUrl: z.string(),
});

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
  attachments: z.array(AttachmentSchema).optional(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;


const SrsDataForTutorSchema = z.object({
    interval: z.number().describe("The number of days until the next review."),
    easeFactor: z.number().describe("A factor representing how easy the card is."),
    repetitions: z.number().describe("How many times the card has been reviewed successfully."),
    lastReviewed: z.string().describe("The ISO date string of the last review."),
}).optional();

const StudyCardForTutorSchema = z.object({
    term: z.string(),
    definition: z.string(),
    srs: SrsDataForTutorSchema.describe("Spaced Repetition System data for this card. If present, it indicates the card's learning status."),
});

const StudySetForTutorSchema = z.object({
  title: z.string().describe("The title of the study set."),
  description: z.string().optional().describe("The description of the study set."),
  cards: z.array(StudyCardForTutorSchema).describe("The flashcards in the study set, potentially with SRS data."),
});

const TutorChatInputSchema = z.object({
  subjects: z.array(z.object({
    name: z.string().describe("The name of the subject."),
    category: z.string().describe("The category of the subject."),
    average: z.string().describe("The current average grade for this subject."),
    targetGrade: z.number().optional().describe("The student's target grade for this subject."),
    grades: z.array(z.object({
        name: z.string().optional().describe("The name of the grade/test."),
        value: z.number().describe("The grade value (1-6)."),
        type: z.string().describe("The type of grade (e.g., Schulaufgabe)."),
        notes: z.string().optional().describe("Notes for the grade."),
    })).describe("The list of grades for this subject.")
  })).describe("A list of the student's subjects and their corresponding grades."),
  studySets: z.array(StudySetForTutorSchema).optional().describe("A list of study sets the user has selected for this conversation."),
  history: z.array(ChatMessageSchema).describe('The chat history so far. The last message is the current user query.'),
});
export type TutorChatInput = z.infer<typeof TutorChatInputSchema>;


const TutorChatOutputSchema = z.object({
  response: z.string().describe('The AI tutor\'s response.'),
});
export type TutorChatOutput = z.infer<typeof TutorChatOutputSchema>;

export async function getTutorResponse(input: TutorChatInput): Promise<TutorChatOutput> {
  return tutorChatFlow(input);
}

const tutorChatFlow = ai.defineFlow(
  {
    name: 'tutorChatFlow',
    inputSchema: TutorChatInputSchema,
    outputSchema: TutorChatOutputSchema,
  },
  async (input) => {
    
    let subjectsInfo = "Der Schüler hat noch keine Fächer oder Noten für diese Klassenstufe eingetragen.";
    if (input.subjects.length > 0) {
        subjectsInfo = "Hier ist die aktuelle Notenübersicht des Schülers:\n\n" + input.subjects.map(s => {
            const gradeList = s.grades.length > 0 
                ? s.grades.map(g => `- ${g.name || g.type}: Note ${g.value}${g.notes ? ` (Notiz: ${g.notes})` : ''}`).join('\n')
                : "  Noch keine Noten eingetragen.";
            const targetGradeInfo = s.targetGrade ? ` (Wunschnote: ${s.targetGrade})` : '';
            return `Fach: ${s.name} (${s.category})${targetGradeInfo}\nAktueller Schnitt: ${s.average}\nNoten:\n${gradeList}`;
        }).join('\n\n');
    }

    let studySetsInfo = "";
    if (input.studySets && input.studySets.length > 0) {
        studySetsInfo = "\n\nZusätzlich hat der Schüler die folgenden Lernsets für diesen Chat ausgewählt. Beziehe dich auf die Begriffe, Definitionen und Lernfortschrittsdaten (SRS), um Fragen zu beantworten, Zusammenfassungen zu erstellen oder Übungsaufgaben zu generieren:\n\n" + input.studySets.map(set => {
            const cardList = set.cards.map(card => {
                let srsInfo = "- Status: Neue Karte";
                if (card.srs) {
                    const dueDate = new Date(card.srs.lastReviewed);
                    dueDate.setDate(dueDate.getDate() + card.srs.interval);
                    srsInfo = `- Letzte Wiederholung: ${new Date(card.srs.lastReviewed).toLocaleDateString('de-DE')}, Fällig am: ${dueDate.toLocaleDateString('de-DE')}`;
                }
                return `  - Begriff: "${card.term}", Definition: "${card.definition}"\n    - Lernstatus: ${srsInfo}`;
            }).join('\n');
            return `Lernset: "${set.title}"\n${set.description ? `Beschreibung: ${set.description}\n` : ''}Karten:\n${cardList}`;
        }).join('\n\n');
    }

    const systemPrompt = `Du bist ein hilfsbereiter und freundlicher KI-Tutor für einen Schüler in Deutschland. Deine Aufgabe ist es, Fragen zu beantworten, Konzepte zu erklären und bei den Hausaufgaben zu helfen.
Du hast Zugriff auf die aktuellen Noten und Fächer des Schülers. Nutze diese Informationen, um kontextbezogene und hilfreiche Antworten zu geben. Wenn der Schüler z.B. fragt "Wie kann ich mich verbessern?", beziehe dich auf die Fächer mit schlechteren Noten und berücksichtige seine Wunschnote.

Du hast auch Zugriff auf die Lernfortschrittsdaten (Spaced Repetition System - SRS) für einzelne Karteikarten, falls der Nutzer diese im "Lernen"-Modus verwendet hat.
Nutze diese SRS-Daten (Intervall, letztes Abfragedatum), um Fragen zu beantworten wie "Welche Karten sollte ich heute wiederholen?" oder "Wann ist die nächste Wiederholung für das Thema X fällig?".
Das heutige Datum ist ${new Date().toLocaleDateString('de-DE')}.

Du kannst auch Dateien wie Bilder, PDFs oder andere Dokumente als Anhänge erhalten. Beziehe diese in deine Analyse und Antworten mit ein.

${subjectsInfo}
${studySetsInfo}

Sei ermutigend, geduldig und sprich den Schüler mit "Du" an. Antworte immer auf Deutsch.`;

    const lastMessage = input.history[input.history.length - 1];
    
    // Construct the history for Genkit, including attachments
    const historyForGenkit = input.history.slice(0, -1).map((msg) => {
        const content: ({ text: string } | { media: { url: string } })[] = [{ text: msg.content }];
        if (msg.attachments) {
            msg.attachments.forEach(att => {
                content.push({ media: { url: att.dataUrl } });
            });
        }
        return {
            role: msg.role as 'user' | 'model',
            content,
        };
    });

    // Construct the prompt for the last message
    const promptParts: ({ text: string } | { media: { url: string } })[] = [{ text: lastMessage.content }];
    if (lastMessage.attachments) {
        lastMessage.attachments.forEach(att => {
            promptParts.push({ media: { url: att.dataUrl } });
        });
    }
    
    const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: promptParts,
        history: historyForGenkit,
        system: systemPrompt,
        output: {
            format: 'json',
            schema: TutorChatOutputSchema,
        },
        config: {
            temperature: 0.7,
        }
    });

    const output = response.output;
    if (!output) {
      throw new Error("AI did not return a valid response.");
    }
    return output;
  }
);
