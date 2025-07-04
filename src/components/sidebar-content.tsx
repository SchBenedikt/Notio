"use client";

import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator";
import { AppView } from '@/lib/types';
import { Award, BookCopy, MessageCircle, LayoutDashboard, Calculator, Database, Files, BrainCircuit, User, Users, Settings, CalendarClock, CalendarDays, Notebook, Activity, ChevronDown } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
                <Accordion type="multiple" defaultValue={['uebersicht', 'lern-tools', 'community', 'verwaltung']} className="w-full px-6 py-4 space-y-1">
                    <AccordionItem value="uebersicht" className="border-none">
                        <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:no-underline rounded-md hover:bg-muted">
                           <span>Übersicht</span>
                           <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-0">
                            <div className="space-y-1">
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
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="lern-tools" className="border-none">
                        <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:no-underline rounded-md hover:bg-muted">
                            <span>Lern-Tools</span>
                           <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-0">
                            <div className="space-y-1">
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
                                    Assistant
                                </Button>
                                <Button 
                                    variant={currentView === 'calculator' ? "secondary" : "ghost"} 
                                    className="justify-start w-full"
                                    onClick={() => handleViewChange('calculator')}>
                                    <Calculator className="mr-2 h-4 w-4" />
                                    Notenrechner
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="community" className="border-none">
                        <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:no-underline rounded-md hover:bg-muted">
                            <span>Community</span>
                           <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-0">
                             <div className="space-y-1">
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
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="verwaltung" className="border-none">
                        <AccordionTrigger className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:no-underline rounded-md hover:bg-muted">
                            <span>Verwaltung</span>
                           <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-0">
                            <div className="space-y-1">
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
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </ScrollArea>
        </>
    );
}
