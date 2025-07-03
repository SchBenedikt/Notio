"use client";

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { StudySet } from "@/lib/types";
import { Search, BrainCircuit } from "lucide-react";

type StudySetMultiSelectionDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (selectedIds: string[]) => void;
  allStudySets: StudySet[];
  initialSelectedIds?: string[];
};

export function StudySetMultiSelectionDialog({ isOpen, onOpenChange, onConfirm, allStudySets, initialSelectedIds = [] }: StudySetMultiSelectionDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
      if (isOpen) {
          setSelectedIds(initialSelectedIds);
          setSearchQuery("");
      }
  }, [isOpen, initialSelectedIds]);

  const filteredStudySets = useMemo(() => {
    if (!searchQuery) return allStudySets;
    return allStudySets.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allStudySets, searchQuery]);

  const handleSelect = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(sId => sId !== id));
    }
  };

  const handleConfirmSelection = () => {
    onConfirm(selectedIds);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl grid-rows-[auto_1fr_auto] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Lernsets verknüpfen</DialogTitle>
          <DialogDescription>Wähle die Lernsets aus, die zu diesem Lernzettel gehören.</DialogDescription>
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
                      checked={selectedIds.includes(set.id)}
                      onCheckedChange={(checked) => handleSelect(set.id, !!checked)}
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
          <Button onClick={handleConfirmSelection}>
            {selectedIds.length > 0 ? `${selectedIds.length} Lernset(s) verknüpfen` : "Auswahl bestätigen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
