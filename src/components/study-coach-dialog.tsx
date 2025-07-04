
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Bot, User, Loader2, Paperclip, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, calculateFinalGrade } from "@/lib/utils";
import { getTutorResponse, ChatMessage } from "@/ai/flows/tutor-chat-flow";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Subject, Grade, Attachment } from "@/lib/types";
import { FileSelectionDialog } from "./file-selection-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudyCoachPage } from "./study-coach-page";
import { Card } from "./ui/card";

type TutorChatProps = {
  subjects: Subject[];
  allGrades: Grade[];
  isPro: boolean;
};

export function TutorChat({ subjects, allGrades, isPro }: TutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Hallo! Ich bin dein KI-Tutor. Ich kenne deine Fächer und Noten. Wie kann ich dir heute helfen? Du kannst mir auch Dateien zum Analysieren geben." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAttachmentSelectorOpen, setAttachmentSelectorOpen] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
    <Tabs defaultValue="tutor" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto mb-6">
            <TabsTrigger value="tutor">KI-Tutor</TabsTrigger>
            <TabsTrigger value="coach">Lern-Coach</TabsTrigger>
        </TabsList>
        <TabsContent value="tutor">
             <Card className="flex flex-col relative" style={{height: 'calc(100vh - 200px)'}}>
                {!isPro && (
                    <div className="absolute inset-0 bg-background/80 z-10 flex flex-col items-center justify-center p-8 text-center">
                        <Zap className="h-10 w-10 text-primary mb-4" />
                        <h3 className="text-xl font-bold">Exklusiv für Pro-Mitglieder</h3>
                        <p className="text-muted-foreground mt-2">Der KI-Tutor ist ein Premium-Feature. Führe ein Upgrade durch, um ihn freizuschalten.</p>
                    </div>
                )}
                <ScrollArea className={cn("flex-1 p-4", !isPro && "blur-sm")} ref={scrollAreaRef}>
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
                      disabled={loading || !isPro}
                      className="flex-1"
                      onKeyDown={(e) => {
                          if(e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSend();
                          }
                      }}
                    />
                    <Button type="submit" size="icon" disabled={loading || (!input.trim() && selectedAttachments.length === 0) || !isPro}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      <span className="sr-only">Senden</span>
                    </Button>
                  </form>
                </div>
              </Card>
            <FileSelectionDialog 
                isOpen={isAttachmentSelectorOpen}
                onOpenChange={setAttachmentSelectorOpen}
                onFilesSelected={setSelectedAttachments}
                subjects={subjects}
                grades={allGrades}
            />
        </TabsContent>
        <TabsContent value="coach">
            <StudyCoachPage subjects={subjects} allGrades={allGrades} isPro={isPro} />
        </TabsContent>
    </Tabs>
  );
}
