"use client";

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Lernzettel } from "@/lib/types";
import { Search, Notebook } from "lucide-react";

type LernzettelSelectionDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (lernzettelIds: string[]) => void;
  allLernzettel: Lernzettel[];
  initialSelectedIds?: string[];
};

export function LernzettelSelectionDialog({ isOpen, onOpenChange, onConfirm, allLernzettel, initialSelectedIds = [] }: LernzettelSelectionDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLernzettel = useMemo(() => {
    if (!searchQuery) return allLernzettel;
    return allLernzettel.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allLernzettel, searchQuery]);

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

  const isSelected = (id: string) => {
    return selectedIds.includes(id);
  };
  
  React.useEffect(() => {
      if (isOpen) {
          setSelectedIds(initialSelectedIds);
          setSearchQuery("");
      }
  }, [isOpen, initialSelectedIds]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl grid-rows-[auto_1fr_auto] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Lernzettel verknüpfen</DialogTitle>
          <DialogDescription>Wähle einen oder mehrere Lernzettel aus, die zu diesem Lernset gehören.</DialogDescription>
        </DialogHeader>
        <div className="border-t border-b -mx-6 px-6 py-4 overflow-hidden">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Lernzettel suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="h-[40vh]">
            {filteredLernzettel.length > 0 ? (
              <ul className="space-y-1 pr-4">
                {filteredLernzettel.map((lz) => (
                  <li key={lz.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                    <Checkbox
                      id={`lz-${lz.id}`}
                      checked={isSelected(lz.id)}
                      onCheckedChange={(checked) => handleSelect(lz.id, !!checked)}
                    />
                    <label
                      htmlFor={`lz-${lz.id}`}
                      className="flex-1 flex items-center gap-2 text-sm font-medium cursor-pointer"
                    >
                      <Notebook className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{lz.title}</span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10 text-muted-foreground">Keine Lernzettel gefunden.</div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={handleConfirmSelection}>
            {selectedIds.length > 0 ? `${selectedIds.length} Lernzettel verknüpfen` : "Verknüpfen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
