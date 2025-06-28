'use server';
/**
 * @fileOverview An AI tutor that can chat with the student.
 *
 * - getTutorResponse - A function that handles the chat conversation.
 * - TutorChatInput - The input type for the getTutorResponse function.
 * - TutorChatOutput - The return type for the getTutorResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const TutorChatInputSchema = z.object({
  subjects: z.array(z.object({
    name: z.string().describe("The name of the subject."),
    category: z.string().describe("The category of the subject."),
    average: z.string().describe("The current average grade for this subject."),
    grades: z.array(z.object({
        name: z.string().optional().describe("The name of the grade/test."),
        value: z.number().describe("The grade value (1-6)."),
        type: z.string().describe("The type of grade (e.g., Schulaufgabe)."),
        notes: z.string().optional().describe("Notes for the grade."),
    })).describe("The list of grades for this subject.")
  })).describe("A list of the student's subjects and their corresponding grades."),
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
            return `Fach: ${s.name} (${s.category})\nAktueller Schnitt: ${s.average}\nNoten:\n${gradeList}`;
        }).join('\n\n');
    }

    const systemPrompt = `Du bist ein hilfsbereiter und freundlicher KI-Tutor für einen Schüler in Deutschland. Deine Aufgabe ist es, Fragen zu beantworten, Konzepte zu erklären und bei den Hausaufgaben zu helfen.
Du hast Zugriff auf die aktuellen Noten und Fächer des Schülers. Nutze diese Informationen, um kontextbezogene und hilfreiche Antworten zu geben. Wenn der Schüler z.B. fragt "Wie kann ich mich verbessern?", beziehe dich auf die Fächer mit schlechteren Noten.

${subjectsInfo}

Sei ermutigend, geduldig und sprich den Schüler mit "Du" an. Antworte immer auf Deutsch.`;

    const lastMessage = input.history[input.history.length - 1];
    const historyForGenkit = input.history.slice(0, -1).map((msg) => ({
        role: msg.role,
        content: [{ text: msg.content }],
    }));
    
    const response = await ai.generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: lastMessage.content,
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
