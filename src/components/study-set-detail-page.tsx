
"use client";

import { useState, useMemo } from "react";
import type { StudySet, StudyCard, Lernzettel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, BookOpen, Layers, Pencil, BrainCircuit, PenSquare, Puzzle, FileQuestion, Brain, Link as LinkIcon, Notebook, Star, Zap } from "lucide-react";
import { FlashcardsView } from "./flashcards-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { WriteView } from "./write-view";
import { StudySetQuizView } from "./study-set-quiz-view";
import { MatchView } from "./match-view";
import { StudySetTestView } from "./study-set-test-view";
import { LearnView } from "./learn-view";
import { getDueDate } from '@/lib/srs';
import { format, isToday, isPast } from 'date-fns';
import { de } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


type StudySetDetailPageProps = {
  studySet: StudySet;
  onBack: () => void;
  onEditSet: (set: StudySet) => void;
  onSessionFinish: (updatedCards: StudyCard[]) => Promise<void>;
  allLernzettel: Lernzettel[];
  onViewLernzettel: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  googleAiApiKey: string;
  isPro: boolean;
};

export function StudySetDetailPage({ studySet, onBack, onEditSet, onSessionFinish, allLernzettel, onViewLernzettel, onToggleFavorite, googleAiApiKey, isPro }: StudySetDetailPageProps) {
  const [mode, setMode] = useState<'list' | 'flashcards' | 'write' | 'match' | 'quiz' | 'test' | 'learn'>('learn');

  const hasCards = studySet.cards.length > 0;
  
  const linkedLernzettel = useMemo(() => {
    return allLernzettel.filter(lz => lz.studySetIds?.includes(studySet.id));
  }, [studySet.id, allLernzettel]);

  const getSrsStatus = (card: StudyCard) => {
    if (!card.srs || card.srs.repetitions === 0) {
        return { text: "Neu", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300" };
    }
    const dueDate = getDueDate(card);
    if (isToday(dueDate) || isPast(dueDate)) {
        return { text: "Fällig", color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" };
    }
    return { text: "Gelernt", color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" };
  };

  const getDueDateString = (card: StudyCard) => {
      if (!card.srs || card.srs.repetitions === 0) {
          return "Sofort";
      }
      const dueDate = getDueDate(card);
      return format(dueDate, "dd.MM.yy");
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zu allen Lernsets
        </Button>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold">{studySet.title}</h1>
                {studySet.description && <p className="text-lg text-muted-foreground mt-1">{studySet.description}</p>}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Layers className="h-4 w-4" />
                    <span>{studySet.cards.length} Begriff{studySet.cards.length !== 1 ? 'e' : ''}</span>
                </div>
            </div>
             <div className="flex gap-2">
                <Button variant="outline" size="icon" title="Favorisieren" onClick={() => onToggleFavorite(studySet.id, !!studySet.isFavorite)}>
                    <Star className={cn("h-4 w-4", studySet.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
                </Button>
                <Button variant="outline" onClick={() => onEditSet(studySet)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Bearbeiten
                </Button>
            </div>
        </div>
      </div>
      
       {linkedLernzettel && linkedLernzettel.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                      <LinkIcon className="h-4 w-4" />
                      Verknüpfte Lernzettel
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-2">
                      {linkedLernzettel.map(lz => (
                          <Button key={lz.id} variant="outline" className="w-full justify-start" onClick={() => onViewLernzettel(lz.id)}>
                              <Notebook className="mr-2 h-4 w-4" />
                              {lz.title}
                          </Button>
                      ))}
                  </div>
              </CardContent>
          </Card>
      )}

      <Tabs value={mode} onValueChange={(value) => setMode(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-7 max-w-5xl">
            <TabsTrigger value="learn" disabled={!hasCards}><Brain className="mr-2 h-4 w-4" />Lernen</TabsTrigger>
            <TabsTrigger value="list"><BookOpen className="mr-2 h-4 w-4" /> Begriffe</TabsTrigger>
            <TabsTrigger value="flashcards" disabled={!hasCards}><Layers className="mr-2 h-4 w-4" />Karten</TabsTrigger>
            <TabsTrigger value="write" disabled={!hasCards}><PenSquare className="mr-2 h-4 w-4" />Schreiben</TabsTrigger>
            <TabsTrigger value="match" disabled={!hasCards}><Puzzle className="mr-2 h-4 w-4" />Zuordnen</TabsTrigger>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <TabsTrigger value="quiz" disabled={!hasCards || !isPro} className="relative">
                            <BrainCircuit className="mr-2 h-4 w-4" />KI-Quiz
                            {!isPro && <Zap className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400" />}
                        </TabsTrigger>
                    </TooltipTrigger>
                    {!isPro && (
                        <TooltipContent>
                        <p>Dieses Feature ist nur für Pro-Mitglieder verfügbar.</p>
                        </TooltipContent>
                    )}
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <TabsTrigger value="test" disabled={!hasCards || !isPro} className="relative">
                            <FileQuestion className="mr-2 h-4 w-4"/>Test
                            {!isPro && <Zap className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400" />}
                        </TabsTrigger>
                    </TooltipTrigger>
                     {!isPro && (
                        <TooltipContent>
                        <p>Dieses Feature ist nur für Pro-Mitglieder verfügbar.</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        </TabsList>

        <TabsContent value="learn" className="mt-4">
            {hasCards ? <LearnView studySet={studySet} onSessionFinish={onSessionFinish} googleAiApiKey={googleAiApiKey} /> : null}
        </TabsContent>
        <TabsContent value="list" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Begriffe im Lernset</CardTitle>
                    <CardDescription>Hier ist eine Übersicht aller Begriffe und Definitionen in diesem Set inklusive deines Lernfortschritts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[50vh] pr-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30%]">Begriff</TableHead>
                                    <TableHead className="w-[40%]">Definition</TableHead>
                                    <TableHead className="w-[15%] hidden md:table-cell">Status</TableHead>
                                    <TableHead className="w-[15%] text-right">Nächste Wiederholung</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studySet.cards.map((card) => {
                                    const status = getSrsStatus(card);
                                    return (
                                        <TableRow key={card.id}>
                                            <TableCell className="font-medium">{card.term}</TableCell>
                                            <TableCell>{card.definition}</TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge variant="outline" className={cn("border", status.color)}>{status.text}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-sm">{getDueDateString(card)}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="flashcards" className="mt-4">
            {hasCards ? <FlashcardsView cards={studySet.cards} /> : null}
        </TabsContent>
        <TabsContent value="write" className="mt-4">
            {hasCards ? <WriteView cards={studySet.cards} googleAiApiKey={googleAiApiKey} /> : null}
        </TabsContent>
         <TabsContent value="match" className="mt-4">
            {hasCards ? <MatchView cards={studySet.cards} /> : null}
        </TabsContent>
         <TabsContent value="quiz" className="mt-4">
            {hasCards && isPro ? <StudySetQuizView studySet={studySet} googleAiApiKey={googleAiApiKey} /> : null}
        </TabsContent>
        <TabsContent value="test" className="mt-4">
            {hasCards && isPro ? <StudySetTestView studySet={studySet} googleAiApiKey={googleAiApiKey} /> : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
