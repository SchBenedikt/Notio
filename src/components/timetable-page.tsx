
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from './ui/checkbox';
import type { TimetableEntry, Subject, Task, AddSubjectData, TaskType, Lernzettel } from "@/lib/types";
import { Plus, X, CalendarClock, ListChecks, BookOpen, NotebookText, Share2, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isBefore, startOfToday } from 'date-fns';
import { de } from 'date-fns/locale';
import { EditTimetableEntryDialog } from './edit-timetable-entry-dialog';
import { AddTaskDialog } from './add-homework-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from './ui/alert-dialog';
import { Input } from './ui/input';

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

type PlannerItem = (Task & {itemType: 'task'}) | (Lernzettel & {itemType: 'lernzettel'})

const ItemIcon = ({ item }: { item: PlannerItem }) => {
    switch(item.itemType) {
        case 'lernzettel': return <NotebookText className="h-5 w-5 text-green-500" />;
        case 'task':
            switch(item.type) {
                case 'homework': return <ListChecks className="h-5 w-5 text-blue-500" />;
                case 'todo': return <ListChecks className="h-5 w-5 text-purple-500" />;
                default: return null;
            }
        default: return null;
    }
}

type PlannerPageProps = {
  timetable: TimetableEntry[];
  subjects: Subject[];
  tasks: Task[];
  lernzettel: Lernzettel[];
  maxPeriods: number;
  onSaveEntry: (day: number, period: number, values: { subjectId: string; room?: string }, entryId?: string) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onSaveTask: (values: { content: string; dueDate?: Date; subjectId: string, type: TaskType }) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onToggleTask: (taskId: string, isDone: boolean) => Promise<void>;
  onAddSubject: (values: AddSubjectData) => Promise<string>;
  onToggleLernzettelDone: (lernzettelId: string, isDone: boolean) => Promise<void>;
  onDeleteLernzettelDueDate: (lernzettelId: string) => Promise<void>;
  onViewLernzettel: (id: string) => void;
  onShareTimetable: () => Promise<string>;
  onImportTimetable: (code: string) => Promise<void>;
};

const days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];

