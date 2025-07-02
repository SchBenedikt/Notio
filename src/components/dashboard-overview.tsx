
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppView, Grade, Subject, Homework, SchoolEvent } from "@/lib/types";
import { ArrowRight, BookCopy, BrainCircuit, Calendar, CheckCircle, Plus, Sparkles, TrendingUp, GripVertical, Notebook, LayoutGrid } from "lucide-react";
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layouts } from 'react-grid-layout';
import { CalendarWidget } from "./calendar-widget";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const ResponsiveGridLayout = WidthProvider(Responsive);

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <div className="flex items-center gap-3 rounded-lg bg-background p-3">
        <div className="p-2 bg-muted rounded-lg">
            <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
);

export const defaultLayouts: Layouts = {
    lg: [
        { i: 'performance', x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
        { i: 'actions',     x: 2, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'upcoming',    x: 0, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'homework',    x: 1, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'calendar',    x: 2, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'tutor',       x: 0, y: 4, w: 1, h: 2, minW: 1, minH: 2 },
    ],
    md: [
        { i: 'performance', x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
        { i: 'actions',     x: 0, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'upcoming',    x: 1, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'homework',    x: 0, y: 4, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'calendar',    x: 1, y: 4, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'tutor',       x: 0, y: 6, w: 1, h: 2, minW: 1, minH: 2 },
    ],
    sm: [
        { i: 'performance', x: 0, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'actions',     x: 0, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'upcoming',    x: 0, y: 4, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'homework',    x: 0, y: 6, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'calendar',    x: 0, y: 8, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'tutor',       x: 0, y: 10, w: 1, h: 2, minW: 1, minH: 2 },
    ],
    xs: [
        { i: 'performance', x: 0, y: 0, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'actions',     x: 0, y: 2, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'upcoming',    x: 0, y: 4, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'homework',    x: 0, y: 6, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'calendar',    x: 0, y: 8, w: 1, h: 2, minW: 1, minH: 2 },
        { i: 'tutor',       x: 0, y: 10, w: 1, h: 2, minW: 1, minH: 2 },
    ],
};

type DashboardOverviewProps = {
  userName: string | null;
  overallAverage: string;
  mainSubjectsAverage: string;
  minorSubjectsAverage: string;
  totalSubjectsCount: number;
  totalGradesCount: number;
  plannedGrades: Grade[];
  homework: Homework[];
  schoolEvents: SchoolEvent[];
  subjects: Subject[];
  onNavigate: (view: AppView) => void;
  onAddSubject: () => void;
  onAddGrade: (subjectId: string) => void;
  onAddHomework: () => void;
  layouts: Layouts;
  onLayoutChange: (currentLayout: ReactGridLayout.Layout[], allLayouts: Layouts) => void;
  visibleWidgets: Record<string, boolean>;
  onOpenSettings: () => void;
};

export function DashboardOverview({
    userName,
    overallAverage,
    mainSubjectsAverage,
    minorSubjectsAverage,
    totalSubjectsCount,
    totalGradesCount,
    plannedGrades,
    homework,
    schoolEvents,
    subjects,
    onNavigate,
    onAddSubject,
    onAddGrade,
    onAddHomework,
    layouts,
    onLayoutChange,
    visibleWidgets,
    onOpenSettings,
}: DashboardOverviewProps) {
  
  const subjectsMap = new Map(subjects.map(s => [s.id, s.name]));
  const upcomingHomework = homework
    .filter(hw => !hw.isDone)
    .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const widgetComponents: Record<string, React.ReactNode> = {
    performance: (
      <Card className="h-full w-full flex flex-col">
        <CardHeader className="drag-handle flex flex-row items-start justify-between">
          <div><CardTitle>Deine Leistungsübersicht</CardTitle></div>
          <GripVertical className="text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="p-4 sm:p-6 bg-primary/5 rounded-xl flex flex-col justify-center items-center text-center">
            <p className="text-sm font-medium text-primary">Gesamtschnitt</p>
            <p className="text-5xl sm:text-6xl font-extrabold text-primary tracking-tight">{overallAverage}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <StatCard title="Hauptfächer" value={mainSubjectsAverage} icon={TrendingUp} />
            <StatCard title="Nebenfächer" value={minorSubjectsAverage} icon={TrendingUp} />
            <StatCard title="Fächer" value={totalSubjectsCount} icon={BookCopy} />
            <StatCard title="Noten" value={totalGradesCount} icon={CheckCircle} />
          </div>
        </CardContent>
      </Card>
    ),
    actions: (
      <Card className="h-full w-full flex flex-col">
        <CardHeader className="drag-handle flex flex-row items-start justify-between">
          <div>
            <CardTitle>Bereit loszulegen?</CardTitle>
            <CardDescription>Füge Fächer hinzu, um deine Noten zu verfolgen, oder erstelle Lernsets zum Üben.</CardDescription>
          </div>
          <GripVertical className="text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-1 grid gap-2 content-center">
          <Button onClick={onAddSubject} size="default">
            <Plus className="mr-3" /> Neues Fach anlegen
          </Button>
          <Button onClick={() => onNavigate('studysets')} variant="secondary" size="default">
            <BrainCircuit className="mr-3" /> Zu den Lernsets
          </Button>
        </CardContent>
      </Card>
    ),
    upcoming: (
      <Card className="h-full w-full flex flex-col">
        <CardHeader className="drag-handle flex flex-row items-start justify-between">
          <div>
            <CardTitle>Anstehende Prüfungen</CardTitle>
            <CardDescription>Deine nächsten geplanten Klausuren und Tests.</CardDescription>
          </div>
          <GripVertical className="text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-1">
          {plannedGrades.length > 0 ? (
            <div className="space-y-3">
              {plannedGrades.slice(0, 4).map(grade => (
                <div key={grade.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50">
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
            <div className="text-center py-10 h-full flex flex-col items-center justify-center">
              <Calendar className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="mt-4 font-semibold">Keine Prüfungen geplant</p>
              <p className="text-sm text-muted-foreground">Füge eine Note ohne Wert hinzu, um eine Prüfung zu planen.</p>
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
    ),
    homework: (
      <Card className="h-full w-full flex flex-col">
        <CardHeader className="drag-handle flex flex-row items-start justify-between">
          <div>
            <CardTitle>Nächste Hausaufgaben</CardTitle>
            <CardDescription>Deine dringendsten Aufgaben.</CardDescription>
          </div>
          <GripVertical className="text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-1">
          {upcomingHomework.length > 0 ? (
            <div className="space-y-3">
              {upcomingHomework.slice(0, 4).map(hw => (
                <div key={hw.id} className="flex items-start justify-between p-2 sm:p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{hw.task}</p>
                    <p className="text-sm text-muted-foreground">{subjectsMap.get(hw.subjectId) || 'Unbekanntes Fach'}</p>
                  </div>
                  <div className="text-right pl-2">
                    <p className="font-semibold">{format(new Date(hw.dueDate), "dd. MMM", { locale: de })}</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(hw.dueDate), "eeee", { locale: de })}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 h-full flex flex-col items-center justify-center">
              <Notebook className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="mt-4 font-semibold">Keine Hausaufgaben</p>
              <p className="text-sm text-muted-foreground">Du hast alle Aufgaben erledigt. Super!</p>
            </div>
          )}
        </CardContent>
      </Card>
    ),
    calendar: (
        <CalendarWidget events={schoolEvents} onNavigate={onNavigate} />
    ),
    tutor: (
      <Card className="h-full w-full bg-gradient-to-br from-primary/90 to-primary text-primary-foreground flex flex-col">
        <CardHeader className="drag-handle flex flex-row items-start justify-between">
          <div>
            <CardTitle>KI-Tutor &amp; Lern-Coach</CardTitle>
            <CardDescription className="text-primary-foreground/80">Erhalte Lerntipps, stelle Fragen oder übe mit deinen Lernsets.</CardDescription>
          </div>
          <GripVertical className="text-primary-foreground/80" />
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
    ),
  };
  
  const activeWidgets = Object.keys(widgetComponents).filter(key => visibleWidgets[key]);

  return (
    <div className="container mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold">Hallo, {userName || 'Entdecker'}!</h1>
                <p className="text-muted-foreground">Willkommen zurück in deinem Noten-Cockpit.</p>
            </div>
            <Button variant="outline" onClick={onOpenSettings}>
                <LayoutGrid className="mr-2 h-4 w-4" />
                Dashboard personalisieren
            </Button>
        </div>

        <ResponsiveGridLayout
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
            cols={{ lg: 3, md: 2, sm: 1, xs: 1 }}
            rowHeight={150}
            draggableHandle=".drag-handle"
            onLayoutChange={onLayoutChange}
            resizeHandles={['se']}
        >
            {activeWidgets.map(key => (
              <div key={key}>{widgetComponents[key]}</div>
            ))}
        </ResponsiveGridLayout>
    </div>
  );
}

    