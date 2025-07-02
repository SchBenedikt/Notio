"use client";

import { useState, useMemo, ChangeEvent, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileSystemItem } from "@/lib/types";
import { Folder, File as FileIcon, Upload, Plus, MoreHorizontal, Trash2, Download, Home, ChevronRight, Loader2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

type FileManagementPageProps = {
  files: FileSystemItem[];
  onCreateFolder: (folderName: string, parentId: string | null) => Promise<void>;
  onUploadFiles: (files: FileList, parentId: string | null) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export function FileManagementPage({ files, onCreateFolder, onUploadFiles, onDeleteItem }: FileManagementPageProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isCreateFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const breadcrumbs = useMemo(() => {
    const path = [];
    let currentId: string | null = currentFolderId;
    while (currentId) {
        const folder = files.find(f => f.id === currentId && f.type === 'folder');
        if (folder) {
            path.unshift(folder);
            currentId = folder.parentId;
        } else {
            break;
        }
    }
    return path;
  }, [currentFolderId, files]);
  
  const itemsInCurrentFolder = useMemo(() => {
    return files
        .filter(item => item.parentId === currentFolderId)
        .sort((a,b) => {
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;
            return a.name.localeCompare(b.name);
        });
  }, [files, currentFolderId]);
  
  const handleCreateFolderClick = async () => {
    if (!newFolderName.trim()) {
        toast({ title: "Ordnername darf nicht leer sein", variant: "destructive" });
        return;
    }
    await onCreateFolder(newFolderName, currentFolderId);
    setCreateFolderOpen(false);
    setNewFolderName("");
  };

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    setIsUploading(true);
    await onUploadFiles(selectedFiles, currentFolderId);
    setIsUploading(false);
    if(fileInputRef.current) fileInputRef.current.value = ""; // Reset input
  };
  
  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} onChange={handleFileSelected} multiple className="hidden" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Dateiverwaltung</h1>
          <p className="text-muted-foreground">
            Verwalte und organisiere deine Lernmaterialien.
          </p>
        </div>
        <div className='flex items-center gap-2'>
            <Button onClick={() => setCreateFolderOpen(true)} variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Neuer Ordner
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Hochladen
            </Button>
        </div>
      </div>
      
      <div className="border rounded-lg bg-card shadow-sm">
        <div className="p-4 border-b">
            <div className="flex items-center gap-1.5 text-sm">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentFolderId(null)}><Home className="h-4 w-4" /></Button>
                {breadcrumbs.map(folder => (
                    <div key={folder.id} className="flex items-center gap-1.5">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <Button variant="ghost" className="h-7 px-2" onClick={() => setCurrentFolderId(folder.id)}>{folder.name}</Button>
                    </div>
                ))}
            </div>
        </div>
        <ScrollArea className="h-[calc(100vh-350px)]">
            {itemsInCurrentFolder.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden sm:table-cell">Typ</TableHead>
                            <TableHead className="hidden md:table-cell">Größe</TableHead>
                            <TableHead className="hidden md:table-cell">Erstellt</TableHead>
                            <TableHead><span className="sr-only">Aktionen</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {itemsInCurrentFolder.map(item => (
                            <TableRow key={item.id} onDoubleClick={() => item.type === 'folder' && setCurrentFolderId(item.id)} className={cn(item.type === 'folder' && 'cursor-pointer')}>
                                <TableCell className="font-medium">
                                    <button onClick={() => item.type === 'folder' && setCurrentFolderId(item.id)} className="flex items-center gap-2 w-full text-left">
                                        {item.type === 'folder' ? <Folder className="h-4 w-4 text-yellow-500" /> : <FileIcon className="h-4 w-4 text-muted-foreground" />}
                                        <span className='truncate'>{item.name}</span>
                                    </button>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">{item.type === 'folder' ? 'Ordner' : 'Datei'}</TableCell>
                                <TableCell className="hidden md:table-cell">{item.type === 'file' && item.size ? formatBytes(item.size) : '-'}</TableCell>
                                <TableCell className="hidden md:table-cell">{formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true, locale: de })}</TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {item.type === 'file' && <DropdownMenuItem asChild><a href={item.dataUrl} download={item.name}><Download className="mr-2 h-4 w-4" />Herunterladen</a></DropdownMenuItem>}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Löschen</DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Wirklich löschen?</AlertDialogTitle><AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden. Wenn du einen Ordner löschst, wird sein gesamter Inhalt ebenfalls entfernt.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => onDeleteItem(item.id)} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
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
            ) : (
                 <div className="text-center py-20">
                    <p className="text-muted-foreground">Dieser Ordner ist leer.</p>
                </div>
            )}
        </ScrollArea>
      </div>

       <AlertDialog open={isCreateFolderOpen} onOpenChange={setCreateFolderOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Neuen Ordner erstellen</AlertDialogTitle>
                    <AlertDialogDescription>Gib einen Namen für den neuen Ordner ein.</AlertDialogDescription>
                </AlertDialogHeader>
                <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Ordnername" onKeyDown={(e) => e.key === 'Enter' && handleCreateFolderClick()} />
                <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCreateFolderClick}>Erstellen</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}