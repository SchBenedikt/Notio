
"use client";

import { useState, useMemo } from "react";
import type { Lernzettel, Subject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Notebook, Search, ArrowDown, ArrowUp, MoreVertical, Pencil, Trash2, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";

type LernzettelPageProps = {
  lernzettel: Lernzettel[];
  subjects: Subject[];
  onViewLernzettel: (id: string) => void;
  onEditLernzettel: (set: Lernzettel) => void;
  onDeleteLernzettel: (id: string) => void;
  onAddNew: () => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
};

type SortBy = "updatedAt" | "title" | "dueDate";
type GroupBy = "subject" | "none";
type SortOrder = "asc" | "desc";

export function LernzettelPage({ lernzettel, subjects, onViewLernzettel, onEditLernzettel, onDeleteLernzettel, onAddNew, onToggleFavorite }: LernzettelPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("updatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const subjectsMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);

  const processedLernzettel = useMemo(() => {
    let filtered = lernzettel;
    if (showFavoritesOnly) {
      filtered = filtered.filter(lz => lz.isFavorite);
    }

    if (searchQuery.trim()) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(lz =>
        lz.title.toLowerCase().includes(lowercasedQuery) ||
        (lz.content && lz.content.toLowerCase().includes(lowercasedQuery))
      );
    }
    
    return filtered.sort((a, b) => {
        let compareA: any;
        let compareB: any;

        switch(sortBy) {
            case 'title':
                compareA = a.title.toLowerCase();
                compareB = b.title.toLowerCase();
                break;
            case 'dueDate':
                compareA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
                compareB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
                break;
            case 'updatedAt':
            default:
                compareA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
                compareB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
                break;
        }

        if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
        if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
  }, [lernzettel, searchQuery, sortBy, sortOrder, showFavoritesOnly]);
  
  const groupedLernzettel = useMemo(() => {
    if (groupBy === 'none') {
        return { 'all': { name: 'Alle Lernzettel', items: processedLernzettel } };
    }
    
    const grouped: Record<string, {name: string, items: Lernzettel[]}> = {};
    processedLernzettel.forEach(lz => {
        const key = lz.subjectId || 'unassigned';
        if (!grouped[key]) {
            grouped[key] = {
                name: lz.subjectId ? subjectsMap.get(lz.subjectId) || 'Unbekanntes Fach' : 'Ohne Fach',
                items: []
            };
        }
        grouped[key].items.push(lz);
    });

    return Object.fromEntries(Object.entries(grouped).sort(([,a],[,b]) => a.name.localeCompare(b.name)));
  }, [processedLernzettel, groupBy, subjectsMap]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Deine Lernzettel</h1>
          <p className="text-muted-foreground">Erstelle, verwalte und verknüpfe dein Wissen.</p>
        </div>
        <Button onClick={onAddNew} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Neuer Lernzettel
        </Button>
      </div>
      
       <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Suchen..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10"/>
            </div>
            <div className="flex gap-2">
                <div className="flex items-center space-x-2 border bg-background rounded-md px-3">
                    <Switch id="favorites-only-lz" checked={showFavoritesOnly} onCheckedChange={setShowFavoritesOnly} />
                    <Label htmlFor="favorites-only-lz" className="text-sm">Nur Favoriten</Label>
                </div>
                <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                    <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Gruppieren..." /></SelectTrigger>
                    <SelectContent><SelectItem value="none">Keine Gruppierung</SelectItem><SelectItem value="subject">Nach Fach</SelectItem></SelectContent>
                </Select>
                 <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                    <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Sortieren..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="updatedAt">Bearbeitungsdatum</SelectItem>
                        <SelectItem value="title">Titel</SelectItem>
                        <SelectItem value="dueDate">Fälligkeit</SelectItem>
                    </SelectContent>
                </Select>
                 <Button variant="outline" size="icon" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </Button>
            </div>
        </div>

      {lernzettel.length > 0 ? (
        processedLernzettel.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedLernzettel).map(([key, group]) => (
                group.items.length > 0 && (
                    <div key={key}>
                        {groupBy !== 'none' && <h2 className="text-lg font-semibold mb-2">{group.name}</h2>}
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40px] pl-2"></TableHead>
                                        <TableHead>Titel</TableHead>
                                        {groupBy === 'none' && <TableHead className="hidden sm:table-cell">Fach</TableHead>}
                                        <TableHead className="hidden md:table-cell">Fälligkeit</TableHead>
                                        <TableHead className="hidden md:table-cell">Bearbeitet</TableHead>
                                        <TableHead><span className="sr-only">Aktionen</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {group.items.map((lz) => (
                                        <TableRow key={lz.id} className="group">
                                            <TableCell className="pl-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onToggleFavorite(lz.id, !!lz.isFavorite)}>
                                                    <Star className={cn("h-5 w-5 transition-colors", lz.isFavorite ? "text-yellow-400 fill-current" : "text-muted-foreground/50 hover:text-yellow-400")} />
                                                </Button>
                                            </TableCell>
                                            <TableCell className="font-medium cursor-pointer" onClick={() => onViewLernzettel(lz.id)}>{lz.title}</TableCell>
                                            {groupBy === 'none' && <TableCell className="hidden sm:table-cell cursor-pointer" onClick={() => onViewLernzettel(lz.id)}>{subjectsMap.get(lz.subjectId || '') || '-'}</TableCell>}
                                            <TableCell className="hidden md:table-cell cursor-pointer" onClick={() => onViewLernzettel(lz.id)}>{lz.dueDate ? format(new Date(lz.dueDate), 'dd.MM.yyyy') : '-'}</TableCell>
                                            <TableCell className="hidden md:table-cell cursor-pointer" onClick={() => onViewLernzettel(lz.id)}>{lz.updatedAt?.toDate ? format(lz.updatedAt.toDate(), 'dd.MM.yyyy HH:mm') : '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => onEditLernzettel(lz)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Bearbeiten
                                                        </DropdownMenuItem>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Löschen
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Lernzettel löschen?</AlertDialogTitle>
                                                                    <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => onDeleteLernzettel(lz.id)} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         </div>
                    </div>
                )
            ))}
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center justify-center min-h-[50vh] bg-background/50 rounded-lg border border-dashed">
            <h2 className="text-2xl font-semibold">Keine Ergebnisse</h2>
            <p className="text-muted-foreground mt-2 max-w-md">Für deine Suche nach "{searchQuery}" oder deine Filter wurde kein Lernzettel gefunden.</p>
          </div>
        )
      ) : (
        <div className="text-center py-20 flex flex-col items-center justify-center min-h-[60vh] bg-background/50 rounded-lg border border-dashed">
          <div className="p-3 bg-primary/10 rounded-full border-8 border-primary/5 mb-4">
              <Notebook className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Dein erster Lernzettel</h2>
          <p className="text-muted-foreground mt-2 max-w-md">Du hast noch keine Lernzettel erstellt. Klicke auf "Neuer Lernzettel", um loszulegen.</p>
          <Button onClick={onAddNew} className="mt-6">Lernzettel erstellen</Button>
        </div>
      )}
    </div>
  );
}
