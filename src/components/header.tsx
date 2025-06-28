"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AppHeaderProps = {
  selectedGradeLevel: number;
  onGradeLevelChange: (gradeLevel: number) => void;
  onAddSubject: () => void;
};

export function AppHeader({ selectedGradeLevel, onGradeLevelChange, onAddSubject }: AppHeaderProps) {
  const gradeLevels = Array.from({ length: 8 }, (_, i) => i + 5); // 5 to 12

  return (
    <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <h1 className="text-xl font-bold text-primary sm:text-2xl font-headline">Noten Meister</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Jahrgangsstufe:</span>
            <Select
              value={String(selectedGradeLevel)}
              onValueChange={(value) => onGradeLevelChange(Number(value))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="Stufe" />
              </SelectTrigger>
              <SelectContent>
                {gradeLevels.map((level) => (
                  <SelectItem key={level} value={String(level)}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onAddSubject} className="bg-accent hover:bg-accent/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Neues Fach
          </Button>
        </div>
      </div>
    </header>
  );
}
