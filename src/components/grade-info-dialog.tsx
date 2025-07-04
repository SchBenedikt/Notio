
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Grade, Subject } from "@/lib/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  File as FileIcon,
  Paperclip,
  Calendar,
  Tag,
  Weight,
  Type,
  FileText,
  Pencil,
  Trash2,
  MoreHorizontal,
  Hash,
  Star,
  Percent,
  Calculator,
  List,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";

type GradeInfoDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  grade: Grade | null;
  subject: Subject | null;
  onEdit: (grade: Grade) => void;
  onDelete: (gradeId: string) => void;
};

const InfoRow = ({
  icon,
  label,
  value,
  alignTop = false
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  alignTop?: boolean;
}) => (
  <div className={`flex gap-4 ${alignTop ? 'items-start' : 'items-center'}`}>
    <div className={`text-muted-foreground shrink-0 w-6 flex justify-center ${alignTop ? 'mt-1' : ''}`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="font-semibold text-card-foreground">{value}</div>
    </div>
  </div>
);

export function GradeInfoDialog({
  isOpen,
  onOpenChange,
  grade,
  subject,
  onEdit,
  onDelete,
}: GradeInfoDialogProps) {
  if (!isOpen || !grade || !subject) {
    return null;
  }
  
  const hasExtraData = grade.maxPoints != null || grade.classAverage != null || grade.gradeDistribution != null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Details zur Note</DialogTitle>
          <DialogDescription>
            Informationen zur Note im Fach "{subject.name}".
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] -mx-6 px-6">
            <div className="space-y-4 py-2">
                <InfoRow icon={<Star className="h-4 w-4" />} label="Note" value={grade.value ? grade.value.toFixed(1) : "Geplant"} />
                <InfoRow icon={<Tag className="h-4 w-4" />} label="Bezeichnung" value={grade.name || grade.type} />
                <InfoRow icon={<Type className="h-4 w-4" />} label="Notentyp" value={<Badge variant="outline">{grade.type}</Badge>} />
                <InfoRow icon={<Weight className="h-4 w-4" />} label="Gewichtung" value={`x${grade.weight}`} />
                <InfoRow icon={<Calendar className="h-4 w-4" />} label="Datum" value={format(new Date(grade.date), "dd. MMMM yyyy", { locale: de })}/>
                
                {hasExtraData && <hr className="my-4" />}

                {grade.achievedPoints != null && grade.maxPoints != null && (
                    <InfoRow icon={<Calculator className="h-4 w-4" />} label="Punkte" value={`${grade.achievedPoints} / ${grade.maxPoints}`} />
                )}
                {grade.classAverage != null && (
                    <InfoRow icon={<Percent className="h-4 w-4" />} label="Klassenschnitt" value={grade.classAverage.toFixed(2)} />
                )}
                {grade.gradeDistribution && (
                     <InfoRow icon={<List className="h-4 w-4" />} label="Notenverteilung" alignTop value={
                        <div className="grid grid-cols-6 gap-1 mt-1">
                            {Object.entries(grade.gradeDistribution).map(([note, count]) => (
                                <div key={note} className="text-center p-1 bg-muted/50 rounded-md">
                                    <p className="text-xs text-muted-foreground">{note}</p>
                                    <p className="font-bold">{count}</p>
                                </div>
                            ))}
                        </div>
                    }/>
                )}
                 {grade.gradingScale && (
                     <InfoRow icon={<Hash className="h-4 w-4" />} label="Punkteschlüssel" alignTop value={
                         <Table className="mt-1 text-xs">
                             <TableHeader><TableRow><TableHead className="h-6">Note</TableHead><TableHead className="h-6 text-right">min. Punkte</TableHead></TableRow></TableHeader>
                             <TableBody>
                                 {Object.entries(grade.gradingScale).map(([note, points]) => (
                                     <TableRow key={note}><TableCell className="py-1 font-medium">{note}</TableCell><TableCell className="py-1 text-right">{points}</TableCell></TableRow>
                                 ))}
                             </TableBody>
                         </Table>
                    }/>
                )}
                {grade.notes && (
                    <InfoRow icon={<FileText className="h-4 w-4" />} label="Notizen" alignTop value={<p className="font-normal italic text-muted-foreground">"{grade.notes}"</p>} />
                )}
                {grade.attachments && grade.attachments.length > 0 && (
                    <InfoRow icon={<Paperclip className="h-4 w-4" />} label="Anhänge" alignTop value={
                        <div className="space-y-2 mt-2">
                        {grade.attachments.map((attachment, index) => (
                            <Button key={index} variant="secondary" asChild className="w-full justify-start h-auto py-2">
                            <a href={attachment.dataUrl} download={attachment.name} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                                <FileIcon className="h-4 w-4" />
                                <span className="truncate flex-1 text-left">{attachment.name}</span>
                            </a>
                            </Button>
                        ))}
                        </div>
                    }/>
                )}
            </div>
        </ScrollArea>
        <DialogFooter className="sm:justify-between pt-4 border-t">
          <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Weitere Optionen</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => onEdit(grade)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Bearbeiten
                  </DropdownMenuItem>
                   <DropdownMenuSeparator />
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Löschen
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Note wirklich löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Diese Aktion kann nicht rückgängig gemacht werden. Die Note wird dauerhaft entfernt.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(grade.id)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Dauerhaft löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
            <Button type="button" onClick={() => onOpenChange(false)}>
              Schließen
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
