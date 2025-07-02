"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SchoolEvent, SchoolEventType } from "@/lib/types";
import { Plus, CalendarDays, Users, GraduationCap, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { format, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { AddSchoolEventDialog } from './AddSchoolEventDialog';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';


type SchoolCalendarPageProps = {
  schoolId: string | null;
  schoolName: string | null;
  events: SchoolEvent[];
  selectedGradeLevel: number;
  onAddEvent: (selectedDate: Date) => void;
  onEditEvent: (event: SchoolEvent) => void;
  onDeleteEvent: (eventId: string) => void;
};

const eventTypeColors: Record<SchoolEventType, string> = {
  Prüfung: "bg-red-500",
  Hausaufgabe: "bg-blue-500",
  Ferien: "bg-green-500",
  Veranstaltung: "bg-purple-500",
  Sonstiges: "bg-gray-500",
};

export function SchoolCalendarPage({ schoolId, schoolName, events, selectedGradeLevel, onAddEvent, onEditEvent, onDeleteEvent }: SchoolCalendarPageProps) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
        if (event.target === 'school') {
            return true;
        }
        if (event.target === 'gradeLevel' && event.gradeLevel === selectedGradeLevel) {
            return true;
        }
        return false;
    });
  }, [events, selectedGradeLevel]);

  const eventModifiers = useMemo(() => {
    const holidays = [];
    const singleDays = [];
    for (const event of filteredEvents) {
        if (event.type === 'Ferien' && event.endDate) {
            holidays.push({ from: new Date(event.date), to: new Date(event.endDate) });
        } else {
            singleDays.push(new Date(event.date));
        }
    }
    return { holidays, singleDays };
  }, [filteredEvents]);

  const selectedDayEvents = useMemo(() => {
    return filteredEvents
      .filter(event => {
          const eventStart = startOfDay(new Date(event.date));
          const eventEnd = event.endDate ? endOfDay(new Date(event.endDate)) : endOfDay(eventStart);
          return isWithinInterval(selectedDate, { start: eventStart, end: eventEnd });
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredEvents, selectedDate]);
  
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };

  if (!schoolId || !schoolName) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center min-h-[60vh] bg-background/50 rounded-lg border border-dashed">
        <div className="p-3 bg-primary/10 rounded-full border-8 border-primary/5 mb-4">
            <CalendarDays className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold">Schulkalender</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Bitte wähle zuerst deine Schule in den Profileinstellungen aus, um den geteilten Kalender zu nutzen.
        </p>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Kalender: {schoolName}</h1>
          <p className="text-muted-foreground">
            Geteilte Termine für alle an deiner Schule.
          </p>
        </div>
        <Button onClick={() => onAddEvent(selectedDate)}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Termin
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(day) => day && handleDayClick(day)}
              className="w-full"
              locale={de}
              modifiers={{ 
                holidays: eventModifiers.holidays,
                events: eventModifiers.singleDays,
              }}
              modifiersClassNames={{ 
                holidays: 'day-with-range-event', 
                events: 'day-with-event' 
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{format(selectedDate, "eeee, dd. MMMM", { locale: de })}</CardTitle>
            <CardDescription>Termine an diesem Tag</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {selectedDayEvents.length > 0 ? (
                <ul className="space-y-3">
                  {selectedDayEvents.map(event => (
                    <li key={event.id} className="p-3 rounded-md bg-muted/50 border-l-4 group" style={{ borderColor: eventTypeColors[event.type] }}>
                       <div className="flex justify-between items-start">
                         <p className="font-semibold">{event.title}</p>
                         {user?.uid === event.authorId ? (
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => onEditEvent(event)}><Pencil className="mr-2 h-4 w-4" /> Bearbeiten</DropdownMenuItem>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Löschen</DropdownMenuItem></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Termin löschen?</AlertDialogTitle><AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => onDeleteEvent(event.id)} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                             </DropdownMenu>
                         ) : <div className='w-7 h-7 shrink-0' /> }
                       </div>
                       <p className="text-sm text-muted-foreground">{event.description}</p>
                       <div className="flex justify-between items-center mt-2">
                           <Badge variant="outline" className={cn("text-xs", event.type === "Prüfung" && "border-red-500/50 text-red-600")}>{event.type}</Badge>
                           <p className="text-xs text-muted-foreground">von {event.authorName}</p>
                       </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center pt-10">Keine Termine an diesem Tag.</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
