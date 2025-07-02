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
  
  const handleOpenHomeworkDialog = (entry: TimetableEntry) => {
    setDialogState({ type: 'add-homework', data: { entry } });
  }

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
                <CardContent className="p-2 overflow-x-auto">
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

                                    return (
                                        <div key={`${dayIndex}-${period}`} className="border rounded-md p-2 min-h-[100px] bg-muted/30 flex flex-col">
                                            {entry && subject ? (
                                                <div className="flex-1 flex flex-col">
                                                <div 
                                                        className="flex-1 cursor-pointer hover:bg-muted/50 -m-2 p-2 rounded-md"
                                                        onClick={() => handleOpenEditDialog(dayIndex, period, entry)}
                                                    >
                                                    <p className="font-bold text-sm">{subject.name}</p>
                                                    {entry.room && <p className="text-xs text-muted-foreground">{entry.room}</p>}
                                                </div>
                                                <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="w-full mt-auto"
                                                        onClick={() => handleOpenHomeworkDialog(entry)}
                                                    >
                                                        <Notebook className="mr-2 h-4 w-4"/> Hausaufgabe
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(dayIndex, period)}>
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
                 <CardHeader><CardTitle>Hausaufgabenübersicht</CardTitle><CardDescription>Alle deine anstehenden und erledigten Aufgaben.</CardDescription></CardHeader>
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
            entry={dialogState.data.entry}
        />
      )}
    </div>
  );
}
