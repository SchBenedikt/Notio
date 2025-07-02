"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from './ui/checkbox';
import type { TimetableEntry, Subject, Homework } from "@/lib/types";
import { Plus, Notebook, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { EditTimetableEntryDialog } from './edit-timetable-entry-dialog';
import { AddHomeworkDialog } from './add-homework-dialog';

type TimetablePageProps = {
  timetable: TimetableEntry[];
  subjects: Subject[];
  homework: Homework[];
  onSaveEntry: (day: number, period: number, values: { subjectId: string; room?: string }, entryId?: string) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onSaveHomework: (values: { task: string; dueDate: Date; subjectId: string }) => Promise<void>;
  onDeleteHomework: (homeworkId: string) => Promise<void>;
  onToggleHomework: (homeworkId: string, isDone: boolean) => Promise<void>;
};

const days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
const periods = Array.from({ length: 10 }, (_, i) => i + 1);

export function TimetablePage({ 
    timetable, 
    subjects, 
    homework,
    onSaveEntry,
    onDeleteEntry,
    onSaveHomework,
    onDeleteHomework,
    onToggleHomework
}: TimetablePageProps) {
  const [dialogState, setDialogState] = useState<{
    type: 'edit-entry' | 'add-homework' | null;
    data: any;
  }>({ type: null, data: {} });
  
  const subjectsMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);
  const timetableMap = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    timetable.forEach(entry => map.set(`${entry.day}-${entry.period}`, entry));
    return map;
  }, [timetable]);

  const homeworkMap = useMemo(() => {
    const map = new Map<string, Homework[]>();
    homework.forEach(hw => {
        if (!map.has(hw.subjectId)) {
            map.set(hw.subjectId, []);
        }
        map.get(hw.subjectId)!.push(hw);
    });
    // Sort homework by due date
    for (const hwList of map.values()) {
        hwList.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    }
    return map;
  }, [homework]);

  const handleOpenEditDialog = (day: number, period: number, entry?: TimetableEntry) => {
    setDialogState({ type: 'edit-entry', data: { day, period, entryToEdit: entry } });
  };
  
  const handleOpenHomeworkDialog = (entry: TimetableEntry) => {
    setDialogState({ type: 'add-homework', data: { entry } });
  }

  return (
    <div className="space-y-6">
       <div className="space-y-1">
          <h1 className="text-3xl font-bold">Stundenplan</h1>
          <p className="text-muted-foreground">
            Verwalte deine Unterrichtsstunden und Hausaufgaben für die Woche.
          </p>
        </div>
      <Card>
        <CardContent className="p-2">
            <div className="grid grid-cols-[auto_repeat(5,1fr)] gap-1">
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
                            const subjectHomework = entry && subject ? (homeworkMap.get(subject.id) || []) : [];

                            return (
                                <div key={`${dayIndex}-${period}`} className="border rounded-md p-2 min-h-[120px] bg-muted/30 flex flex-col">
                                    {entry && subject ? (
                                        <div className="flex-1 flex flex-col">
                                           <div 
                                                className="flex-1 cursor-pointer hover:bg-muted/50 -m-2 p-2 rounded-t-md"
                                                onClick={() => handleOpenEditDialog(dayIndex, period, entry)}
                                            >
                                               <p className="font-bold text-sm">{subject.name}</p>
                                               {entry.room && <p className="text-xs text-muted-foreground">{entry.room}</p>}
                                           </div>
                                            {subjectHomework.length > 0 && (
                                                <div className="mt-2 pt-2 border-t">
                                                    <ul className="space-y-1">
                                                        {subjectHomework.map(hw => (
                                                            <li key={hw.id} className="flex items-start gap-2 text-xs group">
                                                                <Checkbox 
                                                                    id={`hw-${hw.id}`} 
                                                                    checked={hw.isDone}
                                                                    onCheckedChange={(checked) => onToggleHomework(hw.id, !!checked)}
                                                                    className="mt-0.5"
                                                                />
                                                                <div className="flex-1">
                                                                    <label htmlFor={`hw-${hw.id}`} className={cn("flex-1", hw.isDone && "line-through text-muted-foreground")}>{hw.task}</label>
                                                                    <p className="text-muted-foreground">
                                                                        Fällig: {format(new Date(hw.dueDate), "dd.MM.yy")}
                                                                    </p>
                                                                </div>
                                                                 <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => onDeleteHomework(hw.id)}>
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
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
      
      <EditTimetableEntryDialog
        isOpen={dialogState.type === 'edit-entry'}
        onOpenChange={(isOpen) => !isOpen && setDialogState({ type: null, data: {} })}
        onSubmit={(values) => onSaveEntry(dialogState.data.day, dialogState.data.period, values, dialogState.data.entryToEdit?.id)}
        onDelete={() => onDeleteEntry(dialogState.data.entryToEdit.id)}
        entryToEdit={dialogState.data.entryToEdit}
        subjects={subjects}
      />
      
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
