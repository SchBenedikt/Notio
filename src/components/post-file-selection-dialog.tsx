"use client";

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSystemItem, Attachment } from "@/lib/types";
import { File as FileIcon, Search, Folder, Home, ChevronRight } from "lucide-react";
import { cn } from '@/lib/utils';

type PostFileSelectionDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onFilesSelected: (files: Attachment[]) => void;
  userFiles: FileSystemItem[];
};

export function PostFileSelectionDialog({ isOpen, onOpenChange, onFilesSelected, userFiles }: PostFileSelectionDialogProps) {
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const browsableFiles = useMemo(() => userFiles.filter(f => !f.isReadOnly), [userFiles]);

  const breadcrumbs = useMemo(() => {
    const path: FileSystemItem[] = [];
    let currentId: string | null = currentFolderId;
    while (currentId) {
        const folder = browsableFiles.find(f => f.id === currentId && f.type === 'folder');
        if (folder) {
            path.unshift(folder);
            currentId = folder.parentId;
        } else {
            break;
        }
    }
    return path;
  }, [currentFolderId, browsableFiles]);
  
  const itemsInCurrentFolder = useMemo(() => {
    const items = browsableFiles
        .filter(item => item.parentId === currentFolderId)
        .sort((a,b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
    if (!searchQuery.trim()) return items;
    return items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  }, [browsableFiles, currentFolderId, searchQuery]);

  const handleSelectAttachment = (item: FileSystemItem, isSelected: boolean) => {
    if (item.type !== 'file' || !item.dataUrl) return;
    const attachment = { name: item.name, dataUrl: item.dataUrl };
    if (isSelected) {
      setSelectedAttachments(prev => [...prev, attachment]);
    } else {
      setSelectedAttachments(prev => prev.filter(att => att.dataUrl !== attachment.dataUrl));
    }
  };

  const handleConfirmSelection = () => {
    onFilesSelected(selectedAttachments);
    onOpenChange(false);
  };

  const isAttachmentSelected = (item: FileSystemItem) => {
    return selectedAttachments.some(att => att.dataUrl === item.dataUrl);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) { setSelectedAttachments([]); setSearchQuery('') } onOpenChange(open);}}>
      <DialogContent className="sm:max-w-2xl grid-rows-[auto_1fr_auto] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Dateien für Beitrag auswählen</DialogTitle>
          <DialogDescription>
            Wähle eine oder mehrere Dateien aus, die du deinem Beitrag anhängen möchtest.
          </DialogDescription>
        </DialogHeader>
        <div className="border-t border-b -mx-6 px-6 py-4 overflow-hidden flex flex-col">
            <div className="flex items-center gap-1.5 text-sm mb-4">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentFolderId(null)}><Home className="h-4 w-4" /></Button>
                {breadcrumbs.map(folder => (
                    <div key={folder.id} className="flex items-center gap-1.5">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <Button variant="ghost" className="h-7 px-2" onClick={() => setCurrentFolderId(folder.id)}>{folder.name}</Button>
                    </div>
                ))}
            </div>
             <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
             </div>
             <ScrollArea className="h-[40vh] -mr-6 pr-6">
                 {itemsInCurrentFolder.length > 0 ? (
                    <ul className="space-y-1">
                        {itemsInCurrentFolder.map((item) => (
                           <li key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                               <Checkbox
                                   id={`post-file-${item.id}`}
                                   checked={isAttachmentSelected(item)}
                                   onCheckedChange={(checked) => handleSelectAttachment(item, !!checked)}
                                   disabled={item.type === 'folder'}
                               />
                               <label
                                 htmlFor={`post-file-${item.id}`}
                                 className={cn(
                                     "flex-1 flex items-center gap-2 text-sm font-medium",
                                     item.type === 'folder' ? 'cursor-pointer' : 'cursor-default'
                                 )}
                                 onClick={() => item.type === 'folder' && setCurrentFolderId(item.id)}
                               >
                                  {item.type === 'folder' ? <Folder className="h-4 w-4 text-yellow-500 shrink-0" /> : <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />}
                                  <span className="truncate">{item.name}</span>
                               </label>
                          </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10 text-muted-foreground">Keine Dateien gefunden.</div>
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
