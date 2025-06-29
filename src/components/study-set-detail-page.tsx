"use client";

import { useState } from "react";
import type { StudySet } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, BookOpen, Layers, Pencil, BrainCircuit, PenSquare, Puzzle, FileQuestion } from "lucide-react";
import { FlashcardsView } from "./flashcards-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { WriteView } from "./write-view";
import { StudySetQuizView } from "./study-set-quiz-view";
import { MatchView } from "./match-view";
import { StudySetTestView } from "./study-set-test-view";

type StudySetDetailPageProps = {
  studySet: StudySet;
  onBack: () => void;
  onEditSet: (set: StudySet) => void;
};

export function StudySetDetailPage({ studySet, onBack, onEditSet }: StudySetDetailPageProps) {
  const [mode, setMode] = useState<'list' | 'flashcards' | 'write' | 'quiz' | 'match' | 'test'>('list');

  const hasCards = studySet.cards.length > 0;

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
             <Button variant="outline" onClick={() => onEditSet(studySet)}>
                <Pencil className="mr-2 h-4 w-4" />
                Bearbeiten
            </Button>
        </div>
      </div>
      
      <Tabs value={mode} onValueChange={(value) => setMode(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 max-w-4xl">
            <TabsTrigger value="list"><BookOpen className="mr-2 h-4 w-4" /> Begriffe</TabsTrigger>
            <TabsTrigger value="flashcards" disabled={!hasCards}><Layers className="mr-2 h-4 w-4" />Karten</TabsTrigger>
            <TabsTrigger value="write" disabled={!hasCards}><PenSquare className="mr-2 h-4 w-4" />Schreiben</TabsTrigger>
            <TabsTrigger value="match" disabled={!hasCards}><Puzzle className="mr-2 h-4 w-4" />Zuordnen</TabsTrigger>
            <TabsTrigger value="quiz" disabled={!hasCards}><BrainCircuit className="mr-2 h-4 w-4" />KI-Quiz</TabsTrigger>
            <TabsTrigger value="test" disabled={!hasCards}><FileQuestion className="mr-2 h-4 w-4"/>Test</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Begriffe im Lernset</CardTitle>
                    <CardDescription>Hier ist eine Übersicht aller Begriffe und Definitionen in diesem Set.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[50vh] pr-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-1/2">Begriff</TableHead>
                                    <TableHead className="w-1/2">Definition</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studySet.cards.map((card) => (
                                    <TableRow key={card.id}>
                                    <TableCell className="font-medium">{card.term}</TableCell>
                                    <TableCell>{card.definition}</TableCell>
                                    </TableRow>
                                ))}
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
            {hasCards ? <WriteView cards={studySet.cards} /> : null}
        </TabsContent>
         <TabsContent value="quiz" className="mt-4">
            {hasCards ? <StudySetQuizView studySet={studySet} /> : null}
        </TabsContent>
        <TabsContent value="match" className="mt-4">
            {hasCards ? <MatchView cards={studySet.cards} /> : null}
        </TabsContent>
        <TabsContent value="test" className="mt-4">
            {hasCards ? <StudySetTestView studySet={studySet} /> : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
