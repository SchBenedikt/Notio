"use client";

import { useState } from "react";
import { PenLine, MessageSquareText, Plus, ChevronDown, Settings, Pencil, Crosshair, Paperclip, Trash2, CalendarDays, BrainCircuit, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Grade, Subject, StudySet } from "@/lib/types";
import { calculateFinalGrade } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { GradeDistributionChart } from "./grade-distribution-chart";
import { GradeTrendChart } from "./grade-trend-chart";
import { Progress } from "./ui/progress";

const GoalProgress = ({ finalGrade, targetGrade }: { finalGrade: string; targetGrade: number }) => {
    if (finalGrade === "-") return null;

    const currentGradeVal = parseFloat(finalGrade);
    const progress = Math.max(0, Math.min(100, ((6 - currentGradeVal) / (6 - targetGrade)) * 100));

    return (
        <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2 text-muted-foreground">
                <Crosshair className="h-4 w-4" />
                Fortschritt zum Ziel
            </h4>
            <div className="flex justify-between items-baseline text-sm mb-1">
                <span className="text-muted-foreground">Ziel: <span className="font-bold text-primary">{targetGrade.toFixed(1)}</span></span>
                <span className="text-muted-foreground">Aktuell: <span className="font-bold text-foreground">{finalGrade}</span></span>
            </div>
            <Progress value={progress} className="h-2" />
        </div>
    );
};

type SubjectCardProps = {
  subject: Subject;
  grades: Grade[];
  studySets: StudySet[];
  onDeleteSubject: (subjectId: string) => void;
  onUpdateSubject: (subjectId: string, values: Partial<Subject>) => void;
  onAddGradeToSubject: (subjectId: string) => void;
  onEditSubject: (subject: Subject) => void;
  onShowGradeInfo: (grade: Grade) => void;
  onEditGrade: (grade: Grade) => void;
  onViewStudySet: (id: string) => void;
  onEditStudySet: (set: StudySet) => void;
  onDeleteStudySet: (id: string) => void;
  animationIndex: number;
};

