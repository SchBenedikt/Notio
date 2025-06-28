"use client";

import { useState } from "react";
import { PenLine, MessageSquareText, Plus, Star, Trash2, ChevronDown, BrainCircuit } from "lucide-react";
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
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Grade, Subject, AddGradeData } from "@/lib/types";
import { calculateFinalGrade } from "@/lib/utils";
import { AddGradeDialog } from "./add-grade-dialog";
import { Badge } from "@/components/ui/badge";
import { StudyCoachDialog } from "./study-coach-dialog";

type SubjectCardProps = {
  subject: Subject;
  grades: Grade[];
  onAddGrade: (subjectId: string, values: AddGradeData) => void;
  onDeleteGrade: (gradeId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  animationIndex: number;
};

export function SubjectCard({ subject, grades, onAddGrade, onDeleteGrade, onDeleteSubject, animationIndex }: SubjectCardProps) {
  const [isAddGradeOpen, setIsAddGradeOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const finalGrade = calculateFinalGrade(grades);

  const writtenGrades = grades.filter((g) => g.type === "Schulaufgabe");
  const oralGrades = grades.filter((g) => g.type === "mündliche Note");

  const handleAddGradeSubmit = (values: AddGradeData) => {
    onAddGrade(subject.id, values);
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
    <li key={grade.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
      <div className="flex items-center gap-3">
        {grade.type === "Schulaufgabe" ? <PenLine className="h-5 w-5 text-muted-foreground" /> : <MessageSquareText className="h-5 w-5 text-muted-foreground" />}
        <div className="flex-1">
          <p className="font-medium text-sm">
            {grade.name || grade.type} <span className="text-xs text-muted-foreground">(x{grade.weight})</span>
          </p>
          <p className="text-xs text-muted-foreground">{new Date(grade.date).toLocaleDateString('de-DE')}</p>
          {grade.notes && <p className="text-xs text-muted-foreground pt-1 italic">"{grade.notes}"</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`flex items-center justify-center h-8 w-8 rounded-md font-bold text-sm border ${getGradeColor(grade.value)}`}>
          {grade.value.toFixed(0)}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-4 w-4"/>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Note löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Aktion kann nicht rückgängig gemacht werden. Möchtest du diese Note wirklich dauerhaft löschen?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDeleteGrade(grade.id)} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
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
          <div className="flex items-center gap-4">
             {subject.category === "Hauptfach" && <Star className="h-5 w-5 text-amber-500 fill-amber-400" />}
            <span>{subject.name}</span>
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
          {grades.length > 0 ? (
            <div className="space-y-4">
              {writtenGrades.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Schulaufgaben</h4>
                  <ul className="space-y-2">{writtenGrades.map(renderGradeItem)}</ul>
                </div>
              )}
              {oralGrades.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">Mündliche & sonstige Noten</h4>
                  <ul className="space-y-2">{oralGrades.map(renderGradeItem)}</ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">Noch keine Noten für dieses Fach.</p>
            </div>
          )}
          <Separator className="my-4" />
          <div className="flex justify-between items-center gap-2 flex-wrap">
             <div className="flex items-center gap-2">
                <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Fach löschen
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
                <Button variant="outline" size="sm" onClick={() => setIsCoachOpen(true)}>
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    Lern-Coach
                </Button>
            </div>
            <Button size="sm" onClick={() => setIsAddGradeOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Note hinzufügen
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AddGradeDialog 
        isOpen={isAddGradeOpen}
        onOpenChange={setIsAddGradeOpen}
        onSubmit={handleAddGradeSubmit}
        subjectName={subject.name}
      />
      <StudyCoachDialog
        isOpen={isCoachOpen}
        onOpenChange={setIsCoachOpen}
        subject={subject}
        grades={grades}
       />
    </>
  );
}
