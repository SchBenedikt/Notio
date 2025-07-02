"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SchoolEvent, AppView } from "@/lib/types";
import { Calendar, ArrowRight, GripVertical } from "lucide-react";
import { format, isWithinInterval, startOfToday, endOfToday, addDays, startOfDay, endOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { eventTypeColors } from './school-calendar-page';

type CalendarWidgetProps = {
    events: SchoolEvent[];
    onNavigate: (view: AppView) => void;
};

export function CalendarWidget({ events, onNavigate }: CalendarWidgetProps) {
    const upcomingEvents = useMemo(() => {
        const today = startOfToday();
        const nextWeek = addDays(endOfToday(), 7);

        return events
            .filter(event => {
                const eventStart = startOfDay(new Date(event.date));
                const eventEnd = event.endDate ? endOfDay(new Date(event.endDate)) : endOfDay(eventStart);
                // Check if event interval overlaps with the next 7 days
                return isWithinInterval(eventStart, { start: today, end: nextWeek }) || isWithinInterval(today, { start: eventStart, end: eventEnd });
            })
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5); // Limit to 5 upcoming events
    }, [events]);

    return (
        <Card className="h-full w-full flex flex-col">
            <CardHeader className="drag-handle flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Schulkalender</CardTitle>
                    <CardDescription>Nächste 7 Tage</CardDescription>
                </div>
                <GripVertical className="text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-1">
                {upcomingEvents.length > 0 ? (
                    <ScrollArea className="h-full">
                        <div className="space-y-3 pr-2">
                            {upcomingEvents.map(event => (
                                <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <div className={cn("w-2 h-10 rounded-full", eventTypeColors[event.type])} />
                                    <div>
                                        <p className="font-semibold text-sm truncate">{event.title}</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(event.date), "eeee, dd.MM.", { locale: de })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="text-center py-10 h-full flex flex-col items-center justify-center">
                        <Calendar className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="mt-4 font-semibold">Keine Termine</p>
                        <p className="text-sm text-muted-foreground">In den nächsten 7 Tagen ist nichts geplant.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="mt-auto border-t pt-4">
                 <Button variant="ghost" size="sm" className="w-full justify-center text-muted-foreground" onClick={() => onNavigate('school-calendar')}>
                    Vollständigen Kalender anzeigen <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
