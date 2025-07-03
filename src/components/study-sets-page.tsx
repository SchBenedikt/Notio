
"use client";

import { useState, useMemo } from "react";
import type { StudySet, Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, BrainCircuit, Search } from "lucide-react";
import { StudySetCard } from "./study-set-card";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

type StudySetsPageProps = {
  studySets: StudySet[];
  subjects: Subject[];
  onViewStudySet: (id: string) => void;
  onEditStudySet: (set: StudySet) => void;
  onDeleteStudySet: (id: string) => void;
  onAddNew: () => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
};

export function StudySetsPage({ studySets, subjects, onViewStudySet, onEditStudySet, onDeleteStudySet, onAddNew, onToggleFavorite }: StudySetsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredStudySets = useMemo(() => {
    let filtered = studySets;

    if (showFavoritesOnly) {
        filtered = filtered.filter(set => set.isFavorite);
    }
    
    if (searchQuery.trim()) {
      const lowercasedQuery = searchQuery.toLowerCase();
      return filtered.filter(set =>
        set.title.toLowerCase().includes(lowercasedQuery) ||
        (set.description && set.description.toLowerCase().includes(lowercasedQuery))
      );
    }
    return filtered;
  }, [studySets, searchQuery, showFavoritesOnly]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Deine Lernsets</h1>
          <p className="text-muted-foreground">
            Erstelle, verwalte und lerne deine Karteikarten.
          </p>
        </div>
        <Button onClick={onAddNew} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Neues Lernset
        </Button>
      </div>

       <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Lernsets suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
                />
            </div>
            <div className="flex items-center space-x-2 border bg-background rounded-md px-3 py-2">
                <Switch id="favorites-only-ss" checked={showFavoritesOnly} onCheckedChange={setShowFavoritesOnly} />
                <Label htmlFor="favorites-only-ss" className="text-sm">Nur Favoriten</Label>
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
                  onToggleFavorite={onToggleFavorite}
                  animationIndex={index}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center justify-center min-h-[50vh] bg-background/50 rounded-lg border border-dashed">
            <h2 className="text-2xl font-semibold">Keine Ergebnisse</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Für deine Suche oder deine Filter wurde kein Lernset gefunden.
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
