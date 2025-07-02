"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from './ui/checkbox';
import type { TimetableEntry, Subject, Homework, AddSubjectData } from "@/lib/types";
import { Plus, Notebook, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow, isBefore, startOfToday, isSameWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { EditTimetableEntryDialog } from './edit-timetable-entry-dialog';
import { AddHomeworkDialog } from './add-homework-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const subjectColors = [
  { background: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-700/50', text: 'text-red-800 dark:text-red-200' },
  { background: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-700/50', text: 'text-green-800 dark:text-green-200' },
  { background: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-700/50', text: 'text-blue-800 dark:text-blue-200' },
  { background: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-700/50', text: 'text-yellow-800 dark:text-yellow-200' },
  { background: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-700/50', text: 'text-purple-800 dark:text-purple-200' },
  { background: 'bg-pink-50 dark:bg-pink-900/30', border: 'border-pink-200 dark:border-pink-700/50', text: 'text-pink-800 dark:text-pink-200' },
  { background: 'bg-indigo-50 dark:bg-indigo-900/30', border: 'border-indigo-200 dark:border-indigo-700/50', text: 'text-indigo-800 dark:text-indigo-200' },
  { background: 'bg-teal-50 dark:bg-teal-900/30', border: 'border-teal-200 dark:border-teal-700/50', text: 'text-teal-800 dark:text-teal-200' },
  { background: 'bg-orange-50 dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-700/50', text: 'text-orange-800 dark:text-orange-200' },
  { background: 'bg-cyan-50 dark:bg-cyan-900/30', border: 'border-cyan-200 dark:border-cyan-700/50', text: 'text-cyan-800 dark:text-cyan-200' },
];

const getSubjectColor = (subjectId: string) => {
  let hash = 0;
  for (let i = 0; i < subjectId.length; i++) {
    const char = subjectId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash % subjectColors.length);
  return subjectColors[index];
};


type HomeworkListProps = {
    title: string;
    homework: Homework[];
    subjectsMap: Map<string, Subject>;
    onToggle: (id: string, done: boolean) => void;
    onDelete: (id: string) => void;
};

const HomeworkList = ({ title, homework, subjectsMap, onToggle, onDelete }: HomeworkListProps) => {
    if (homework.length === 0) return null;
    return (
        <div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <ul className="space-y-2">
                {homework.map(hw => {
                    const subject = subjectsMap.get(hw.subjectId);
                    return (
                        <li key={hw.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 group">
                            <Checkbox
                                id={`hw-list-${hw.id}`}
                                checked={hw.isDone}
                                onCheckedChange={(checked) => onToggle(hw.id, !!checked)}
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <label htmlFor={`hw-list-${hw.id}`} className={cn("font-medium", hw.isDone && "line-through text-muted-foreground")}>{hw.task}</label>
                                <div className="text-sm text-muted-foreground flex items-center gap-4">
                                    <span>{subject?.name || 'Unbekanntes Fach'}</span>
                                    <span>Fällig: {format(new Date(hw.dueDate), "eeee, dd.MM.", { locale: de })}</span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => onDelete(hw.id)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

const CompletedHomeworkList = ({ homework, subjectsMap, onToggle, onDelete }: {
    homework: Homework[],
    subjectsMap: Map<string, Subject>,
    onToggle: (id: string, done: boolean) => void,
    onDelete: (id: string) => void
}) => {
    const completed = homework.filter(hw => hw.isDone);
    if(completed.length === 0) return null;

     return (
        <div>
            <h3 className="font-semibold text-lg mb-2 mt-6">Erledigte Aufgaben</h3>
            <ul className="space-y-2">
                {completed.map(hw => {
                    const subject = subjectsMap.get(hw.subjectId);
                    return (
                        <li key={hw.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 group opacity-70">
                            <Checkbox
                                id={`hw-list-${hw.id}`}
                                checked={hw.isDone}
                                onCheckedChange={(checked) => onToggle(hw.id, !!checked)}
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <label htmlFor={`hw-list-${hw.id}`} className={cn("font-medium", hw.isDone && "line-through text-muted-foreground")}>{hw.task}</label>
                                <div className="text-sm text-muted-foreground flex items-center gap-4">
                                    <span>{subject?.name || 'Unbekanntes Fach'}</span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => onDelete(hw.id)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}


type TimetablePageProps = {
  timetable: TimetableEntry[];
  subjects: Subject[];
  homework: Homework[];
  maxPeriods: number;
  onSaveEntry: (day: number, period: number, values: { subjectId: string; room?: string }, entryId?: string) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onSaveHomework: (values: { task: string; dueDate: Date; subjectId: string }) => Promise<void>;
  onDeleteHomework: (homeworkId: string) => Promise<void>;
  onToggleHomework: (homeworkId: string, isDone: boolean) => Promise<void>;
  onAddSubject: (values: AddSubjectData) => Promise<string>;
};

const days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

const groupHomework = (homework: Homework[]) => {
    const now = startOfToday();
    const groups: { [key: string]: Homework[] } = {
        overdue: [],
        today: [],
        tomorrow: [],
        thisWeek: [],
        later: [],
    };

    const sortedHomework = [...homework]
      .filter(hw => !hw.isDone)
      .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    for (const hw of sortedHomework) {
        const dueDate = new Date(hw.dueDate);
        if (isBefore(dueDate, now)) {
            groups.overdue.push(hw);
        } else if (isToday(dueDate)) {
            groups.today.push(hw);
        } else if (isTomorrow(dueDate)) {
            groups.tomorrow.push(hw);
        } else if (isSameWeek(dueDate, now, { weekStartsOn: 1 })) {
            groups.thisWeek.push(hw);
        } else {
            groups.later.push(hw);
        }
    }
    return groups;
};

export function TimetablePage({ 
    timetable, 
    subjects, 
    homework,
    maxPeriods,
    onSaveEntry,
    onDeleteEntry,
    onSaveHomework,
    onDeleteHomework,
    onToggleHomework,
    onAddSubject
}: TimetablePageProps) {
  const [dialogState, setDialogState] = useState<{
    type: 'edit-entry' | 'add-homework' | null;
    data: any;
  }>({ type: null, data: {} });
  
  const periods = useMemo(() => Array.from({ length: maxPeriods }, (_, i) => i + 1), [maxPeriods]);
  
  const subjectsMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);
  const timetableMap = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    timetable.forEach(entry => map.set(`${entry.day}-${entry.period}`, entry));
    return map;
  }, [timetable]);

  const homeworkGroups = useMemo(() => groupHomework(homework), [homework]);

  const handleOpenEditDialog = (day: number, period: number, entry?: TimetableEntry) => {
    setDialogState({ type: 'edit-entry', data: { day, period, entryToEdit: entry } });
  };
  
  return (
    <div className="space-y-6">
       <div className="space-y-1">
          <h1 className="text-3xl font-bold">Stundenplan & Hausaufgaben</h1>
          <p className="text-muted-foreground">
            Verwalte deine Unterrichtsstunden und Hausaufgaben für die Woche.
          </p>
        </div>

      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timetable">Stundenplan</TabsTrigger>
            <TabsTrigger value="homework">Hausaufgaben ({homework.filter(h => !h.isDone).length})</TabsTrigger>
        </TabsList>
        <TabsContent value="timetable" className="mt-4">
            <Card>
                <CardContent className="p-2 overflow-x-auto bg-card">
                    <div className="grid grid-cols-[auto_repeat(5,minmax(140px,1fr))] gap-1 min-w-[800px]">
                        <div />
                        {days.map(day => (
                            <div key={day} className="text-center font-semibold p-2 text-sm">{day}</div>
                        ))}
                        
                        {periods.map(period => (
                            <React.Fragment key={period}>
                                <div className="flex items-center justify-center font-semibold p-2 text-sm">{period}.</div>
                                {days.map((_, dayIndex) => {
                                    const entry = timetableMap.get(`${dayIndex}-${period}`);
                                    const subject = entry ? subjectsMap.get(entry.subjectId) : null;
                                    const subjectColor = entry && subject ? getSubjectColor(subject.id) : null;

                                    return (
                                        <div
                                            key={`${dayIndex}-${period}`}
                                            className={cn(
                                            "border rounded-md min-h-[100px] flex flex-col group/cell",
                                            subjectColor
                                                ? `${subjectColor.background} ${subjectColor.border}`
                                                : "bg-muted/20"
                                            )}
                                        >
                                            {entry && subject ? (
                                            <div
                                                className="flex-1 cursor-pointer -m-2 p-2 rounded-md flex flex-col"
                                                onClick={() => handleOpenEditDialog(dayIndex, period, entry)}
                                            >
                                                <p className={cn("font-bold text-sm flex-1", subjectColor?.text)}>{subject.name}</p>
                                                {entry.room && <p className="text-xs text-muted-foreground mt-auto pt-1">{entry.room}</p>}
                                            </div>
                                            ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenEditDialog(dayIndex, period)}
                                                className="opacity-0 group-hover/cell:opacity-100 transition-opacity"
                                                >
                                                <Plus className="h-5 w-5 text-muted-foreground" />
                                                </Button>
                                            </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="homework" className="mt-4">
            <Card>
                 <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Hausaufgabenübersicht</CardTitle>
                            <CardDescription>Alle deine anstehenden und erledigten Aufgaben.</CardDescription>
                        </div>
                        <Button onClick={() => setDialogState({ type: 'add-homework', data: {} })}>
                            <Plus className="mr-2 h-4 w-4" />
                            Neue Hausaufgabe
                        </Button>
                    </div>
                 </CardHeader>
                 <CardContent className="space-y-6">
                    {Object.values(homeworkGroups).every(g => g.length === 0) && homework.filter(h => h.isDone).length === 0 ? (
                        <p className="text-center text-muted-foreground py-10">Keine Hausaufgaben vorhanden.</p>
                    ) : (
                        <>
                            <HomeworkList title="Überfällig" homework={homeworkGroups.overdue} subjectsMap={subjectsMap} onToggle={onToggleHomework} onDelete={onDeleteHomework} />
                            <HomeworkList title="Heute fällig" homework={homeworkGroups.today} subjectsMap={subjectsMap} onToggle={onToggleHomework} onDelete={onDeleteHomework} />
                            <HomeworkList title="Morgen fällig" homework={homeworkGroups.tomorrow} subjectsMap={subjectsMap} onToggle={onToggleHomework} onDelete={onDeleteHomework} />
                            <HomeworkList title="Diese Woche fällig" homework={homeworkGroups.thisWeek} subjectsMap={subjectsMap} onToggle={onToggleHomework} onDelete={onDeleteHomework} />
                            <HomeworkList title="Später fällig" homework={homeworkGroups.later} subjectsMap={subjectsMap} onToggle={onToggleHomework} onDelete={onDeleteHomework} />
                            <CompletedHomeworkList homework={homework} subjectsMap={subjectsMap} onToggle={onToggleHomework} onDelete={onDeleteHomework} />
                        </>
                    )}
                 </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      
      {dialogState.type === 'edit-entry' && (
        <EditTimetableEntryDialog
            isOpen={true}
            onOpenChange={(isOpen) => !isOpen && setDialogState({ type: null, data: {} })}
            onSubmit={(values) => onSaveEntry(dialogState.data.day, dialogState.data.period, values, dialogState.data.entryToEdit?.id)}
            onDelete={() => onDeleteEntry(dialogState.data.entryToEdit.id)}
            onAddSubject={onAddSubject}
            entryToEdit={dialogState.data.entryToEdit}
            subjects={subjects}
        />
      )}
      
      {dialogState.type === 'add-homework' && (
        <AddHomeworkDialog
            isOpen={true}
            onOpenChange={(isOpen) => !isOpen && setDialogState({ type: null, data: {} })}
            onSubmit={onSaveHomework}
            subjects={subjects}
            timetable={timetable}
        />
      )}
    </div>
  );
}
