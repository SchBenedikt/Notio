"use client";
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Lernzettel } from "@/lib/types";
import { Search, Notebook } from "lucide-react";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

type PostLernzettelSelectionDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLernzettelSelected: (lernzettel: Lernzettel) => void;
  allLernzettel: Lernzettel[];
};

export function PostLernzettelSelectionDialog({ isOpen, onOpenChange, onLernzettelSelected, allLernzettel }: PostLernzettelSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLernzettel = useMemo(() => {
    if (!searchQuery) return allLernzettel;
    return allLernzettel.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allLernzettel, searchQuery]);

  const handleSelect = (lernzettel: Lernzettel) => {
    onLernzettelSelected(lernzettel);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md grid-rows-[auto_1fr_auto] max-h-[70vh]">
        <DialogHeader>
          <DialogTitle>Lernzettel teilen</DialogTitle>
          <DialogDescription>Wähle einen Lernzettel aus, den du in deinem Beitrag teilen möchtest.</DialogDescription>
        </DialogHeader>
        <div className="border-t border-b -mx-6 px-6 py-4 overflow-hidden flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Lernzettel suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <ScrollArea className="flex-1 -mr-6 pr-6">
            {filteredLernzettel.length > 0 ? (
              <div className="space-y-1">
                {filteredLernzettel.map((lz) => (
                  <Button
                    key={lz.id}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => handleSelect(lz)}
                  >
                    <Notebook className="h-4 w-4 mr-3" />
                    <div>
                      <p>{lz.title}</p>
                      <p className="text-xs text-muted-foreground">Bearbeitet: {lz.updatedAt?.toDate() ? format(lz.updatedAt.toDate(), "dd.MM.yy", {locale: de}) : 'N/A'}</p>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">Keine Lernzettel gefunden.</p>
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
