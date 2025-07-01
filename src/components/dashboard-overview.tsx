"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppView, Grade, Subject } from "@/lib/types";
import { ArrowRight, BookCopy, BrainCircuit, Calendar, CheckCircle, Plus, Sparkles, TrendingUp, Palette } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

type DashboardOverviewProps = {
  userName: string | null;
  overallAverage: string;
  mainSubjectsAverage: string;
  minorSubjectsAverage: string;
  totalSubjectsCount: number;
  totalGradesCount: number;
  plannedGrades: Grade[];
  subjects: Subject[];
  onNavigate: (view: AppView) => void;
  onAddSubject: () => void;
  onAddGrade: (subjectId: string) => void;
};

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <div className="flex items-center gap-4 rounded-lg bg-background p-4">
        <div className="p-3 bg-muted rounded-lg">
            <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

export function DashboardOverview({
    userName,
    overallAverage,
    mainSubjectsAverage,
    minorSubjectsAverage,
    totalSubjectsCount,
    totalGradesCount,
    plannedGrades,
    subjects,
    onNavigate,
    onAddSubject,
    onAddGrade
}: DashboardOverviewProps) {
  
  const subjectsMap = new Map(subjects.map(s => [s.id, s.name]));

  return (
    <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold">Hallo, {userName || 'Entdecker'}!</h1>
                <p className="text-muted-foreground">Willkommen zurück in deinem Noten-Cockpit.</p>
            </div>
            <Button variant="outline" onClick={() => onNavigate('settings')}>
                <Palette className="mr-2 h-4 w-4" />
                Anpassen
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Stats Card */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Deine Leistungsübersicht</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-primary/5 rounded-xl flex flex-col justify-center items-center text-center">
                        <p className="text-sm font-medium text-primary">Gesamtschnitt</p>
                        <p className="text-6xl font-extrabold text-primary tracking-tight">{overallAverage}</p>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StatCard title="Hauptfächer" value={mainSubjectsAverage} icon={TrendingUp} />
                        <StatCard title="Nebenfächer" value={minorSubjectsAverage} icon={TrendingUp} />
                        <StatCard title="Fächer" value={totalSubjectsCount} icon={BookCopy} />
                        <StatCard title="Noten" value={totalGradesCount} icon={CheckCircle} />
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button variant="ghost" className="text-muted-foreground" onClick={() => onNavigate('subjects')}>
                        Alle Fächer im Detail ansehen <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>

            {/* Quick Actions Card */}
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Aktionen</CardTitle>
                    <CardDescription>Direkt loslegen.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center space-y-3">
                    <Button onClick={onAddSubject} size="lg" className="w-full justify-start">
                        <Plus className="mr-3" /> Neues Fach anlegen
                    </Button>
                     <Button onClick={() => onNavigate('studysets')} size="lg" variant="secondary" className="w-full justify-start">
                        <BrainCircuit className="mr-3" /> Zu den Lernsets
                    </Button>
                </CardContent>
            </Card>
            
            {/* Upcoming and AI */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Anstehende Termine</CardTitle>
                    <CardDescription>Deine nächsten geplanten Prüfungen und Aufgaben.</CardDescription>
                </CardHeader>
                <CardContent>
                    {plannedGrades.length > 0 ? (
                        <div className="space-y-3">
                            {plannedGrades.slice(0, 4).map(grade => (
                                <div key={grade.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div>
                                        <p className="font-semibold">{grade.name || grade.type}</p>
                                        <p className="text-sm text-muted-foreground">{subjectsMap.get(grade.subjectId) || 'Unbekanntes Fach'}</p>
                                    </div>
                                    <div className="text-right">
                                       <p className="font-semibold">{format(new Date(grade.date), "dd. MMMM", { locale: de })}</p>
                                       <p className="text-sm text-muted-foreground">{format(new Date(grade.date), "eeee", { locale: de })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <Calendar className="h-10 w-10 mx-auto text-muted-foreground" />
                            <p className="mt-4 font-semibold">Keine Termine geplant</p>
                            <p className="text-sm text-muted-foreground">Füge eine Note ohne Wert hinzu, um einen Termin zu planen.</p>
                             {subjects.length > 0 && (
                                <Button variant="secondary" className="mt-4" onClick={() => onAddGrade(subjects[0].id)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Termin planen
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground flex flex-col">
                <CardHeader>
                    <CardTitle>KI-Tutor & Lern-Coach</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Erhalte Lerntipps, stelle Fragen oder übe mit deinen Lernsets.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <Sparkles className="h-20 w-20 text-primary-foreground/30" />
                </CardContent>
                 <CardFooter>
                     <Button variant="ghost" className="w-full bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground" onClick={() => onNavigate('tutor')}>
                        Chat starten <ArrowRight className="ml-2"/>
                    </Button>
                </CardFooter>
            </Card>

        </div>
    </div>
  );
}
