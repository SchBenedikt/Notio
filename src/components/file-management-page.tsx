"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Grade, Subject, Attachment } from "@/lib/types";
import { File as FileIcon, Folder, Search, Paperclip, ChevronDown, ExternalLink } from "lucide-react";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from './ui/button';

type FileManagementPageProps = {
  subjects: Subject[];
  grades: Grade[];
  onEditGrade: (grade: Grade) => void;
};

export function FileManagementPage({ subjects, grades, onEditGrade }: FileManagementPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const attachmentsBySubject = useMemo(() => {
    const grouped: { [subjectId: string]: { subject: Subject; files: { attachment: Attachment, grade: Grade }[] } } = {};

    grades.forEach(grade => {
      if (grade.attachments && grade.attachments.length > 0) {
        let subject = subjects.find(s => s.id === grade.subjectId);
        if (!subject) return;

        if (!grouped[grade.subjectId]) {
          grouped[grade.subjectId] = {
            subject,
            files: []
          };
        }

        grade.attachments.forEach(attachment => {
          grouped[grade.subjectId].files.push({
            attachment,
            grade,
          });
        });
      }
    });
    
    if (!searchQuery.trim()) {
      return Object.values(grouped);
    }

    const lowercasedQuery = searchQuery.toLowerCase();
    const filteredGroups = Object.values(grouped).map(group => {
        const filteredFiles = group.files.filter(file => 
            file.attachment.name.toLowerCase().includes(lowercasedQuery) ||
            (file.grade.name || file.grade.type).toLowerCase().includes(lowercasedQuery)
        );

        if (group.subject.name.toLowerCase().includes(lowercasedQuery)) {
            return group; // If subject name matches, show all files
        }

        if (filteredFiles.length > 0) {
            return { ...group, files: filteredFiles };
        }
        return null;
    }).filter(group => group !== null) as { subject: Subject; files: { attachment: Attachment; grade: Grade }[] }[];

    return filteredGroups;

  }, [grades, subjects, searchQuery]);

  const totalFiles = useMemo(() => {
      return grades.reduce((sum, grade) => sum + (grade.attachments?.length || 0), 0);
  }, [grades]);
  
  const filteredFileCount = useMemo(() => {
      return attachmentsBySubject.reduce((sum, group) => sum + (group?.files.length || 0), 0);
  },[attachmentsBySubject])


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
         <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full border-8 border-primary/5">
                <Folder className="h-8 w-8 text-primary" />
            </div>
        </div>
        <h1 className="text-3xl font-bold">Dateiverwaltung</h1>
        <p className="text-muted-foreground mt-2">
          Durchsuche und verwalte alle deine hochgeladenen Dateien.
        </p>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Dateien durchsuchen</CardTitle>
              <CardDescription>
                  {searchQuery ? `Zeige ${filteredFileCount} von ${totalFiles} Datei(en)` : `Du hast insgesamt ${totalFiles} Datei${totalFiles !== 1 ? 'en' : ''}.`}
              </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Dateiname, Fach oder Note suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
             </div>
          </CardContent>
      </Card>
      
      {attachmentsBySubject.length > 0 ? (
        <Accordion type="multiple" className="w-full space-y-2">
            {attachmentsBySubject.map(group => (
                <AccordionItem key={group.subject.id} value={group.subject.id} className="border bg-card rounded-lg shadow-sm">
                    <AccordionTrigger className="px-6 py-4 text-lg font-medium hover:no-underline">
                        <div className="flex items-center gap-3">
                            <span>{group.subject.name}</span>
                            <span className="text-sm font-normal px-2 py-0.5 bg-muted rounded-full">{group.files.length}</span>
                        </div>
                        <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                       <ul className="space-y-2">
                           {group.files.map((file, index) => (
                               <li key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted">
                                   <div className="flex items-center gap-3 truncate min-w-0">
                                       <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                                       <div className="truncate">
                                           <a 
                                                href={file.attachment.dataUrl} 
                                                download={file.attachment.name}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-primary hover:underline truncate block"
                                            >
                                                {file.attachment.name}
                                           </a>
                                           <p className="text-xs text-muted-foreground truncate">
                                                Gehört zu: {file.grade.name || file.grade.type} vom {format(new Date(file.grade.date), 'dd.MM.yyyy', { locale: de })}
                                           </p>
                                       </div>
                                   </div>
                                   <div className="flex items-center shrink-0">
                                       <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditGrade(file.grade)} title="Zugehörige Note anzeigen">
                                          <ExternalLink className="h-4 w-4" />
                                       </Button>
                                       <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                           <a href={file.attachment.dataUrl} download={file.attachment.name} target="_blank" rel="noopener noreferrer" title="Datei herunterladen">
                                               <Paperclip className="h-4 w-4" />
                                           </a>
                                       </Button>
                                   </div>
                               </li>
                           ))}
                       </ul>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
      ) : (
          <div className="text-center py-20 flex flex-col items-center justify-center min-h-[30vh] bg-background/50 rounded-lg border border-dashed">
            <h2 className="text-xl font-semibold">{searchQuery ? 'Keine Dateien gefunden' : 'Keine Anhänge vorhanden'}</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              {searchQuery ? `Für deine Suche nach "${searchQuery}" wurden keine Dateien gefunden.` : 'Füge Noten mit Anhängen hinzu, um sie hier zu verwalten.'}
            </p>
          </div>
      )}

    </div>
  );
}
