"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SchoolEvent } from "@/lib/types";
import { AppView } from "@/lib/types";
import { ArrowRight, BookCopy, BrainCircuit, Calendar, CheckCircle, Plus, Sparkles, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CardFooter } from "./ui/card";

type DashboardOverviewProps = {
  userName: string | null;
  overallAverage: string;
  mainSubjectsAverage: string;
  minorSubjectsAverage: string;
  totalSubjectsCount: number;
  totalGradesCount: number;
  upcomingEvents: SchoolEvent[];
  onNavigate: (view: AppView) => void;
  onAddSubject: () => void;
};

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <div className="flex items-center gap-4">
        <div className="p-3 bg-muted rounded-lg">
            <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
)

export function DashboardOverview({
    userName,
    overallAverage,
    mainSubjectsAverage,
    minorSubjectsAverage,
    totalSubjectsCount,
    totalGradesCount,
    upcomingEvents,
    onNavigate,
    onAddSubject
}: DashboardOverviewProps) {
  
  const nextThreeEvents = upcomingEvents.filter(e => new Date(e.date) >= new Date()).slice(0, 3);

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold">Hallo, {userName || 'Entdecker'}!</h1>
            <p className="text-muted-foreground">Willkommen zurück. Hier ist deine Übersicht.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Main Stats Card */}
            <Card className="xl:col-span-2">
                <CardHeader>
                    <CardTitle>Dein Noten-Cockpit</CardTitle>
                    <CardDescription>Deine wichtigsten Kennzahlen auf einen Blick.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-6 bg-primary/5 rounded-lg text-center flex flex-col justify-center">
                        <p className="text-sm font-medium text-primary">Gesamtschnitt</p>
                        <p className="text-6xl font-extrabold text-primary">{overallAverage}</p>
                    </div>
                     <div className="space-y-4">
                        <StatCard title="Hauptfächer" value={mainSubjectsAverage} icon={TrendingUp} />
                        <StatCard title="Nebenfächer" value={minorSubjectsAverage} icon={TrendingUp} />
                        <StatCard title="Fächer" value={totalSubjectsCount} icon={BookCopy} />
                        <StatCard title="Noten" value={totalGradesCount} icon={CheckCircle} />
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Schnellstart</CardTitle>
                    <CardDescription>Häufige Aktionen direkt ausführen.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center space-y-3">
                    <Button onClick={() => onNavigate('subjects')} size="lg" className="w-full justify-start">
                        <BookCopy className="mr-3" /> Fächerübersicht
                    </Button>
                    <Button onClick={onAddSubject} size="lg" variant="secondary" className="w-full justify-start">
                        <Plus className="mr-3" /> Neues Fach anlegen
                    </Button>
                     <Button onClick={() => onNavigate('studysets')} size="lg" variant="secondary" className="w-full justify-start">
                        <BrainCircuit className="mr-3" /> Zu den Lernsets
                    </Button>
                </CardContent>
            </Card>

            {/* Upcoming Events Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Anstehende Termine</CardTitle>
                    <CardDescription>Das steht als Nächstes an.</CardDescription>
                </CardHeader>
                <CardContent>
                    {nextThreeEvents.length > 0 ? (
                        <div className="space-y-3">
                            {nextThreeEvents.map(event => (
                                <div key={event.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                                    <div className="flex flex-col items-center justify-center p-2 bg-background rounded-md">
                                        <span className="text-xs font-bold text-primary uppercase">{format(new Date(event.date), 'MMM', { locale: de })}</span>
                                        <span className="text-lg font-bold">{format(new Date(event.date), 'dd')}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">{event.title}</p>
                                        <p className="text-xs text-muted-foreground">{event.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">Keine anstehenden Termine im Kalender.</p>
                    )}
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => onNavigate('calendar')}>
                        <Calendar className="mr-2"/> Zum Kalender
                    </Button>
                </CardFooter>
            </Card>

             {/* AI/Community Cards */}
            <Card>
                <CardHeader>
                    <CardTitle>KI-Tutor</CardTitle>
                    <CardDescription>Stelle Fragen, erhalte Lerntipps.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-10">
                    <Sparkles className="h-16 w-16 text-primary/30" />
                </CardContent>
                <CardFooter>
                     <Button className="w-full" onClick={() => onNavigate('tutor')}>
                        Tutor starten <ArrowRight className="ml-2"/>
                    </Button>
                </CardFooter>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Community</CardTitle>
                    <CardDescription>Tausche dich mit anderen aus.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-10">
                     <Users className="h-16 w-16 text-primary/30" />
                </CardContent>
                <CardFooter>
                     <Button className="w-full" onClick={() => onNavigate('community')}>
                        Zum Feed <ArrowRight className="ml-2"/>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
