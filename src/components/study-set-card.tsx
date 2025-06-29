"use client";

import type { StudySet } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Layers, MoreVertical, PlayCircle, BookCopy } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

type StudySetCardProps = {
  studySet: StudySet;
  subjectName?: string;
  onSelect: (id: string) => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  animationIndex: number;
};

export function StudySetCard({ studySet, subjectName, onSelect, onEdit, onDelete, animationIndex }: StudySetCardProps) {
  return (
    <div className="animate-fade-in-down" style={{ animationDelay: `${animationIndex * 75}ms`, opacity: 0 }}>
        <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{studySet.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{studySet.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Bearbeiten
                            </DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Löschen
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Lernset löschen?</AlertDialogTitle><AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(studySet.id)} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Layers className="h-4 w-4" />
                    <span>{studySet.cards.length} Begriff{studySet.cards.length !== 1 ? 'e' : ''}</span>
                </div>
                {subjectName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookCopy className="h-4 w-4" />
                    <span>{subjectName}</span>
                  </div>
                )}
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={() => onSelect(studySet.id)}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Lernen
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
