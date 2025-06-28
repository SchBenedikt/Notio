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
  subjects: z.array(z.string()).describe("A list of the student's subjects."),
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

    const systemPrompt = `Du bist ein hilfsbereiter und freundlicher KI-Tutor für einen Schüler in Deutschland. Deine Aufgabe ist es, Fragen zu beantworten, Konzepte zu erklären und bei den Hausaufgaben zu helfen.

Der Schüler hat folgende Fächer: ${input.subjects.join(', ')}.

Sei ermutigend, geduldig und sprich den Schüler mit "Du" an. Antworte immer auf Deutsch.`;

    const historyForGenkit = input.history.map((msg) => ({
        role: msg.role,
        content: [{ text: msg.content }],
    }));
    
    const response = await ai.generate({
        prompt: "", // Prompt is empty because the query is the last message in history
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

    const output = response.output();
    if (!output) {
      throw new Error("AI did not return a valid response.");
    }
    return output;
  }
);
