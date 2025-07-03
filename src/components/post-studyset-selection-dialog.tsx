"use client";
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { StudySet } from "@/lib/types";
import { Search, BrainCircuit } from "lucide-react";

type PostStudySetSelectionDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onStudySetSelected: (studySet: StudySet) => void;
  allStudySets: StudySet[];
};

export function PostStudySetSelectionDialog({ isOpen, onOpenChange, onStudySetSelected, allStudySets }: PostStudySetSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudySets = useMemo(() => {
    if (!searchQuery) return allStudySets;
    return allStudySets.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allStudySets, searchQuery]);

  const handleSelectSet = (studySet: StudySet) => {
    onStudySetSelected(studySet);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md grid-rows-[auto_1fr_auto] max-h-[70vh]">
        <DialogHeader>
          <DialogTitle>Lernset teilen</DialogTitle>
          <DialogDescription>Wähle ein Lernset aus, das du in deinem Beitrag teilen möchtest.</DialogDescription>
        </DialogHeader>
        <div className="border-t border-b -mx-6 px-6 py-4 overflow-hidden flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Lernsets suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="flex-1 -mr-6 pr-6">
            {filteredStudySets.length > 0 ? (
              <div className="space-y-1">
                {filteredStudySets.map((set) => (
                  <Button
                    key={set.id}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => handleSelectSet(set)}
                  >
                    <BrainCircuit className="h-4 w-4 mr-3" />
                    <div>
                      <p>{set.title}</p>
                      <p className="text-xs text-muted-foreground">{set.cards.length} Begriffe</p>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">Keine Lernsets gefunden.</p>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Abbrechen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
