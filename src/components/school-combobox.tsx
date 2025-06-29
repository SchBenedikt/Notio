"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { School } from "@/lib/types"

interface SchoolComboboxProps {
  schools: School[];
  value: string; // schoolId
  onChange: (value: string) => void;
  onAddSchool: (name: string, address: string) => Promise<string>;
}

export function SchoolCombobox({ schools, value, onChange, onAddSchool }: SchoolComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [isAddSchoolDialogOpen, setAddSchoolDialogOpen] = React.useState(false)
  const [newSchoolName, setNewSchoolName] = React.useState("")
  const [newSchoolAddress, setNewSchoolAddress] = React.useState("")
  const [isAdding, setIsAdding] = React.useState(false)

  const handleAddSchool = async () => {
    if (!newSchoolName.trim() || isAdding) return;
    setIsAdding(true);
    try {
        const newSchoolId = await onAddSchool(newSchoolName, newSchoolAddress);
        onChange(newSchoolId);
        setAddSchoolDialogOpen(false);
        setNewSchoolName("");
        setNewSchoolAddress("");
    } finally {
        setIsAdding(false);
    }
  }

  const selectedSchool = schools.find((school) => school.id === value)

  return (
    <>
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between flex-1"
            >
              <span className="truncate">
                {selectedSchool
                  ? selectedSchool.name
                  : "Schule auswählen..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Schule suchen..." />
              <CommandList>
                <CommandEmpty>Keine Schule gefunden.</CommandEmpty>
                <CommandGroup>
                  {schools.map((school) => (
                    <CommandItem
                      key={school.id}
                      value={school.name} // Value for searching
                      onSelect={() => {
                        onChange(school.id)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === school.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {school.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setAddSchoolDialogOpen(true)}
            aria-label="Neue Schule hinzufügen"
        >
            <PlusCircle className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isAddSchoolDialogOpen} onOpenChange={setAddSchoolDialogOpen}>
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
                <Button type="button" variant="ghost" onClick={() => setAddSchoolDialogOpen(false)} disabled={isAdding}>Abbrechen</Button>
                <Button type="button" onClick={handleAddSchool} disabled={isAdding || !newSchoolName.trim()}>
                    {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Schule speichern
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
