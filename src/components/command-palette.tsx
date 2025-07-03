"use client";

import * as React from "react";
import {
  BookCopy,
  Calculator,
  Download,
  LayoutDashboard,
  ListPlus,
  MessageCircle,
  Upload,
  BrainCircuit,
  Files,
  Award,
  User,
  Users,
  Settings,
  CalendarClock,
  CalendarDays,
  Notebook,
  Activity,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandTitle,
  CommandDescription
} from "@/components/ui/command";
import { Subject } from "@/lib/types";

interface CommandPaletteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  onNavigate: (view: "dashboard" | "subjects" | "tutor" | "calculator" | "data" | "files" | "awards" | "profile" | "community" | "settings" | "studysets" | "planner" | "school-calendar" | "lernzettel" | "activity") => void;
  onAddSubject: () => void;
  onAddGrade: (subjectId: string) => void;
  onExport: () => void;
  onImport: () => void;
}

export function CommandPalette({
  isOpen,
  onOpenChange,
  subjects,
  onNavigate,
  onAddSubject,
  onAddGrade,
  onExport,
  onImport,
}: CommandPaletteProps) {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!isOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenChange, isOpen]);

  const runCommand = (command: () => unknown) => {
    onOpenChange(false);
    command();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
        <CommandInput placeholder="Befehl oder Suche eingeben..." />
        <CommandList>
            <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>
            <CommandGroup heading="Navigation">
                <CommandItem onSelect={() => runCommand(() => onNavigate("dashboard"))}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => onNavigate("activity"))}>
                    <Activity className="mr-2 h-4 w-4" />
                    <span>Aktivität</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => onNavigate("subjects"))}>
                    <BookCopy className="mr-2 h-4 w-4" />
                    <span>Fächerübersicht</span>
                </CommandItem>
                 <CommandItem onSelect={() => runCommand(() => onNavigate("planner"))}>
                    <CalendarClock className="mr-2 h-4 w-4" />
                    <span>Planer</span>
                </CommandItem>
                 <CommandItem onSelect={() => runCommand(() => onNavigate("school-calendar"))}>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    <span>Schulkalender</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => onNavigate("lernzettel"))}>
                    <Notebook className="mr-2 h-4 w-4" />
                    <span>Lernzettel</span>
                </CommandItem>
                 <CommandItem onSelect={() => runCommand(() => onNavigate("studysets"))}>
                    <BrainCircuit className="mr-2 h-4 w-4" />
                    <span>Lernsets</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => onNavigate("calculator"))}>
                    <Calculator className="mr-2 h-4 w-4" />
                    <span>Notenrechner</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => onNavigate("tutor"))}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>KI-Tutor & Coach</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => onNavigate("community"))}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Community</span>
                </CommandItem>
                 <CommandItem onSelect={() => runCommand(() => onNavigate("awards"))}>
                    <Award className="mr-2 h-4 w-4" />
                    <span>Auszeichnungen</span>
                </CommandItem>
                 <CommandItem onSelect={() => runCommand(() => onNavigate("profile"))}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                </CommandItem>
                 <CommandItem onSelect={() => runCommand(() => onNavigate("settings"))}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Einstellungen</span>
                </CommandItem>
                 <CommandItem onSelect={() => runCommand(() => onNavigate("files"))}>
                    <Files className="mr-2 h-4 w-4" />
                    <span>Dateiverwaltung</span>
                </CommandItem>
                 <CommandItem onSelect={() => runCommand(() => onNavigate("data"))}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Datenverwaltung</span>
                </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Daten">
            <CommandItem onSelect={() => runCommand(onImport)}>
                <Upload className="mr-2 h-4 w-4" />
                <span>Noten aus CSV importieren</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(onExport)}>
                <Download className="mr-2 h-4 w-4" />
                <span>Noten als CSV exportieren</span>
            </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Schnellerfassung">
            <CommandItem onSelect={() => runCommand(onAddSubject)}>
                <BookCopy className="mr-2 h-4 w-4" />
                <span>Neues Fach hinzufügen</span>
            </CommandItem>
            {subjects.map((subject) => (
                <CommandItem
                key={subject.id}
                value={`Note zu ${subject.name} hinzufügen`}
                onSelect={() => runCommand(() => onAddGrade(subject.id))}
                >
                <ListPlus className="mr-2 h-4 w-4" />
                <span>Neue Note für "{subject.name}"</span>
                </CommandItem>
            ))}
            </CommandGroup>
        </CommandList>
    </CommandDialog>
  );
}
