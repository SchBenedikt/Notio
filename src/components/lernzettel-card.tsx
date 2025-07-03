"use client";

import type { Lernzettel } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MoreVertical, Eye, BookCopy } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

type LernzettelCardProps = {
  lernzettel: Lernzettel;
  subjectName?: string;
  onSelect: (id: string) => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
  animationIndex: number;
};

export function LernzettelCard({ lernzettel, subjectName, onSelect, onEdit, onDelete, animationIndex }: LernzettelCardProps) {
  return (
    <div className="animate-fade-in-down" style={{ animationDelay: `${animationIndex * 75}ms`, opacity: 0 }}>
        <Card className="flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{lernzettel.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-xs">
                          Bearbeitet: {formatDistanceToNow(lernzettel.updatedAt.toDate(), { addSuffix: true, locale: de })}
                        </CardDescription>
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
                                    <AlertDialogHeader><AlertDialogTitle>Lernzettel löschen?</AlertDialogTitle><AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(lernzettel.id)} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                 {subjectName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookCopy className="h-4 w-4" />
                    <span>{subjectName}</span>
                  </div>
                )}
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={() => onSelect(lernzettel.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Anzeigen
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
