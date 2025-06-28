"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Bot, User, Loader2, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, calculateFinalGrade } from "@/lib/utils";
import { getTutorResponse, ChatMessage } from "@/ai/flows/tutor-chat-flow";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Subject, Grade } from "@/lib/types";
import { StudyCoachDialog } from "./study-coach-dialog";

type TutorChatProps = {
  subjects: Subject[];
  allGrades: Grade[];
};

export function TutorChat({ subjects, allGrades }: TutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hallo! Ich bin dein KI-Tutor. Ich kenne deine Fächer und Noten. Wie kann ich dir heute helfen?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [coachSubjectId, setCoachSubjectId] = useState<string | undefined>();
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const selectedCoachSubject = useMemo(() => coachSubjectId ? subjects.find(s => s.id === coachSubjectId) : undefined, [coachSubjectId, subjects]);
  const selectedCoachGrades = useMemo(() => selectedCoachSubject ? allGrades.filter(g => g.subjectId === selectedCoachSubject.id) : [], [selectedCoachSubject, allGrades]);

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
      const subjectsForTutor = subjects.map(subject => {
        const subjectGrades = allGrades.filter(g => g.subjectId === subject.id);
        const subjectAverage = calculateFinalGrade(subjectGrades, subject);
        return {
            name: subject.name,
            category: subject.category,
            average: subjectAverage,
            targetGrade: subject.targetGrade,
            grades: subjectGrades.map(g => ({
                name: g.name,
                value: g.value,
                type: g.type,
                notes: g.notes,
            }))
        };
      });

      const response = await getTutorResponse({
        subjects: subjectsForTutor,
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
    <>
    <div className="flex flex-col h-full bg-card rounded-lg shadow-sm border">
       <div className="p-4 border-b flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                KI-Tutor Chat
            </h3>
            <p className="text-sm text-muted-foreground">Stelle Fragen zu deinen Fächern und Noten.</p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    Lern-Coach starten
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Lern-Coach</h4>
                        <p className="text-sm text-muted-foreground">
                            Wähle ein Fach, um eine KI-basierte Analyse und Lerntipps zu erhalten.
                        </p>
                    </div>
                    <div className="grid gap-2">
                         <Select onValueChange={setCoachSubjectId} value={coachSubjectId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Fach auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.length > 0 ?
                                    subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)
                                    : <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">Keine Fächer vorhanden.</div>
                                }
                            </SelectContent>
                        </Select>
                        <Button onClick={() => setIsCoachOpen(true)} disabled={!coachSubjectId}>
                            Analyse starten
                        </Button>
                    </div>
                </div>
            </PopoverContent>
          </Popover>
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
    {selectedCoachSubject && (
        <StudyCoachDialog
            isOpen={isCoachOpen}
            onOpenChange={(isOpen) => {
                setIsCoachOpen(isOpen);
                if (!isOpen) {
                    setCoachSubjectId(undefined); 
                }
            }}
            subject={selectedCoachSubject}
            grades={selectedCoachGrades}
        />
    )}
    </>
  );
}
