"use client";

import { Subject, Grade, StudySet } from "@/lib/types";
import { SubjectCard } from "./subject-card";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Search } from "lucide-react";

type SubjectListProps = {
  mainSubjects: Subject[];
  minorSubjects: Subject[];
  grades: Grade[];
  studySets: StudySet[];
  onDeleteSubject: (subjectId: string) => void;
  onUpdateSubject: (subjectId: string, values: Partial<Subject>) => void;
  onAddSubject: () => void;
  totalSubjectsCount: number;
  onAddGradeToSubject: (subjectId: string) => void;
  onEditSubject: (subject: Subject) => void;
  onShowGradeInfo: (grade: Grade) => void;
  onEditGrade: (grade: Grade) => void;
  onViewStudySet: (id: string) => void;
  onEditStudySet: (set: StudySet) => void;
  onDeleteStudySet: (id: string) => void;
  onOpenCommandPalette: () => void;
};

export function SubjectList({ 
  mainSubjects, 
  minorSubjects, 
  grades, 
  studySets,
  onDeleteSubject, 
  onUpdateSubject,
  onAddSubject,
  totalSubjectsCount,
  onAddGradeToSubject,
  onEditSubject,
  onShowGradeInfo,
  onEditGrade,
  onViewStudySet,
  onEditStudySet,
  onDeleteStudySet,
  onOpenCommandPalette
}: SubjectListProps) {
  
  if (totalSubjectsCount === 0) {
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

  const renderSubjectList = (subjects: Subject[], startIndex: number = 0) => (
    <Accordion type="multiple" className="w-full space-y-2">
      {subjects.map((subject, index) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          grades={grades.filter((g) => g.subjectId === subject.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          studySets={studySets}
          onDeleteSubject={onDeleteSubject}
          onUpdateSubject={onUpdateSubject}
          animationIndex={startIndex + index}
          onAddGradeToSubject={onAddGradeToSubject}
          onEditSubject={onEditSubject}
          onShowGradeInfo={onShowGradeInfo}
          onEditGrade={onEditGrade}
          onViewStudySet={onViewStudySet}
          onEditStudySet={onEditStudySet}
          onDeleteStudySet={onDeleteStudySet}
        />
      ))}
    </Accordion>
  );
  
  const noSearchResults = mainSubjects.length === 0 && minorSubjects.length === 0;

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        className="w-full h-12 text-base rounded-lg flex justify-start items-center text-muted-foreground"
        onClick={onOpenCommandPalette}
      >
        <Search className="mr-3 h-5 w-5" />
        Suchen oder Befehl ausführen...
        <kbd className="pointer-events-none ml-auto hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {noSearchResults ? (
        <div className="text-center py-20 flex flex-col items-center justify-center min-h-[50vh] bg-background/50 rounded-lg">
          <h2 className="text-2xl font-semibold">Keine Fächer gefunden</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Für die ausgewählte Klassenstufe gibt es keine Fächer.
          </p>
           <Button onClick={onAddSubject} className="mt-6">
              Neues Fach erstellen
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 items-start">
          {mainSubjects.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Hauptfächer</h2>
              {renderSubjectList(mainSubjects, 0)}
            </section>
          )}
          
          {minorSubjects.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold tracking-tight mb-4">Nebenfächer</h2>
              {renderSubjectList(minorSubjects, mainSubjects.length)}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
