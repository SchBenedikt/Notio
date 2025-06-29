"use client";

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Grade, Subject, Attachment } from "@/lib/types";
import { File as FileIcon, Search, Folder } from "lucide-react";

type PostFileSelectionDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onFilesSelected: (files: Attachment[]) => void;
  subjects: Subject[];
  grades: Grade[];
};

export function PostFileSelectionDialog({ isOpen, onOpenChange, onFilesSelected, subjects, grades }: PostFileSelectionDialogProps) {
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const attachmentsBySubject = useMemo(() => {
    const grouped: { [subjectId: string]: { subject: Subject; files: { attachment: Attachment, grade: Grade }[] } } = {};
    grades.forEach(grade => {
      if (grade.attachments && grade.attachments.length > 0) {
        let subject = subjects.find(s => s.id === grade.subjectId);
        if (!subject) return;
        if (!grouped[grade.subjectId]) {
          grouped[grade.subjectId] = { subject, files: [] };
        }
        grade.attachments.forEach(attachment => {
          grouped[grade.subjectId].files.push({ attachment, grade });
        });
      }
    });
    
    if (!searchQuery.trim()) {
      return Object.values(grouped).sort((a, b) => a.subject.name.localeCompare(b.subject.name));
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    const filteredGroups = Object.values(grouped).map(group => {
        const filteredFiles = group.files.filter(file => 
            file.attachment.name.toLowerCase().includes(lowercasedQuery) ||
            (file.grade.name || file.grade.type).toLowerCase().includes(lowercasedQuery)
        );

        if (group.subject.name.toLowerCase().includes(lowercasedQuery)) {
            return { ...group, files: group.files }; 
        }

        if (filteredFiles.length > 0) {
            return { ...group, files: filteredFiles };
        }
        return null;
    }).filter(group => group !== null) as { subject: Subject; files: { attachment: Attachment; grade: Grade }[] }[];
    
    return filteredGroups.sort((a, b) => a.subject.name.localeCompare(b.subject.name));
  }, [grades, subjects, searchQuery]);

  const handleSelectAttachment = (attachment: Attachment, isSelected: boolean) => {
    if (isSelected) {
      setSelectedAttachments(prev => [...prev, attachment]);
    } else {
      setSelectedAttachments(prev => prev.filter(att => att.dataUrl !== attachment.dataUrl));
    }
  };

  const handleConfirmSelection = () => {
    onFilesSelected(selectedAttachments);
    onOpenChange(false);
    setSelectedAttachments([]); // Reset for next time
  };

  const isAttachmentSelected = (attachment: Attachment) => {
    return selectedAttachments.some(att => att.dataUrl === attachment.dataUrl);
  };
  
  const openAccordionItems = searchQuery.trim() ? attachmentsBySubject.map(g => g.subject.id) : [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) { setSelectedAttachments([]); setSearchQuery('') } onOpenChange(open);}}>
      <DialogContent className="sm:max-w-2xl grid-rows-[auto_1fr_auto] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Dateien für Beitrag auswählen</DialogTitle>
          <DialogDescription>
            Wähle eine oder mehrere Dateien aus, die du deinem Beitrag anhängen möchtest.
          </DialogDescription>
        </DialogHeader>
        <div className="border-t border-b -mx-6 px-6 py-4 overflow-hidden">
             <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Dateien suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
             </div>
             <ScrollArea className="h-[40vh]">
                 {attachmentsBySubject.length > 0 ? (
                    <Accordion type="multiple" defaultValue={openAccordionItems} className="w-full pr-4">
                        {attachmentsBySubject.map(group => (
                          group.files.length > 0 &&
                            <AccordionItem key={group.subject.id} value={group.subject.id}>
                                <AccordionTrigger>
                                     <div className="flex items-center gap-2">
                                        <Folder className="h-4 w-4" />
                                        <span>{group.subject.name}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                   <ul className="space-y-1">
                                       {group.files.map((file, index) => (
                                           <li key={index} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                                                <Checkbox
                                                    id={`post-file-${group.subject.id}-${index}`}
                                                    checked={isAttachmentSelected(file.attachment)}
                                                    onCheckedChange={(checked) => handleSelectAttachment(file.attachment, !!checked)}
                                                />
                                                <label
                                                  htmlFor={`post-file-${group.subject.id}-${index}`}
                                                  className="flex-1 flex items-center gap-2 text-sm font-medium cursor-pointer"
                                                >
                                                   <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                                   <span className="truncate">{file.attachment.name}</span>
                                                </label>
                                           </li>
                                       ))}
                                   </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center py-10 text-muted-foreground">Keine Dateien mit Anhängen gefunden.</div>
                )}
             </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={handleConfirmSelection} disabled={selectedAttachments.length === 0}>
            {selectedAttachments.length > 0 ? `${selectedAttachments.length} Datei(en) anhängen` : "Anhängen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
