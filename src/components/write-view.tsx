
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import type { StudyCard } from '@/lib/types';
import { shuffle } from 'lodash-es';
import { CheckCircle, XCircle, RefreshCw, Lightbulb, Loader2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { evaluateAnswer } from '@/ai/flows/evaluate-answer-flow';


type WriteViewProps = {
  cards: StudyCard[];
  googleAiApiKey: string;
};

export function WriteView({ cards, googleAiApiKey }: WriteViewProps) {
  const [shuffledCards, setShuffledCards] = useState<StudyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{ isCorrect: boolean, feedback: string } | null>(null);
  const [session, setSession] = useState({ correct: new Set<string>(), incorrect: new Set<string>() });
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startSession();
  }, [cards]);

  const startSession = (retryIncorrect = false) => {
    let cardsToLearn = cards;
    if (retryIncorrect) {
      const incorrectCards = cards.filter(c => session.incorrect.has(c.id));
      if (incorrectCards.length > 0) {
        cardsToLearn = incorrectCards;
      }
    }
    
    setShuffledCards(shuffle(cardsToLearn));
    setCurrentIndex(0);
    setInputValue("");
    setIsAnswered(false);
    setEvaluationResult(null);
    setSession({ correct: new Set(), incorrect: new Set() });
    setIsFinished(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  
  const currentCard = shuffledCards[currentIndex];

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !currentCard || isChecking) return;

    setIsChecking(true);
    setIsAnswered(true);
    setEvaluationResult(null);

    try {
      const result = await evaluateAnswer({
        userAnswer: inputValue,
        correctTerm: currentCard.term,
        definition: currentCard.definition,
        apiKey: googleAiApiKey,
      });

      setEvaluationResult({ isCorrect: result.isCorrect, feedback: result.feedback });

      setSession(prev => {
        const newSession = { ...prev };
        if (result.isCorrect) {
          newSession.correct.add(currentCard.id);
        } else {
          newSession.incorrect.add(currentCard.id);
        }
        return newSession;
      });
    } catch (error) {
      console.error("Evaluation error:", error);
      // Fallback to simple check on error
      const isSimpleCorrect = inputValue.trim().toLowerCase() === currentCard.term.toLowerCase();
      setEvaluationResult({
        isCorrect: isSimpleCorrect,
        feedback: isSimpleCorrect ? "Richtig!" : `Die richtige Antwort lautet: ${currentCard.term}`,
      });
       setSession(prev => {
        const newSession = { ...prev };
        if (isSimpleCorrect) {
          newSession.correct.add(currentCard.id);
        } else {
          newSession.incorrect.add(currentCard.id);
        }
        return newSession;
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setInputValue("");
      setIsAnswered(false);
      setEvaluationResult(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setIsFinished(true);
    }
  };

  if (shuffledCards.length === 0) {
      return null;
  }
  
  if (isFinished) {
      return (
          <Card className="w-full max-w-2xl mx-auto text-center">
              <CardHeader>
                  <CardTitle className="text-2xl">Runde beendet!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-100/60 dark:bg-green-900/30 rounded-lg">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{session.correct.size}</p>
                        <p className="text-sm font-medium text-muted-foreground">Richtig</p>
                    </div>
                     <div className="p-4 bg-red-100/60 dark:bg-red-900/30 rounded-lg">
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{session.incorrect.size}</p>
                        <p className="text-sm font-medium text-muted-foreground">Falsch</p>
                    </div>
                 </div>
              </CardContent>
              <CardFooter className="flex-col sm:flex-row gap-2">
                  <Button onClick={() => startSession(false)} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Neu starten
                  </Button>
                  {session.incorrect.size > 0 && (
                      <Button onClick={() => startSession(true)} variant="outline" className="w-full">
                          <Lightbulb className="mr-2 h-4 w-4" />
                          Fehler wiederholen ({session.incorrect.size})
                      </Button>
                  )}
              </CardFooter>
          </Card>
      )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Schreiben</CardTitle>
        <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
            <span>Fortschritt</span>
            <span>{currentIndex + 1} / {shuffledCards.length}</span>
        </div>
        <Progress value={((currentIndex + 1) / shuffledCards.length) * 100} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-md min-h-[100px] flex items-center justify-center">
          <p className="text-center font-medium">{currentCard?.definition}</p>
        </div>
        <form onSubmit={handleCheck}>
            <div className="relative">
                <Input
                    ref={inputRef}
                    placeholder="Tippe den Begriff..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isAnswered || isChecking}
                    className={cn(
                        "pr-10 h-12 text-base",
                        isAnswered && evaluationResult?.isCorrect && "border-green-500 focus-visible:ring-green-500",
                        isAnswered && !evaluationResult?.isCorrect && "border-red-500 focus-visible:ring-red-500"
                    )}
                />
                <div className="absolute inset-y-0 right-3 flex items-center">
                    {isChecking ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        isAnswered && (
                            evaluationResult?.isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )
                        )
                    )}
                </div>
            </div>
            {!isAnswered && (
                <Button type="submit" className="w-full mt-4" disabled={!inputValue.trim() || isChecking}>
                    {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Antwort prüfen
                </Button>
            )}
        </form>
         {isAnswered && evaluationResult && (
            <Alert variant={evaluationResult.isCorrect ? "default" : "destructive"} className={cn("animate-fade-in-down", evaluationResult.isCorrect && "border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-900/30")}>
                <AlertTitle className="flex items-center gap-2">
                    {evaluationResult.isCorrect ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                     Feedback
                </AlertTitle>
                <AlertDescription>
                    {evaluationResult.feedback}
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleNext} className="w-full" disabled={!isAnswered || isChecking}>
            Weiter
        </Button>
      </CardFooter>
    </Card>
  );
}
