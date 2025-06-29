"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { StudyCard } from '@/lib/types';
import { shuffle } from 'lodash-es';
import { Timer, Shuffle, RefreshCw, Trophy } from 'lucide-react';

type GameCard = {
  id: string; // The original card id to match pairs
  type: 'term' | 'definition';
  content: string;
  uniqueId: string; // To distinguish between term and definition of the same card
};

type MatchViewProps = {
  cards: StudyCard[];
};

export function MatchView({ cards }: MatchViewProps) {
  const [gameCards, setGameCards] = useState<GameCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [incorrectPair, setIncorrectPair] = useState<[string, string] | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const setupGame = () => {
    const allItems: GameCard[] = [];
    cards.forEach(card => {
      allItems.push({ id: card.id, type: 'term', content: card.term, uniqueId: `${card.id}-term` });
      allItems.push({ id: card.id, type: 'definition', content: card.definition, uniqueId: `${card.id}-def` });
    });
    setGameCards(shuffle(allItems));
    setSelectedCard(null);
    setMatchedPairs([]);
    setIncorrectPair(null);
    setIsFinished(false);
    setStartTime(Date.now());
    setElapsedTime(0);
  };

  useEffect(() => {
    setupGame();
  }, [cards]);

  useEffect(() => {
    if (startTime && !isFinished) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [startTime, isFinished]);

  const handleCardClick = (card: GameCard) => {
    if (incorrectPair || matchedPairs.includes(card.id)) return;

    if (!selectedCard) {
      setSelectedCard(card);
    } else {
      if (selectedCard.uniqueId === card.uniqueId) {
        // Deselect if clicking the same card
        setSelectedCard(null);
        return;
      }

      if (selectedCard.id === card.id && selectedCard.type !== card.type) {
        // Match found
        setMatchedPairs(prev => [...prev, card.id]);
        setSelectedCard(null);
        if (matchedPairs.length + 1 === cards.length) {
            setIsFinished(true);
            setStartTime(null);
        }
      } else {
        // Incorrect match
        setIncorrectPair([selectedCard.uniqueId, card.uniqueId]);
        setTimeout(() => {
          setIncorrectPair(null);
          setSelectedCard(null);
        }, 800);
      }
    }
  };
  
  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(2);
  };

  if (isFinished) {
    return (
        <Card className="w-full max-w-2xl mx-auto text-center">
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <Trophy className="h-12 w-12 text-yellow-500" />
                </div>
                <CardTitle className="text-2xl">Geschafft!</CardTitle>
                <CardDescription>Du hast alle Paare gefunden.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold text-primary">{formatTime(elapsedTime)}s</p>
                <p className="text-muted-foreground">Deine Zeit</p>
            </CardContent>
            <CardFooter>
                <Button onClick={setupGame} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Nochmal spielen
                </Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
            <CardTitle>Zuordnen</CardTitle>
            <CardDescription>Klicke auf einen Begriff und die passende Definition, um sie verschwinden zu lassen.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex justify-between items-center mb-4 p-2 bg-muted rounded-md">
                <Button variant="ghost" onClick={setupGame}><Shuffle className="mr-2 h-4 w-4"/>Mischen</Button>
                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <Timer className="h-5 w-5" />
                    <span>{formatTime(elapsedTime)}s</span>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {gameCards.map(card => {
                    const isMatched = matchedPairs.includes(card.id);
                    const isSelected = selectedCard?.uniqueId === card.uniqueId;
                    const isIncorrect = incorrectPair?.includes(card.uniqueId);

                    return (
                        <div
                            key={card.uniqueId}
                            className={cn(
                                "h-28 flex items-center justify-center p-3 text-center rounded-lg border text-sm font-medium cursor-pointer transition-all duration-300",
                                isMatched ? "opacity-0 scale-50 pointer-events-none" : "opacity-100 scale-100",
                                isSelected && "ring-2 ring-primary bg-primary/10",
                                isIncorrect ? "bg-red-100 dark:bg-red-900/50 border-red-500 animate-shake" : "bg-card hover:bg-muted/50"
                            )}
                            onClick={() => handleCardClick(card)}
                        >
                           {card.content}
                        </div>
                    );
                })}
            </div>
        </CardContent>
        <style jsx>{`
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            .animate-shake {
                animation: shake 0.4s ease-in-out;
            }
        `}</style>
    </Card>
  );
}
