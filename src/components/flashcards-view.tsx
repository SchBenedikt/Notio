"use client";

import React, { useState, useCallback, useEffect } from 'react';
import type { CarouselApi } from "@/components/ui/carousel";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';
import type { StudyCard } from '@/lib/types';

type FlashcardsViewProps = {
  cards: StudyCard[];
};

export function FlashcardsView({ cards }: FlashcardsViewProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [flipped, setFlipped] = useState<boolean[]>(Array(cards.length).fill(false));

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const toggleFlip = (index: number) => {
    setFlipped(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === ' ') {
        event.preventDefault();
        toggleFlip(current - 1);
    }
  }, [current]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);


  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {cards.map((card, index) => (
            <CarouselItem key={card.id}>
                <div className="p-1 perspective-1000">
                    <div 
                        className={cn(
                            "relative w-full h-80 rounded-lg transition-transform duration-700 preserve-3d",
                            flipped[index] ? "rotate-y-180" : ""
                        )}
                        onClick={() => toggleFlip(index)}
                    >
                        <Card className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 text-center">
                            <p className="text-2xl font-semibold">{card.term}</p>
                        </Card>
                         <Card className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-6 text-center bg-secondary">
                            <p className="text-xl">{card.definition}</p>
                        </Card>
                    </div>
                </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="w-full px-12 space-y-2">
        <div className="py-2 text-center text-sm text-muted-foreground">
          Karte {current} von {count}
        </div>
        <Progress value={(current / count) * 100} />
         <div className="text-center text-xs text-muted-foreground pt-1">
            Klicke auf die Karte oder drücke die Leertaste, um sie umzudrehen.
        </div>
      </div>
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
    </div>
  );
}