export function PlannerPage({ 
    timetable, 
    subjects, 
    tasks,
    lernzettel,
    maxPeriods,
    onSaveEntry,
    onDeleteEntry,
    onSaveTask,
    onDeleteTask,
    onToggleTask,
    onAddSubject,
    onToggleLernzettelDone,
    onDeleteLernzettelDueDate,
    onViewLernzettel,
    onShareTimetable,
    onImportTimetable
}: PlannerPageProps) {
  const [dialogState, setDialogState] = useState<{
    type: 'edit-entry' | 'add-task' | null;
    data: any;
  }>({ type: null, data: {} });
  
  const [isShareDialogOpen, setShareDialogOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [importCode, setImportCode] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const periods = useMemo(() => Array.from({ length: maxPeriods }, (_, i) => i + 1), [maxPeriods]);
  
  const subjectsMap = useMemo(() => new Map(subjects.map(s => [s.id, s])), [subjects]);
  const timetableMap = useMemo(() => {
    const map = new Map<string, TimetableEntry>();
    timetable.forEach(entry => map.set(`${entry.day}-${entry.period}`, entry));
    return map;
  }, [timetable]);
  
  const plannerItemsBySubject = useMemo(() => {
    const plannerItems: PlannerItem[] = [
        ...tasks.map(t => ({...t, itemType: 'task' as const})),
        ...lernzettel.filter(l => l.dueDate).map(l => ({...l, itemType: 'lernzettel' as const}))
    ];

    const grouped: { [subjectId: string]: PlannerItem[] } = {};
    subjects.forEach(s => grouped[s.id] = []);

    plannerItems.forEach(item => {
        if(item.subjectId && grouped[item.subjectId]) {
            grouped[item.subjectId].push(item);
        } else if (item.subjectId === undefined || item.subjectId === null) {
             if (!grouped['unassigned']) grouped['unassigned'] = [];
             grouped['unassigned'].push(item);
        }
    });

    return Object.entries(grouped)
        .filter(([, subjectItems]) => subjectItems.length > 0)
        .sort(([idA], [idB]) => {
            if (idA === 'unassigned') return 1;
            if (idB === 'unassigned') return -1;
            return subjectsMap.get(idA)!.name.localeCompare(subjectsMap.get(idB)!.name)
        });
  }, [tasks, lernzettel, subjects, subjectsMap]);

  const handleOpenEditDialog = (day: number, period: number, entry?: TimetableEntry) => {
    setDialogState({ type: 'edit-entry', data: { day, period, entryToEdit: entry } });
  };

  const handleShareClick = async () => {
    setIsSharing(true);
    try {
        const code = await onShareTimetable();
        setShareCode(code);
        setShareDialogOpen(true);
    } catch (error) {
        // Error toast is handled in dashboard.tsx
    } finally {
        setIsSharing(false);
    }
  };

  const handleImportConfirm = async () => {
    setIsImporting(true);
    try {
        await onImportTimetable(importCode);
        setImportDialogOpen(false);
        setImportCode("");
    } catch (error) {
        // Error toast handled in dashboard.tsx
    } finally {
        setIsImporting(false);
    }
  };

  const copyShareCode = () => {
    if (shareCode) {
        navigator.clipboard.writeText(shareCode);
        toast({ title: "Code kopiert!", description: "Der Code wurde in deine Zwischenablage kopiert." });
    }
  }
  
  return (
    <>
    <div className="space-y-6">
       <div className="space-y-1">
          <h1 className="text-3xl font-bold">Planer</h1>
          <p className="text-muted-foreground">
            Verwalte deine Unterrichtsstunden, Hausaufgaben und Lernziele.
          </p>
        </div>

      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timetable"><CalendarClock className="mr-2 h-4 w-4" />Stundenplan</TabsTrigger>
            <TabsTrigger value="tasks"><ListChecks className="mr-2 h-4 w-4" />Aufgaben</TabsTrigger>
        </TabsList>
        <TabsContent value="timetable" className="mt-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Stundenplan</CardTitle>
                            <CardDescription>Verwalte deine Unterrichtsstunden.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
                                <Download className="mr-2 h-4 w-4" /> Importieren
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleShareClick} disabled={isSharing}>
                                {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                                Teilen
                            </Button>
                        </div>
                    </div>
                 </CardHeader>
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
                                                className="flex-1 cursor-pointer p-2 rounded-md flex flex-col"
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
        <TabsContent value="tasks" className="mt-4">
            <Card>
                 <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Aufgabenübersicht</CardTitle>
                            <CardDescription>Deine Hausaufgaben, To-dos und Lernziele nach Fächern sortiert.</CardDescription>
                        </div>
                        <Button onClick={() => setDialogState({ type: 'add-task', data: {} })}>
                            <Plus className="mr-2 h-4 w-4" />
                            Neue Aufgabe
                        </Button>
                    </div>
                 </CardHeader>
                 <CardContent className="space-y-6">
                     {plannerItemsBySubject.length === 0 ? (
                        <p className="text-center text-muted-foreground py-10">Keine Aufgaben vorhanden.</p>
                     ) : (
                        <Accordion type="multiple" className="w-full space-y-2">
                            {plannerItemsBySubject.map(([subjectId, subjectItems]) => {
                                const subject = subjectId === 'unassigned' ? { name: 'Ohne Fach' } : subjectsMap.get(subjectId);
                                if (!subject) return null;

                                const openItems = subjectItems.filter(t => !t.isDone);
                                const doneItems = subjectItems.filter(t => t.isDone);
                                
                                return (
                                    <AccordionItem key={subjectId} value={subjectId} className="border bg-card rounded-lg shadow-sm">
                                        <AccordionTrigger className="px-4 py-3 text-lg font-medium hover:no-underline">
                                            <span>{subject.name}</span>
                                            <span className="text-sm text-muted-foreground font-normal ml-auto mr-2">Offen: {openItems.length}</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 pb-4">
                                            {openItems.length > 0 && (
                                                <ul className="space-y-2">
                                                    {openItems.sort((a,b) => (a.dueDate && b.dueDate) ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() : 0).map(item => (
                                                        <li key={item.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50 group">
                                                            <Checkbox 
                                                                id={`item-${item.id}`} 
                                                                checked={item.isDone} 
                                                                onCheckedChange={(checked) => item.itemType === 'task' ? onToggleTask(item.id, !!checked) : onToggleLernzettelDone(item.id, !!checked)} 
                                                                className="mt-1" 
                                                            />
                                                            <div className="flex-1">
                                                                <label htmlFor={`item-${item.id}`} className={cn("font-medium", item.isDone && "line-through text-muted-foreground")}>
                                                                    {item.itemType === 'task' ? item.content : item.title}
                                                                </label>
                                                                <div className="text-sm text-muted-foreground flex items-center gap-4">
                                                                    <div className="flex items-center gap-1.5"><ItemIcon item={item} /><span>{item.itemType === 'task' ? (item.type === 'homework' ? 'Hausaufgabe' : 'To-Do') : 'Lernzettel'}</span></div>
                                                                    {item.dueDate && <span className={cn(isBefore(new Date(item.dueDate), startOfToday()) && 'text-red-500')}>Fällig: {format(new Date(item.dueDate), "dd.MM.yyyy", { locale: de })}</span>}
                                                                </div>
                                                            </div>
                                                            {item.itemType === 'lernzettel' && <Button variant="ghost" size="sm" onClick={() => onViewLernzettel(item.id)}>Ansehen</Button>}
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100" 
                                                                onClick={() => item.itemType === 'task' ? onDeleteTask(item.id) : onDeleteLernzettelDueDate(item.id)}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                             {doneItems.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-semibold text-muted-foreground my-2">{openItems.length > 0 && 'Erledigt'}</h4>
                                                    <ul className="space-y-2 opacity-60">
                                                        {doneItems.map(item => (
                                                            <li key={item.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50 group">
                                                                <Checkbox id={`item-${item.id}`} checked={item.isDone} onCheckedChange={(checked) => item.itemType === 'task' ? onToggleTask(item.id, !!checked) : onToggleLernzettelDone(item.id, !!checked)} className="mt-1" />
                                                                <div className="flex-1">
                                                                    <label htmlFor={`item-${item.id}`} className="font-medium line-through text-muted-foreground">
                                                                        {item.itemType === 'task' ? item.content : item.title}
                                                                    </label>
                                                                </div>
                                                                 <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => item.itemType === 'task' ? onDeleteTask(item.id) : onDeleteLernzettelDueDate(item.id)}><X className="h-4 w-4" /></Button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                             )}
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
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
      
      {dialogState.type === 'add-task' && (
        <AddTaskDialog
            isOpen={true}
            onOpenChange={(isOpen) => !isOpen && setDialogState({ type: null, data: {} })}
            onSubmit={onSaveTask}
            subjects={subjects}
            timetable={timetable}
        />
      )}
    </div>

    <Dialog open={isShareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Stundenplan teilen</DialogTitle>
                <DialogDescription>
                    Teile diesen Code mit anderen, damit sie deinen Stundenplan importieren können. Der Code ist 24 Stunden gültig.
                </DialogDescription>
            </DialogHeader>
            <div className="bg-muted rounded-md p-4 flex items-center justify-center">
                <p className="text-2xl font-bold tracking-widest font-mono">{shareCode}</p>
            </div>
            <DialogFooter>
                <Button variant="secondary" onClick={copyShareCode}>Code kopieren</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <AlertDialog open={isImportDialogOpen} onOpenChange={setImportDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Stundenplan importieren</AlertDialogTitle>
                <AlertDialogDescription>
                    Gib den Teilen-Code ein, um einen Stundenplan zu importieren. Achtung: Dein aktueller Stundenplan wird dadurch überschrieben.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
                placeholder="ABC123"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value.toUpperCase())}
                className="font-mono"
                maxLength={6}
            />
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isImporting}>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleImportConfirm} disabled={!importCode.trim() || isImporting}>
                    {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Importieren & Überschreiben
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
