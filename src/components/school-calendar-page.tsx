"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SchoolEvent, SchoolEventType } from "@/lib/types";
import { Plus, CalendarDays } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { AddSchoolEventDialog } from './AddSchoolEventDialog';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';


type SchoolCalendarPageProps = {
  schoolId: string | null;
  schoolName: string | null;
  events: SchoolEvent[];
  userRole: 'student' | 'teacher';
  onAddEvent: (eventData: Omit<SchoolEvent, 'id' | 'schoolId' | 'authorId' | 'authorName' | 'createdAt'>) => Promise<void>;
};

const eventTypeColors: Record<SchoolEventType, string> = {
  Prüfung: "bg-red-500",
  Hausaufgabe: "bg-blue-500",
  Ferien: "bg-green-500",
  Veranstaltung: "bg-purple-500",
  Sonstiges: "bg-gray-500",
};

export function SchoolCalendarPage({ schoolId, schoolName, events, userRole, onAddEvent }: SchoolCalendarPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddEventOpen, setAddEventOpen] = useState(false);

  const eventDates = useMemo(() => {
    return events.map(event => new Date(event.date));
  }, [events]);

  const selectedDayEvents = useMemo(() => {
    return events
      .filter(event => isSameDay(new Date(event.date), selectedDate))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, selectedDate]);
  
  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
  };
  
  const handleAddEventSubmit = async (values: any) => {
    await onAddEvent({
        ...values,
        date: values.date.toISOString(),
    });
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
            Geteilte Termine für alle Schüler deiner Schule.
            {userRole === 'student' && ' Als Lehrer kannst du hier neue Termine für alle hinzufügen.'}
          </p>
        </div>
        {userRole === 'teacher' && (
            <Button onClick={() => setAddEventOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Neuer Termin
            </Button>
        )}
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
              modifiers={{ events: eventDates }}
              modifiersClassNames={{ events: 'day-with-event' }}
              components={{
                DayContent: (props) => {
                   const dayEvents = events.filter(event => isSameDay(new Date(event.date), props.date));
                   return (
                     <div className="relative h-full w-full flex items-center justify-center">
                       <span>{format(props.date, 'd')}</span>
                       {dayEvents.length > 0 && <div className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />}
                     </div>
                   );
                }
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
                    <li key={event.id} className="p-3 rounded-md bg-muted/50 border-l-4" style={{ borderColor: eventTypeColors[event.type] }}>
                       <p className="font-semibold">{event.title}</p>
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
    <AddSchoolEventDialog 
        isOpen={isAddEventOpen}
        onOpenChange={setAddEventOpen}
        onSubmit={handleAddEventSubmit}
        selectedDate={selectedDate}
    />
    </>
  );
}
