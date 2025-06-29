"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Grade, Subject, Attachment } from "@/lib/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { File as FileIcon, Paperclip, Calendar, Tag, Weight, Type, FileText } from "lucide-react";

type GradeInfoDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  grade: Grade | null;
  subject: Subject | null;
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="text-muted-foreground shrink-0 w-6 flex justify-center mt-1">{icon}</div>
        <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="font-semibold text-card-foreground">{value}</div>
        </div>
    </div>
);

export function GradeInfoDialog({ isOpen, onOpenChange, grade, subject }: GradeInfoDialogProps) {
  if (!isOpen || !grade || !subject) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Details zur Note</DialogTitle>
          <DialogDescription>
            Informationen zur Note im Fach "{subject.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
           <InfoRow 
            icon={<span className="text-xl font-bold">{grade.value.toFixed(0)}</span>}
            label="Note"
            value={grade.value.toFixed(1)}
          />
          <InfoRow 
            icon={<Tag className="h-4 w-4" />} 
            label="Bezeichnung"
            value={grade.name || grade.type}
          />
          <InfoRow 
            icon={<Type className="h-4 w-4" />}
            label="Notentyp"
            value={<Badge variant="outline">{grade.type}</Badge>}
          />
          <InfoRow 
            icon={<Weight className="h-4 w-4" />}
            label="Gewichtung"
            value={`x${grade.weight}`}
          />
          <InfoRow 
            icon={<Calendar className="h-4 w-4" />}
            label="Datum"
            value={format(new Date(grade.date), "dd. MMMM yyyy", { locale: de })}
          />
          {grade.notes && (
            <InfoRow 
                icon={<FileText className="h-4 w-4" />}
                label="Notizen"
                value={<p className="font-normal italic text-muted-foreground">"{grade.notes}"</p>}
            />
          )}
          {grade.attachments && grade.attachments.length > 0 && (
             <div>
                <div className="flex items-start gap-4">
                    <div className="text-muted-foreground shrink-0 w-6 flex justify-center mt-1"><Paperclip className="h-4 w-4" /></div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Anhänge</p>
                        <div className="space-y-2 mt-2">
                        {grade.attachments.map((attachment, index) => (
                            <Button key={index} variant="secondary" asChild className="w-full justify-start h-auto py-2">
                                <a
                                    href={attachment.dataUrl}
                                    download={attachment.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3"
                                >
                                    <FileIcon className="h-4 w-4" />
                                    <span className="truncate flex-1 text-left">{attachment.name}</span>
                                </a>
                            </Button>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
        <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
