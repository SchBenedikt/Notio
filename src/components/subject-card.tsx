"use client";

import { useState } from "react";
import { BookOpen, PenLine, MessageSquareText, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Grade, Subject, AddGradeData } from "@/lib/types";
import { calculateFinalGrade } from "@/lib/utils";
import { AddGradeDialog } from "./add-grade-dialog";
import { cn } from "@/lib/utils";

type SubjectCardProps = {
  subject: Subject;
  grades: Grade[];
  onAddGrade: (subjectId: string, values: AddGradeData) => void;
  onDeleteGrade: (gradeId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
};

export function SubjectCard({ subject, grades, onAddGrade, onDeleteGrade, onDeleteSubject }: SubjectCardProps) {
  const [isAddGradeOpen, setIsAddGradeOpen] = useState(false);
  const finalGrade = calculateFinalGrade(grades);

  const handleAddGradeSubmit = (values: AddGradeData) => {
    onAddGrade(subject.id, values);
  };

  return (
    <>
      <Card className="flex flex-col transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
               <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-headline">{subject.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 pt-1">
                {subject.category === "Hauptfach" ? <Star className="h-4 w-4 text-amber-500 fill-amber-400" /> : null}
                <span>{subject.category}</span>
              </CardDescription>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
             <p className="text-3xl font-bold text-primary">{finalGrade}</p>
             <p className="text-xs text-muted-foreground">Durchschnitt</p>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <Separator />
          {grades.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
               <ul className="space-y-1">
                {grades.map((grade) => (
                  <li key={grade.id} className="flex items-start justify-between transition-colors hover:bg-muted/50 p-2 rounded-md">
                    <div className="flex items-start gap-3 flex-grow">
                      {grade.type === "Schulaufgabe" ? <PenLine className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" /> : <MessageSquareText className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />}
                      <div className="flex-grow">
                        <p className="font-medium">{grade.type}</p>
                        <p className="text-sm text-muted-foreground">Gewichtung: {grade.weight} &middot; {new Date(grade.date).toLocaleDateString('de-DE')}</p>
                        {grade.notes && <p className="text-xs text-muted-foreground pt-1 italic">Notiz: {grade.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <p className={cn("text-lg font-semibold w-8 text-center", grade.value <= 2 ? "text-green-600" : grade.value >= 4 ? "text-red-600" : "text-foreground")}>{grade.value.toFixed(0)}</p>
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
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>Noch keine Noten für dieses Fach.</p>
              <p className="text-sm">Füge die erste Note hinzu!</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-muted/30 p-3 rounded-b-lg border-t">
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
          <Button onClick={() => setIsAddGradeOpen(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Note hinzufügen
          </Button>
        </CardFooter>
      </Card>
      <AddGradeDialog 
        isOpen={isAddGradeOpen}
        onOpenChange={setIsAddGradeOpen}
        onSubmit={handleAddGradeSubmit}
        subjectName={subject.name}
      />
    </>
  );
}
