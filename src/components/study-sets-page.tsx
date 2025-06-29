"use client";

import { useState, useMemo } from "react";
import type { StudySet, Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, BrainCircuit, Search } from "lucide-react";
import { StudySetCard } from "./study-set-card";

type StudySetsPageProps = {
  studySets: StudySet[];
  subjects: Subject[];
  onViewStudySet: (id: string) => void;
  onEditStudySet: (set: StudySet) => void;
  onDeleteStudySet: (id: string) => void;
  onAddNew: () => void;
};

export function StudySetsPage({ studySets, subjects, onViewStudySet, onEditStudySet, onDeleteStudySet, onAddNew }: StudySetsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudySets = useMemo(() => {
    if (!searchQuery.trim()) {
      return studySets;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return studySets.filter(set =>
      set.title.toLowerCase().includes(lowercasedQuery) ||
      (set.description && set.description.toLowerCase().includes(lowercasedQuery))
    );
  }, [studySets, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Deine Lernsets</h1>
          <p className="text-muted-foreground">
            Erstelle, verwalte und lerne deine Karteikarten.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Lernsets suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
          <Button onClick={onAddNew} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Neues Lernset
          </Button>
        </div>
      </div>

      {studySets.length > 0 ? (
        filteredStudySets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudySets.sort((a,b) => a.title.localeCompare(b.title)).map((set, index) => {
              const subject = subjects.find(s => s.id === set.subjectId);
              return (
                <StudySetCard
                  key={set.id}
                  studySet={set}
                  subjectName={subject?.name}
                  onSelect={onViewStudySet}
                  onEdit={() => onEditStudySet(set)}
                  onDelete={onDeleteStudySet}
                  animationIndex={index}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center justify-center min-h-[50vh] bg-background/50 rounded-lg border border-dashed">
            <h2 className="text-2xl font-semibold">Keine Ergebnisse</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Für deine Suche nach "{searchQuery}" wurde kein Lernset gefunden.
            </p>
          </div>
        )
      ) : (
        <div className="text-center py-20 flex flex-col items-center justify-center min-h-[60vh] bg-background/50 rounded-lg border border-dashed">
          <div className="p-3 bg-primary/10 rounded-full border-8 border-primary/5 mb-4">
              <BrainCircuit className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Dein erstes Lernset</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Du hast noch keine Lernsets erstellt. Klicke auf "Neues Lernset", um loszulegen.
          </p>
          <Button onClick={onAddNew} className="mt-6">
            Lernset erstellen
          </Button>
        </div>
      )}
    </div>
  );
}
