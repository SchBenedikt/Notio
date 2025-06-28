"use client";

import { Settings, Check, Menu } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";

type AppHeaderProps = {
  selectedGradeLevel: number;
  onGradeLevelChange: (gradeLevel: number) => void;
  onAddSubject: () => void;
  onOpenMobileSidebar: () => void;
  overallAverage: string;
  mainSubjectWeight: number;
  onMainSubjectWeightChange: (weight: number) => void;
  minorSubjectWeight: number;
  onMinorSubjectWeightChange: (weight: number) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  isDarkMode: boolean;
  onIsDarkModeChange: (isDark: boolean) => void;
};

export function AppHeader({ 
  selectedGradeLevel, 
  onGradeLevelChange, 
  onAddSubject,
  onOpenMobileSidebar,
  overallAverage,
  mainSubjectWeight,
  onMainSubjectWeightChange,
  minorSubjectWeight,
  onMinorSubjectWeightChange,
  theme,
  onThemeChange,
  isDarkMode,
  onIsDarkModeChange
}: AppHeaderProps) {
  const gradeLevels = Array.from({ length: 8 }, (_, i) => i + 5); // 5 to 12

  const themes = [
    { name: "blue", label: "Blau", color: "hsl(217.2 91.2% 59.8%)" },
    { name: "green", label: "Grün", color: "hsl(142.1 76.2% 36.3%)" },
    { name: "violet", label: "Violett", color: "hsl(262.1 83.3% 57.8%)" },
    { name: "orange", label: "Orange", color: "hsl(25 95% 53%)" },
    { name: "rose", label: "Rose", color: "hsl(346.8 77.2% 49.8%)" },
    { name: "yellow", label: "Gelb", color: "hsl(48 96% 53%)" },
    { name: "zinc", label: "Zink", color: "hsl(240 5.2% 33.9%)" },
    { name: "slate", label: "Schiefer", color: "hsl(215 39% 35%)" },
  ];

  const handleWeightChange = (setter: (weight: number) => void, value: string) => {
    const num = Number(value);
    if (!isNaN(num) && num >= 0) {
      setter(num);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onOpenMobileSidebar}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Menü öffnen</span>
          </Button>
          <h1 className="text-2xl font-bold text-foreground lg:hidden">Noten Meister</h1>
          {overallAverage !== '-' && (
            <div className="flex sm:hidden items-baseline gap-2 border-l pl-2 sm:pl-4">
              <span className="text-sm font-medium text-muted-foreground">Schnitt</span>
              <span className="text-2xl font-bold text-primary">{overallAverage}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Select
            value={String(selectedGradeLevel)}
            onValueChange={(value) => onGradeLevelChange(Number(value))}
          >
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Klasse" />
            </SelectTrigger>
            <SelectContent>
              {gradeLevels.map((level) => (
                <SelectItem key={level} value={String(level)}>
                  Klasse {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Einstellungen</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Allgemeine Gewichtung</h4>
                  <p className="text-sm text-muted-foreground">
                    Passe die globale Gewichtung für Haupt- und Nebenfächer an.
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
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Erscheinungsbild</h4>
                  <p className="text-sm text-muted-foreground">
                    Passe das Farbschema und den Dark Mode an.
                  </p>
                </div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                  {themes.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => onThemeChange(t.name)}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 flex items-center justify-center",
                        theme === t.name ? "border-ring" : "border-transparent"
                      )}
                      style={{ backgroundColor: t.color }}
                      aria-label={`Farbe ${t.label} auswählen`}
                    >
                      {theme === t.name && <Check className="h-4 w-4 text-primary-foreground" />}
                    </button>
                  ))}
                </div>
                 <div className="flex items-center justify-between pt-2">
                    <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                        <span>Dark Mode</span>
                    </Label>
                    <Switch
                        id="dark-mode"
                        checked={isDarkMode}
                        onCheckedChange={onIsDarkModeChange}
                    />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
