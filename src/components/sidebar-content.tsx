"use client";

import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator";
import { AppView } from '@/lib/types';
import { Award, BookCopy, MessageCircle, LayoutDashboard, Calculator, Database, Files, BrainCircuit, User, Users, Settings, CalendarClock, CalendarDays, Notebook, Activity } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

type SidebarContentProps = {
  currentView: AppView;
  onSetView: (view: AppView) => void;
  onClose?: () => void;
  userName: string | null;
};

export function SidebarContent({ 
  currentView,
  onSetView,
  onClose,
  userName,
}: SidebarContentProps) {

    const handleViewChange = (view: AppView) => {
        onSetView(view);
        if (onClose) onClose();
    }

    return (
        <>
            <div className="flex flex-col gap-1 px-2">
                <Button 
                    variant={currentView === 'profile' ? "secondary" : "ghost"} 
                    className="justify-start w-full h-11 text-base font-semibold"
                    onClick={() => handleViewChange('profile')}>
                     <User className="mr-2 h-5 w-5" />
                    {userName || 'Dein Profil'}
                </Button>
            </div>

            <Separator />
            
            <ScrollArea className="flex-1 -mx-6">
                <div className="px-6 space-y-4 py-4">
                    <div className="space-y-1">
                        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Übersicht</p>
                        <Button 
                            variant={currentView === 'dashboard' ? "secondary" : "ghost"} 
                            className="justify-start w-full"
                            onClick={() => handleViewChange('dashboard')}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                        <Button 
                            variant={currentView === 'activity' ? "secondary" : "ghost"} 
                            className="justify-start w-full"
                            onClick={() => handleViewChange('activity')}>
                            <Activity className="mr-2 h-4 w-4" />
                            Aktivität
                        </Button>
                        <Button 
                            variant={currentView === 'subjects' ? "secondary" : "ghost"} 
                            className="justify-start w-full"
                            onClick={() => handleViewChange('subjects')}>
                            <BookCopy className="mr-2 h-4 w-4" />
                            Fächerübersicht
                        </Button>
                        <Button 
                            variant={currentView === 'planner' ? "secondary" : "ghost"} 
                            className="justify-start w-full"
                            onClick={() => handleViewChange('planner')}>
                            <CalendarClock className="mr-2 h-4 w-4" />
                            Planer
                        </Button>
                        <Button 
                            variant={currentView === 'school-calendar' ? "secondary" : "ghost"} 
                            className="justify-start w-full"
                            onClick={() => handleViewChange('school-calendar')}>
                            <CalendarDays className="mr-2 h-4 w-4" />
                            Schulkalender
                        </Button>
                    </div>
                     <Separator className="my-2" />
                    <div className="space-y-1">
                         <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lern-Tools</p>
                         <Button 
                            variant={currentView === 'lernzettel' ? "secondary" : "ghost"} 
                            className="justify-start w-full"
                            onClick={() => handleViewChange('lernzettel')}>
                            <Notebook className="mr-2 h-4 w-4" />
                            Lernzettel
                        </Button>
                        <Button 
                            variant={currentView === 'studysets' ? "secondary" : "ghost"} 
                            className="justify-start w-full"
                            onClick={() => handleViewChange('studysets')}>
                            <BrainCircuit className="mr-2 h-4 w-4" />
                            Lernsets
                        </Button>
                        <Button 
                            variant={currentView === 'tutor' ? "secondary" : "ghost"} 
                            className="justify-start w-full"
                            onClick={() => handleViewChange('tutor')}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            KI-Tutor & Coach
                        </Button>
                         <Button 
                            variant={currentView === 'calculator' ? "secondary" : "ghost"} 
                            className="justify-start w-full"
                            onClick={() => handleViewChange('calculator')}>
                            <Calculator className="mr-2 h-4 w-4" />
                            Notenrechner
                        </Button>
                    </div>
                     <Separator className="my-2" />
                    <div className="space-y-1">
                        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Community</p>
                        <Button 
                            variant={currentView === 'community' ? "secondary" : "ghost"} 
                            className="justify-start w-full"
                            onClick={() => handleViewChange('community')}>
                            <Users className="mr-2 h-4 w-4" />
                            Community
                        </Button>
                        <Button 
                            variant={currentView === 'awards' ? "secondary" : "ghost"} 
                            className="justify-start w-full"
                            onClick={() => handleViewChange('awards')}>
                            <Award className="mr-2 h-4 w-4" />
                            Auszeichnungen
                        </Button>
                    </div>
                     <Separator className="my-2" />
                     <div className="space-y-1">
                        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verwaltung</p>
                        <Button 
                            variant={currentView === 'files' ? "secondary" : "ghost"} 
                            className="justify-start w-full"
                            onClick={() => handleViewChange('files')}>
                            <Files className="mr-2 h-4 w-4" />
                            Dateiverwaltung
                        </Button>
                        <Button 
                            variant={currentView === 'data' ? "secondary" : "ghost"} 
                            className="justify-start w-full"
                            onClick={() => handleViewChange('data')}>
                            <Database className="mr-2 h-4 w-4" />
                            Datenverwaltung
                        </Button>
                        <Button 
                            variant={currentView === 'settings' ? "secondary" : "ghost"} 
                            className="justify-start w-full"
                            onClick={() => handleViewChange('settings')}>
                            <Settings className="mr-2 h-4 w-4" />
                            Einstellungen
                        </Button>
                    </div>
                </div>
            </ScrollArea>
        </>
    );
}
