"use client";

import { PlusCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type AppHeaderProps = {
  selectedGradeLevel: number;
  onGradeLevelChange: (gradeLevel: number) => void;
  onAddSubject: () => void;
  overallAverage: string;
  mainSubjectWeight: number;
  onMainSubjectWeightChange: (weight: number) => void;
  minorSubjectWeight: number;
  onMinorSubjectWeightChange: (weight: number) => void;
};

export function AppHeader({ 
  selectedGradeLevel, 
  onGradeLevelChange, 
  onAddSubject,
  overallAverage,
  mainSubjectWeight,
  onMainSubjectWeightChange,
  minorSubjectWeight,
  onMinorSubjectWeightChange
}: AppHeaderProps) {
  const gradeLevels = Array.from({ length: 8 }, (_, i) => i + 5); // 5 to 12

  const handleWeightChange = (setter: (weight: number) => void, value: string) => {
    const num = Number(value);
    if (!isNaN(num) && num >= 0) {
      setter(num);
    }
  };

  return (
    <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <h1 className="text-xl font-bold text-primary sm:text-2xl font-headline truncate">Noten Meister</h1>
          {overallAverage !== '-' && (
            <div className="flex items-baseline gap-2 bg-primary/10 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-primary/80 hidden sm:inline">Schnitt:</span>
              <span className="text-xl font-bold text-primary">{overallAverage}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Stufe:</span>
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
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 flex-shrink-0">
                <Settings className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Gewichtung</h4>
                  <p className="text-sm text-muted-foreground">
                    Passe die Gewichtung für Haupt- und Nebenfächer an.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="main-weight">Hauptfach</Label>
                    <Input
                      id="main-weight"
                      type="number"
                      min="0"
                      step="0.5"
                      value={mainSubjectWeight}
                      onChange={(e) => handleWeightChange(onMainSubjectWeightChange, e.target.value)}
                      className="col-span-2 h-8"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label htmlFor="minor-weight">Nebenfach</Label>
                    <Input
                      id="minor-weight"
                      type="number"
                      min="0"
                      step="0.5"
                      value={minorSubjectWeight}
                      onChange={(e) => handleWeightChange(onMinorSubjectWeightChange, e.target.value)}
                      className="col-span-2 h-8"
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={onAddSubject} className="bg-accent hover:bg-accent/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Neues Fach</span>
            <span className="sm:hidden">Fach</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
