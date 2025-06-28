"use client";

import { Subject, Grade, AddGradeData } from "@/lib/types";
import { SubjectCard } from "./subject-card";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";

type SubjectListProps = {
  mainSubjects: Subject[];
  minorSubjects: Subject[];
  grades: Grade[];
  onAddGrade: (subjectId: string, values: AddGradeData) => void;
  onDeleteGrade: (gradeId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
  onAddSubject: () => void;
};

export function SubjectList({ 
  mainSubjects, 
  minorSubjects, 
  grades, 
  onAddGrade, 
  onDeleteGrade, 
  onDeleteSubject, 
  onAddSubject 
}: SubjectListProps) {
  
  const allSubjects = [...mainSubjects, ...minorSubjects];

  if (allSubjects.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center min-h-[60vh] bg-background/50 rounded-lg border border-dashed">
        <h2 className="text-2xl font-semibold">Willkommen bei Noten Meister!</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Du hast noch keine Fächer für diese Jahrgangsstufe angelegt. Erstelle dein erstes Fach, um Noten hinzuzufügen.
        </p>
        <Button onClick={onAddSubject} className="mt-6" size="lg">
          Erstes Fach erstellen
        </Button>
      </div>
    );
  }

  const renderSubjectList = (subjects: Subject[]) => (
    <Accordion type="multiple" className="w-full space-y-2">
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
    </Accordion>
  );

  return (
    <div className="grid grid-cols-1 gap-8 items-start">
      {mainSubjects.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Hauptfächer</h2>
          {renderSubjectList(mainSubjects)}
        </section>
      )}
      
      {minorSubjects.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">Nebenfächer</h2>
          {renderSubjectList(minorSubjects)}
        </section>
      )}
    </div>
  );
}
