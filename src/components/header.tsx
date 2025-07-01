"use client";

import { Menu, LogOut, User, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppView } from "@/lib/types";
import { Logo } from "./logo";

type AppHeaderProps = {
  selectedGradeLevel: number;
  onGradeLevelChange: (gradeLevel: number) => void;
  onOpenMobileSidebar: () => void;
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
  currentView: AppView;
};

export function AppHeader({ 
  selectedGradeLevel, 
  onGradeLevelChange, 
  onOpenMobileSidebar,
  onLogout,
  onNavigate,
}: AppHeaderProps) {
  const gradeLevels = Array.from({ length: 8 }, (_, i) => i + 5); // 5 to 12

  return (
    <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onOpenMobileSidebar}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Menü öffnen</span>
          </Button>
          <button onClick={() => onNavigate('dashboard')} aria-label="Zum Dashboard">
            <Logo />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon">
                <SettingsIcon className="h-5 w-5" />
                <span className="sr-only">Menü</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onNavigate('profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate('settings')}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Einstellungen</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Abmelden</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}
