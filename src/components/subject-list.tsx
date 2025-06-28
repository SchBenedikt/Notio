"use client";

import { Subject, Grade, AddGradeData, AddSubjectData } from "@/lib/types";
import { SubjectCard } from "./subject-card";
import { Button } from "@/components/ui/button";

type SubjectListProps = {
  subjects: Subject[];
  grades: Grade[];
  onAddGrade: (subjectId: string, values: AddGradeData) => void;
  onDeleteGrade: (gradeId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  onAddSubject: () => void;
};

export function SubjectList({ subjects, grades, onAddGrade, onDeleteGrade, onDeleteSubject, onAddSubject }: SubjectListProps) {
  if (subjects.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center min-h-[60vh] bg-muted/30 rounded-lg border border-dashed">
        <h2 className="text-2xl font-semibold font-headline">Willkommen bei Noten Meister!</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Du hast noch keine Fächer für diese Jahrgangsstufe angelegt. Erstelle dein erstes Fach, um Noten hinzuzufügen.
        </p>
        <Button onClick={onAddSubject} className="mt-6" size="lg">
          Erstes Fach erstellen
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          grades={grades.filter((g) => g.subjectId === subject.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          onAddGrade={onAddGrade}
          onDeleteGrade={onDeleteGrade}
          onDeleteSubject={onDeleteSubject}
        />
      ))}
    </div>
  );
}
