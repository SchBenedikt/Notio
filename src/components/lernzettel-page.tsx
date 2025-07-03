"use client";

import { useState, useMemo } from "react";
import type { Lernzettel, Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Notebook, Search } from "lucide-react";
import { LernzettelCard } from "./lernzettel-card";

type LernzettelPageProps = {
  lernzettel: Lernzettel[];
  subjects: Subject[];
  onViewLernzettel: (id: string) => void;
  onEditLernzettel: (set: Lernzettel) => void;
  onDeleteLernzettel: (id: string) => void;
  onAddNew: () => void;
};

export function LernzettelPage({ lernzettel, subjects, onViewLernzettel, onEditLernzettel, onDeleteLernzettel, onAddNew }: LernzettelPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLernzettel = useMemo(() => {
    if (!searchQuery.trim()) {
      return lernzettel;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return lernzettel.filter(lz =>
      lz.title.toLowerCase().includes(lowercasedQuery) ||
      (lz.content && lz.content.toLowerCase().includes(lowercasedQuery))
    );
  }, [lernzettel, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Deine Lernzettel</h1>
          <p className="text-muted-foreground">
            Erstelle, verwalte und verknüpfe dein Wissen.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Lernzettel suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
          <Button onClick={onAddNew} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Lernzettel
          </Button>
        </div>
      </div>

      {lernzettel.length > 0 ? (
        filteredLernzettel.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLernzettel.map((lz, index) => {
              const subject = subjects.find(s => s.id === lz.subjectId);
              return (
                <LernzettelCard
                  key={lz.id}
                  lernzettel={lz}
                  subjectName={subject?.name}
                  onSelect={onViewLernzettel}
                  onEdit={() => onEditLernzettel(lz)}
                  onDelete={onDeleteLernzettel}
                  animationIndex={index}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center justify-center min-h-[50vh] bg-background/50 rounded-lg border border-dashed">
            <h2 className="text-2xl font-semibold">Keine Ergebnisse</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Für deine Suche nach "{searchQuery}" wurde kein Lernzettel gefunden.
            </p>
          </div>
        )
      ) : (
        <div className="text-center py-20 flex flex-col items-center justify-center min-h-[60vh] bg-background/50 rounded-lg border border-dashed">
          <div className="p-3 bg-primary/10 rounded-full border-8 border-primary/5 mb-4">
              <Notebook className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Dein erster Lernzettel</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Du hast noch keine Lernzettel erstellt. Klicke auf "Neuer Lernzettel", um loszulegen.
          </p>
          <Button onClick={onAddNew} className="mt-6">
            Lernzettel erstellen
          </Button>
        </div>
      )}
    </div>
  );
}