export function SubjectCard({ subject, grades, studySets, onDeleteSubject, onUpdateSubject, onAddGradeToSubject, onEditSubject, onShowGradeInfo, onEditGrade, onViewStudySet, onEditStudySet, onDeleteStudySet, animationIndex }: SubjectCardProps) {
  const [isWeightPopoverOpen, setIsWeightPopoverOpen] = useState(false);
  const [studySetSearch, setStudySetSearch] = useState("");
  
  const [writtenWeight, setWrittenWeight] = useState(subject.writtenWeight ?? 2);
  const [oralWeight, setOralWeight] = useState(subject.oralWeight ?? 1);
  
  const finalGrade = calculateFinalGrade(grades, subject);
  
  const completedGrades = grades.filter(g => g.value != null);
  const plannedGrades = grades.filter(g => g.value == null);

  const writtenGrades = completedGrades.filter((g) => g.type === "Schulaufgabe");
  const oralGrades = completedGrades.filter((g) => g.type === "mündliche Note");

  const relatedStudySets = studySets.filter(set => set.subjectId === subject.id);
  const filteredStudySets = relatedStudySets.filter(set => 
    set.title.toLowerCase().includes(studySetSearch.toLowerCase())
  );

  const handleWeightSave = () => {
    onUpdateSubject(subject.id, { writtenWeight, oralWeight });
    setIsWeightPopoverOpen(false);
  };

  const getGradeColor = (grade: number) => {
    if (grade <= 2) return "bg-green-500/10 text-green-700 border-green-500/20";
    if (grade <= 4) return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
    return "bg-red-500/10 text-red-700 border-red-500/20";
  };
  
  const getAverageColor = (average: string) => {
    const grade = parseFloat(average);
    if (isNaN(grade)) return "bg-muted text-muted-foreground";
    if (grade <= 2.5) return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
    if (grade <= 4.5) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
  }

  const renderGradeItem = (grade: Grade) => (
     <li key={grade.id}>
      <button
        onClick={() => onShowGradeInfo(grade)}
        className="w-full flex items-start justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
                {grade.type === "Schulaufgabe" ? <PenLine className="h-5 w-5 text-muted-foreground" /> : <MessageSquareText className="h-5 w-5 text-muted-foreground" />}
                <div className="flex-1">
                <p className="font-medium text-sm">
                    {grade.name || grade.type} <span className="text-xs text-muted-foreground">(x{grade.weight})</span>
                </p>
                <p className="text-xs text-muted-foreground">{new Date(grade.date).toLocaleDateString('de-DE')}</p>
                </div>
            </div>
            {grade.notes && <p className="text-xs text-muted-foreground pt-1 italic pl-8">"{grade.notes}"</p>}
            {grade.attachments && grade.attachments.length > 0 && (
            <div className="mt-2 pl-8 space-y-1">
                {grade.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-primary">
                        <Paperclip className="h-3 w-3" />
                        <span className="truncate">{attachment.name}</span>
                    </div>
                ))}
            </div>
            )}
        </div>
        <div className="flex items-center gap-1">
            <div className={`flex items-center justify-center h-8 w-8 rounded-md font-bold text-sm border ${getGradeColor(grade.value!)}`}>
            {grade.value!.toFixed(0)}
            </div>
        </div>
      </button>
    </li>
  );

  return (
    <>
      <AccordionItem 
        value={subject.id} 
        className="border bg-card rounded-lg shadow-sm animate-fade-in-down transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        style={{ animationDelay: `${animationIndex * 75}ms`, opacity: 0 }}
      >
        <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline">
          <div className="flex items-center gap-3">
            <span className="truncate">{subject.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={`text-base font-bold px-3 py-1 rounded-md ${getAverageColor(finalGrade)}`}>
              {finalGrade}
            </Badge>
            <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-4">
          <Separator className="mb-4" />
          {completedGrades.length > 0 ? (
             <div className="grid md:grid-cols-2 md:gap-x-8 items-start">
                <div className="space-y-4">
                  {writtenGrades.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Schulaufgaben</h4>
                      <ul className="space-y-2">{writtenGrades.map(renderGradeItem)}</ul>
                    </div>
                  )}
                  {oralGrades.length > 0 && (
                     <div className={writtenGrades.length > 0 ? 'mt-4' : ''}>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Mündliche & sonstige Noten</h4>
                      <ul className="space-y-2">{oralGrades.map(renderGradeItem)}</ul>
                    </div>
                  )}
                </div>
                <div className="mt-6 md:mt-0 space-y-4">
                    {subject.targetGrade && finalGrade !== '-' && (
                      <GoalProgress finalGrade={finalGrade} targetGrade={subject.targetGrade} />
                    )}
                    <GradeDistributionChart grades={completedGrades} />
                    <GradeTrendChart grades={completedGrades} />
                </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8 flex flex-col items-center gap-4">
                <p className="font-medium">Keine Noten für dieses Fach erfasst.</p>
                <Button onClick={() => onAddGradeToSubject(subject.id)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Erste Note hinzufügen
                </Button>
            </div>
          )}
          {plannedGrades.length > 0 && (
            <div>
                <Separator className="my-4" />
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">Geplante Termine</h4>
                <ul className="space-y-2">
                    {plannedGrades.map(grade => (
                        <li key={grade.id}>
                            <button onClick={() => onEditGrade(grade)} className="w-full flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors text-left">
                                <div className="flex items-center gap-3">
                                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-sm">{grade.name || grade.type}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(grade.date).toLocaleDateString('de-DE')}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-primary">Note eintragen</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
           )}
           {relatedStudySets.length > 0 && (
            <div className="pt-4">
              <Separator className="mb-4" />
              <Collapsible>
                <CollapsibleTrigger className="w-full flex justify-between items-center text-sm font-semibold text-muted-foreground hover:bg-muted/50 p-2 rounded-md transition-colors">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4" />
                    <span>Zugehörige Lernsets ({relatedStudySets.length})</span>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input 
                            type="text"
                            placeholder="Lernset in diesem Fach suchen..."
                            value={studySetSearch}
                            onChange={(e) => setStudySetSearch(e.target.value)}
                            className="pl-8 h-8 text-xs"
                        />
                    </div>
                    <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                        {filteredStudySets.map(set => (
                            <li key={set.id} className="flex items-center justify-between p-1 rounded-md bg-muted/50 hover:bg-muted group">
                                <button onClick={() => onViewStudySet(set.id)} className="flex-1 flex items-center gap-3 p-1 text-left">
                                    <BrainCircuit className="h-5 w-5 text-muted-foreground" />
                                    <p className="font-medium text-sm truncate">{set.title}</p>
                                </button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEditStudySet(set)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Bearbeiten
                                        </DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Löschen
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Lernset löschen?</AlertDialogTitle>
                                                    <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onDeleteStudySet(set.id)} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </li>
                        ))}
                        {filteredStudySets.length === 0 && (
                            <p className="text-xs text-center text-muted-foreground py-2">Kein Lernset gefunden.</p>
                        )}
                    </ul>
                </CollapsibleContent>
              </Collapsible>
            </div>
           )}
          <Separator className="my-4" />
          <div className="flex justify-between items-center gap-2 flex-wrap">
             <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" onClick={() => onAddGradeToSubject(subject.id)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Note hinzufügen
                </Button>
                {subject.category === 'Hauptfach' && (
                    <Popover open={isWeightPopoverOpen} onOpenChange={setIsWeightPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Settings className="mr-2 h-4 w-4" />
                                Gewichtung
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Notengewichtung</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Passe die Gewichtung von schriftlichen zu mündlichen Noten für dieses Fach an.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor="written-weight">Schriftlich</Label>
                                        <Input
                                            id="written-weight"
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={writtenWeight}
                                            onChange={(e) => setWrittenWeight(Number(e.target.value))}
                                            className="col-span-2 h-8"
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <Label htmlFor="oral-weight">Mündlich</Label>
                                        <Input
                                            id="oral-weight"
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={oralWeight}
                                            onChange={(e) => setOralWeight(Number(e.target.value))}
                                            className="col-span-2 h-8"
                                        />
                                    </div>
                                    <Button size="sm" onClick={handleWeightSave}>Speichern</Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
            <div className="flex items-center gap-2">
                 <Button variant="ghost" size="sm" onClick={() => onEditSubject(subject)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Bearbeiten
                 </Button>
                <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Löschen
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Fach löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Diese Aktion kann nicht rückgängig gemacht werden. Alle Noten in diesem Fach werden ebenfalls gelöscht.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDeleteSubject(subject.id)} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </>
  );
}
