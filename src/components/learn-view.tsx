
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { StudySet, StudyCard } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Loader2, Brain, Check, ThumbsUp, ThumbsDown, Trophy, RefreshCw, XCircle } from 'lucide-react';
import { createStudySession } from '@/ai/flows/study-session-flow';
import { updateSrsData, SrsPerformance } from '@/lib/srs';
import { shuffle } from 'lodash-es';

type LearnViewProps = {
  studySet: StudySet;
  onSessionFinish: (updatedCards: StudyCard[]) => Promise<void>;
  googleAiApiKey: string;
};

export function LearnView({ studySet, onSessionFinish, googleAiApiKey }: LearnViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionCards, setSessionCards] = useState<StudyCard[]>([]);
  const [sessionTitle, setSessionTitle] = useState("");
  const [updatedCardsData, setUpdatedCardsData] = useState<Map<string, StudyCard>>(new Map());
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [key, setKey] = useState(Date.now());

  useEffect(() => {
    const startNewSession = async () => {
      setLoading(true);
      setError(null);
      setIsFinished(false);
      setCurrentIndex(0);
      setIsFlipped(false);
      setUpdatedCardsData(new Map());

      try {
        const response = await createStudySession({ 
            cards: studySet.cards, 
            maxCards: 15,
            apiKey: googleAiApiKey,
        });
        const cardsForSession = response.cardIds
          .map(id => studySet.cards.find(c => c.id === id))
          .filter((c): c is StudyCard => !!c);
        
        if(cardsForSession.length === 0) {
            setError("Aktuell sind keine Karten zum Lernen fällig. Versuche es später erneut oder starte einen anderen Lernmodus.");
        } else {
            setSessionCards(shuffle(cardsForSession));
            setSessionTitle(response.sessionTitle);
        }
      } catch (err) {
        console.error("Failed to create study session:", err);
        setError("Die Lerneinheit konnte nicht erstellt werden. Bitte versuche es später erneut.");
      } finally {
        setLoading(false);
      }
    };
    startNewSession();
  }, [studySet, key, googleAiApiKey]);

  const currentCard = sessionCards[currentIndex];

  const handlePerformanceSelect = (performance: SrsPerformance) => {
    if (!currentCard) return;

    const updatedCard = updateSrsData(currentCard, performance);
    setUpdatedCardsData(prev => new Map(prev).set(currentCard.id, updatedCard));

    if (currentIndex < sessionCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleFinishAndSave = async () => {
    setIsSaving(true);
    // Merge updated cards with the original set
    const finalCards = studySet.cards.map(originalCard => {
      return updatedCardsData.get(originalCard.id) || originalCard;
    });

    await onSessionFinish(finalCards);
    setIsSaving(false);
    // Show a success message or transition away, for now we just show finished state
  };
  
  if (loading) {
    return <Card className="flex flex-col items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary mb-4" /><p className="text-muted-foreground">Persönliche Lerneinheit wird vorbereitet...</p></Card>;
  }

  if (error) {
    return <Alert variant="destructive"><XCircle className="h-4 w-4" /><AlertTitle>Fehler</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
  }
  
  if (isFinished) {
      return (
          <Card className="w-full max-w-2xl mx-auto text-center">
              <CardHeader>
                  <div className="flex justify-center mb-4"><Trophy className="h-12 w-12 text-yellow-500" /></div>
                  <CardTitle className="text-2xl">Super! Lerneinheit abgeschlossen.</CardTitle>
                  <CardDescription>Dein Lernfortschritt wurde vermerkt. Bist du bereit für eine neue Runde?</CardDescription>
              </CardHeader>
              <CardContent>
                  <p>Du hast {sessionCards.length} Karten wiederholt.</p>
              </CardContent>
              <CardFooter className="flex-col sm:flex-row gap-2">
                  <Button onClick={() => setKey(Date.now())} className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Neue Runde starten
                  </Button>
                  <Button onClick={handleFinishAndSave} variant="secondary" className="w-full" disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4"/>}
                      Fortschritt speichern & Beenden
                  </Button>
              </CardFooter>
          </Card>
      )
  }

  if (!currentCard) {
      return <Card className="flex items-center justify-center min-h-[400px]"><p>Keine Karten in dieser Sitzung.</p></Card>
  }
  
  const progress = ((currentIndex + 1) / sessionCards.length) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{sessionTitle || "Lerneinheit"}</CardTitle>
        <Progress value={progress} className="mt-2" />
        <CardDescription className="text-center pt-2">{currentIndex + 1} / {sessionCards.length}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="[perspective:1000px] min-h-[250px]">
          <div 
              className={cn(
                  "relative w-full h-full rounded-lg transition-transform duration-500 [transform-style:preserve-3d]",
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
              )}
              onClick={() => setIsFlipped(f => !f)}
          >
            <div className="absolute w-full h-full [backface-visibility:hidden] flex items-center justify-center p-6 text-center border rounded-lg">
                <p className="text-2xl font-semibold">{currentCard.term}</p>
            </div>
            <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center p-6 text-center bg-muted rounded-lg">
                <p className="text-xl">{currentCard.definition}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
          {isFlipped ? (
            <div className="w-full space-y-3 animate-fade-in-down">
                <p className="text-center text-sm font-medium">Wie gut kanntest du die Antwort?</p>
                <div className="grid grid-cols-3 gap-3">
                    <Button variant="destructive" onClick={() => handlePerformanceSelect('again')}>
                        <ThumbsDown className="mr-2 h-4 w-4" /> Nicht gewusst
                    </Button>
                    <Button variant="outline" className="bg-green-100/80 border-green-300 hover:bg-green-100 dark:bg-green-900/30 dark:border-green-700 dark:hover:bg-green-900/50" onClick={() => handlePerformanceSelect('good')}>
                        <Check className="mr-2 h-4 w-4" /> Gewusst
                    </Button>
                    <Button variant="secondary" className="bg-blue-100/80 border-blue-300 hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-700 dark:hover:bg-blue-900/50" onClick={() => handlePerformanceSelect('easy')}>
                        <ThumbsUp className="mr-2 h-4 w-4" /> Einfach!
                    </Button>
                </div>
            </div>
          ) : (
            <Button onClick={() => setIsFlipped(true)} className="w-full">Antwort aufdecken</Button>
          )}
      </CardFooter>
    </Card>
  );
}
