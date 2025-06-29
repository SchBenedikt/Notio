"use client";

import type { StudySet } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus, BrainCircuit } from "lucide-react";
import { StudySetCard } from "./study-set-card";

type StudySetsPageProps = {
  studySets: StudySet[];
  onViewStudySet: (id: string) => void;
  onEditStudySet: (set: StudySet) => void;
  onDeleteStudySet: (id: string) => void;
  onAddNew: () => void;
};

export function StudySetsPage({ studySets, onViewStudySet, onEditStudySet, onDeleteStudySet, onAddNew }: StudySetsPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Deine Lernsets</h1>
          <p className="text-muted-foreground">
            Erstelle, verwalte und lerne deine Karteikarten.
          </p>
        </div>
        <Button onClick={onAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Neues Lernset
        </Button>
      </div>

      {studySets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {studySets.map((set, index) => (
            <StudySetCard
              key={set.id}
              studySet={set}
              onSelect={onViewStudySet}
              onEdit={onEditStudySet}
              onDelete={onDeleteStudySet}
              animationIndex={index}
            />
          ))}
        </div>
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
