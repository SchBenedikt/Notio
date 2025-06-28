"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getTutorResponse, ChatMessage } from "@/ai/flows/tutor-chat-flow";
import { Avatar, AvatarFallback } from "./ui/avatar";


type TutorChatProps = {
  subjects: string[];
};

export function TutorChat({ subjects }: TutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hallo! Ich bin dein KI-Tutor. Wie kann ich dir heute helfen?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollViewport = scrollAreaRef.current?.querySelector("div[data-radix-scroll-area-viewport]");
    if (scrollViewport) {
      scrollViewport.scrollTop = scrollViewport.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await getTutorResponse({
        subjects,
        history: newMessages,
      });
      setMessages(prev => [...prev, { role: 'model', content: response.response }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Entschuldigung, da ist etwas schiefgelaufen. Bitte versuche es erneut." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            KI-Tutor Chat
        </h3>
        <p className="text-sm text-muted-foreground">Stelle Fragen zu deinen Fächern.</p>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'model' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "p-3 rounded-lg max-w-sm prose prose-sm dark:prose-invert",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p>{message.content}</p>
              </div>
               {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
           {loading && (
            <div className="flex items-start gap-3 justify-start">
               <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              <div className="p-3 rounded-lg bg-muted flex items-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Stelle eine Frage..."
            disabled={loading}
            className="flex-1"
            onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            }}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Senden</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
