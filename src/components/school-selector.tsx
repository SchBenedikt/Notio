"use client"

import * as React from "react"
import { Loader2, PlusCircle, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { School } from "@/lib/types"
import { ScrollArea } from "./ui/scroll-area"

// --- Add School Dialog ---
// This component is nested inside the SelectSchoolDialog.
function AddSchoolDialog({ onAddSchool, onOpenChange }: { onAddSchool: (name: string, address: string) => Promise<string>, onOpenChange: (open: boolean) => void }) {
  const [newSchoolName, setNewSchoolName] = React.useState("")
  const [newSchoolAddress, setNewSchoolAddress] = React.useState("")
  const [isAdding, setIsAdding] = React.useState(false)

  const handleAddSchool = async () => {
    if (!newSchoolName.trim() || isAdding) return;
    setIsAdding(true);
    try {
        // This onAddSchool function comes from the parent (SelectSchoolDialog)
        // and is designed to close the parent dialog as well.
        await onAddSchool(newSchoolName, newSchoolAddress);
        // The parent handler will close this dialog.
    } finally {
        setIsAdding(false);
    }
  }

  return (
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Neue Schule hinzufügen</DialogTitle>
            <DialogDescription>
                Wenn deine Schule nicht in der Liste ist, kannst du sie hier erstellen.
            </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="school-name" className="text-right">Name</Label>
                <Input id="school-name" value={newSchoolName} onChange={(e) => setNewSchoolName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="school-address" className="text-right">Adresse</Label>
                <Input id="school-address" value={newSchoolAddress} onChange={(e) => setNewSchoolAddress(e.target.value)} className="col-span-3" placeholder="(Optional)" />
            </div>
        </div>
        <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isAdding}>Abbrechen</Button>
            <Button type="button" onClick={handleAddSchool} disabled={isAdding || !newSchoolName.trim()}>
                {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Schule speichern
            </Button>
        </DialogFooter>
    </DialogContent>
  )
}

// --- Select School Dialog ---
// This is the main dialog that opens when the user clicks "Ändern".
function SelectSchoolDialog({ schools, onSelect, onAddSchool, onOpenChange }: { schools: School[], onSelect: (id: string) => void, onAddSchool: (name: string, address: string) => Promise<string>, onOpenChange: (open: boolean) => void }) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [isAddSchoolOpen, setAddSchoolOpen] = React.useState(false);

    const filteredSchools = schools.filter(school => school.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleSelectSchool = (id: string) => {
        onSelect(id);
        onOpenChange(false); // Close this main selection dialog
    }

    const handleAddNewSchool = async (name: string, address: string) => {
        const newId = await onAddSchool(name, address);
        onSelect(newId); // auto-select the new school
        onOpenChange(false); // close the main dialog
        return newId;
    }

    return (
        <DialogContent className="sm:max-w-md grid-rows-[auto_1fr_auto] max-h-[70vh]">
            <DialogHeader>
                <DialogTitle>Schule auswählen</DialogTitle>
            </DialogHeader>
            <div className="border-t border-b -mx-6 px-6 py-4 overflow-hidden flex flex-col">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Schule suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <ScrollArea className="flex-1 -mr-6 pr-6">
                    <div className="space-y-1">
                        {filteredSchools.map(school => (
                            <Button 
                                key={school.id} 
                                variant="ghost" 
                                className="w-full justify-start"
                                onClick={() => handleSelectSchool(school.id)}
                            >
                                {school.name}
                            </Button>
                        ))}
                         {filteredSchools.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-4">Keine Schule gefunden.</p>
                         )}
                    </div>
                </ScrollArea>
            </div>
            <DialogFooter className="pt-0 justify-between">
                <Dialog open={isAddSchoolOpen} onOpenChange={setAddSchoolOpen}>
                    <DialogTrigger asChild>
                         <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4"/> Neue Schule</Button>
                    </DialogTrigger>
                    {/* Pass the special handler that closes both dialogs */}
                    <AddSchoolDialog onAddSchool={handleAddNewSchool} onOpenChange={setAddSchoolOpen} />
                </Dialog>
                <Button variant="secondary" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            </DialogFooter>
        </DialogContent>
    );
}

// --- Main Exported Component ---
interface SchoolSelectorProps {
  schools: School[];
  value: string; // schoolId
  onChange: (value: string) => void;
  onAddSchool: (name: string, address: string) => Promise<string>;
}

export function SchoolSelector({ schools, value, onChange, onAddSchool }: SchoolSelectorProps) {
  const [isSelectSchoolOpen, setSelectSchoolOpen] = React.useState(false);
  const selectedSchool = schools.find((school) => school.id === value)

  return (
    <div className="p-3 border rounded-md flex items-center justify-between">
      <div className="flex-1 truncate">
        <p className="text-xs text-muted-foreground">Ausgewählte Schule</p>
        <p className="font-medium truncate pr-2">
            {selectedSchool ? selectedSchool.name : "Keine Schule ausgewählt"}
        </p>
      </div>
      <Dialog open={isSelectSchoolOpen} onOpenChange={setSelectSchoolOpen}>
        <DialogTrigger asChild>
            <Button variant="outline">Ändern</Button>
        </DialogTrigger>
        <SelectSchoolDialog 
            schools={schools}
            onSelect={onChange}
            onAddSchool={onAddSchool}
            onOpenChange={setSelectSchoolOpen}
        />
      </Dialog>
    </div>
  )
}