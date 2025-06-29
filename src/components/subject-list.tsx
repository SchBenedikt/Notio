"use client";

import { Subject, Grade, AddGradeData } from "@/lib/types";
import { SubjectCard } from "./subject-card";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type SubjectListProps = {
  mainSubjects: Subject[];
  minorSubjects: Subject[];
  grades: Grade[];
  onDeleteSubject: (subjectId: string) => void;
  onUpdateSubject: (subjectId: string, values: Partial<Subject>) => void;
  onAddSubject: () => void;
  totalSubjectsCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddGradeToSubject: (subjectId: string) => void;
  onEditSubject: (subject: Subject) => void;
  onShowGradeInfo: (grade: Grade) => void;
};

export function SubjectList({ 
  mainSubjects, 
  minorSubjects, 
  grades, 
  onDeleteSubject, 
  onUpdateSubject,
  onAddSubject,
  totalSubjectsCount,
  searchQuery,
  onSearchChange,
  onAddGradeToSubject,
  onEditSubject,
  onShowGradeInfo
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
          onDeleteSubject={onDeleteSubject}
          onUpdateSubject={onUpdateSubject}
          animationIndex={startIndex + index}
          onAddGradeToSubject={onAddGradeToSubject}
          onEditSubject={onEditSubject}
          onShowGradeInfo={onShowGradeInfo}
        />
      ))}
    </Accordion>
  );
  
  const noSearchResults = mainSubjects.length === 0 && minorSubjects.length === 0 && searchQuery;

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Fächer, Noten oder Notizen suchen..."
          className="w-full h-12 pl-11 text-base rounded-lg"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {noSearchResults ? (
        <div className="text-center py-20 flex flex-col items-center justify-center min-h-[50vh] bg-background/50 rounded-lg">
          <h2 className="text-2xl font-semibold">Keine Ergebnisse</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Für deine Suche nach "{searchQuery}" wurde nichts gefunden.
          </p>
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
