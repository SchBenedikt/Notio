"use client";

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { StudySet } from "@/lib/types";
import { Search, BrainCircuit } from "lucide-react";

type StudySetSelectionDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onStudySetsSelected: (studySets: StudySet[]) => void;
  allStudySets: StudySet[];
};

export function StudySetSelectionDialog({ isOpen, onOpenChange, onStudySetsSelected, allStudySets }: StudySetSelectionDialogProps) {
  const [selectedSets, setSelectedSets] = useState<StudySet[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudySets = useMemo(() => {
    if (!searchQuery) return allStudySets;
    return allStudySets.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allStudySets, searchQuery]);

  const handleSelectSet = (studySet: StudySet, isSelected: boolean) => {
    if (isSelected) {
      setSelectedSets(prev => [...prev, studySet]);
    } else {
      setSelectedSets(prev => prev.filter(s => s.id !== studySet.id));
    }
  };

  const handleConfirmSelection = () => {
    onStudySetsSelected(selectedSets);
    onOpenChange(false);
    setSelectedSets([]);
  };

  const isSetSelected = (studySet: StudySet) => {
    return selectedSets.some(s => s.id === studySet.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { setSelectedSets([]); setSearchQuery('') } onOpenChange(open); }}>
      <DialogContent className="sm:max-w-2xl grid-rows-[auto_1fr_auto] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Lernsets für KI-Tutor auswählen</DialogTitle>
          <DialogDescription>Wähle eines oder mehrere Lernsets aus, die der Tutor analysieren soll.</DialogDescription>
        </DialogHeader>
        <div className="border-t border-b -mx-6 px-6 py-4 overflow-hidden">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Lernsets suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="h-[40vh]">
            {filteredStudySets.length > 0 ? (
              <ul className="space-y-1 pr-4">
                {filteredStudySets.map((set) => (
                  <li key={set.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                    <Checkbox
                      id={`set-${set.id}`}
                      checked={isSetSelected(set)}
                      onCheckedChange={(checked) => handleSelectSet(set, !!checked)}
                    />
                    <label
                      htmlFor={`set-${set.id}`}
                      className="flex-1 flex items-center gap-2 text-sm font-medium cursor-pointer"
                    >
                      <BrainCircuit className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{set.title}</span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10 text-muted-foreground">Keine Lernsets gefunden.</div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={handleConfirmSelection} disabled={selectedSets.length === 0}>
            {selectedSets.length > 0 ? `${selectedSets.length} Set(s) hinzufügen` : "Hinzufügen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
