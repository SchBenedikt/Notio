"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Bot, User, Loader2, BrainCircuit, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, calculateFinalGrade } from "@/lib/utils";
import { getTutorResponse, ChatMessage } from "@/ai/flows/tutor-chat-flow";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Subject, Grade, Attachment } from "@/lib/types";
import { StudyCoachDialog } from "./study-coach-dialog";
import { FileSelectionDialog } from "./file-selection-dialog";

type TutorChatProps = {
  subjects: Subject[];
  allGrades: Grade[];
};

export function TutorChat({ subjects, allGrades }: TutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hallo! Ich bin dein KI-Tutor. Ich kenne deine Fächer und Noten. Wie kann ich dir heute helfen? Du kannst auch den Lern-Coach für ein bestimmtes Fach starten oder mir Dateien zum Analysieren geben." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [coachSubjectId, setCoachSubjectId] = useState<string | undefined>();
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isAttachmentSelectorOpen, setAttachmentSelectorOpen] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([]);
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
    if (!input.trim() && selectedAttachments.length === 0) return;

    const userMessage: ChatMessage = { 
      role: 'user', 
      content: input,
      attachments: selectedAttachments,
    };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setSelectedAttachments([]);
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
  
  const removeSelectedAttachment = (indexToRemove: number) => {
    setSelectedAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const hasAnyAttachments = useMemo(() => {
    return allGrades.some(g => g.attachments && g.attachments.length > 0);
  }, [allGrades]);

  return (
    <>
    <div className="flex flex-col h-full bg-card rounded-lg shadow-sm border">
       <div className="p-4 border-b flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                KI-Tutor & Coach
            </h3>
            <p className="text-sm text-muted-foreground">Stelle Fragen und erhalte eine Lernanalyse.</p>
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
                {message.content && <p>{message.content}</p>}
                {message.attachments && message.attachments.length > 0 && (
                  <div className={cn("space-y-1", message.content && "border-t border-primary-foreground/20 pt-2 mt-2")}>
                    {message.attachments.map((att, attIndex) => (
                      <div key={attIndex} className="flex items-center gap-2 text-xs">
                        <Paperclip className="h-3 w-3" />
                        <span className="truncate max-w-[200px]">{att.name}</span>
                      </div>
                    ))}
                  </div>
                )}
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
        {selectedAttachments.length > 0 && (
          <div className="mb-2 p-2 border rounded-lg">
              <p className="text-xs text-muted-foreground font-medium mb-2">Anhänge:</p>
              <div className="flex flex-wrap gap-2">
              {selectedAttachments.map((att, index) => (
                  <div key={index} className="flex items-center gap-1.5 bg-muted rounded-full pl-2 pr-1 py-0.5 text-sm">
                      <Paperclip className="h-3 w-3" />
                      <span className="truncate max-w-[150px]">{att.name}</span>
                      <button onClick={() => removeSelectedAttachment(index)} className="rounded-full hover:bg-muted-foreground/20 p-0.5" title="Anhang entfernen">
                          <X className="h-3 w-3" />
                      </button>
                  </div>
              ))}
              </div>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => setAttachmentSelectorOpen(true)} 
            disabled={loading || !hasAnyAttachments}
            title={hasAnyAttachments ? 'Datei anhängen' : 'Keine Dateien zum Anhängen vorhanden'}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Stelle eine Frage oder füge eine Datei hinzu..."
            disabled={loading}
            className="flex-1"
            onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            }}
          />
          <Button type="submit" size="icon" disabled={loading || (!input.trim() && selectedAttachments.length === 0)}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Senden</span>
          </Button>
        </form>
      </div>
    </div>
    <FileSelectionDialog 
      isOpen={isAttachmentSelectorOpen}
      onOpenChange={setAttachmentSelectorOpen}
      onFilesSelected={setSelectedAttachments}
      subjects={subjects}
      grades={allGrades}
    />
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
