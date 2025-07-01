"use client";

import { Button } from '@/components/ui/button';
import { Separator } from "@/components/ui/separator";
import { Grade, Subject, AppView } from '@/lib/types';
import { Award, BookOpen, PenLine, MessageSquare, LayoutDashboard, MessageCircle, BookCopy, Calculator, Database, Files, BrainCircuit, User, Users, Settings, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ScrollArea } from './ui/scroll-area';

type SidebarContentProps = {
  subjects: Subject[];
  grades: Grade[];
  overallAverage: string;
  mainSubjectsAverage: string;
  minorSubjectsAverage: string;
  writtenGradesCount: number;
  oralGradesCount: number;
  totalSubjectsCount: number;
  totalGradesCount: number;
  currentView: AppView;
  onSetView: (view: AppView) => void;
  onClose?: () => void;
  userName: string | null;
};

export function SidebarContent({ 
  overallAverage, 
  mainSubjectsAverage,
  minorSubjectsAverage,
  writtenGradesCount,
  oralGradesCount,
  totalSubjectsCount,
  totalGradesCount,
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

                    <div className="lg:hidden">
                        <Collapsible defaultOpen={true}>
                            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-2 py-1 font-semibold text-base hover:bg-muted [&[data-state=open]>svg]:rotate-180">
                                <span>Navigation</span>
                                <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                                <div className="flex flex-col gap-1 pt-2">
                                     <Button 
                                        variant={currentView === 'dashboard' ? "secondary" : "ghost"} 
                                        className="justify-start w-full"
                                        onClick={() => handleViewChange('dashboard')}>
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </Button>
                                    <Button 
                                        variant={currentView === 'subjects' ? "secondary" : "ghost"} 
                                        className="justify-start w-full"
                                        onClick={() => handleViewChange('subjects')}>
                                        <BookCopy className="mr-2 h-4 w-4" />
                                        Fächerübersicht
                                    </Button>
                                    <Button 
                                        variant={currentView === 'studysets' ? "secondary" : "ghost"} 
                                        className="justify-start w-full"
                                        onClick={() => handleViewChange('studysets')}>
                                        <BrainCircuit className="mr-2 h-4 w-4" />
                                        Lernsets
                                    </Button>
                                    <Button 
                                        variant={currentView === 'calculator' ? "secondary" : "ghost"} 
                                        className="justify-start w-full"
                                        onClick={() => handleViewChange('calculator')}>
                                        <Calculator className="mr-2 h-4 w-4" />
                                        Notenrechner
                                    </Button>
                                    <Button 
                                        variant={currentView === 'tutor' ? "secondary" : "ghost"} 
                                        className="justify-start w-full"
                                        onClick={() => handleViewChange('tutor')}>
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        KI-Tutor & Coach
                                    </Button>
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
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                    
                    <Collapsible defaultOpen={true}>
                        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-2 py-1 font-semibold text-base hover:bg-muted [&[data-state=open]>svg]:rotate-180">
                            <span>Übersicht</span>
                            <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                            <div className="space-y-6 pt-2">
                                <div className="border bg-card rounded-lg shadow-sm p-4">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-sm font-medium text-muted-foreground">Gesamtschnitt</span>
                                        <span className="text-4xl font-bold text-primary">{overallAverage}</span>
                                    </div>
                                    <Separator className="my-4" />
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-center">
                                        <div>
                                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                                <Award className="h-4 w-4" />
                                                <span>Hauptfächer</span>
                                            </div>
                                            <p className="text-2xl font-bold">{mainSubjectsAverage}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                                <BookOpen className="h-4 w-4" />
                                                <span>Nebenfächer</span>
                                            </div>
                                            <p className="text-2xl font-bold">{minorSubjectsAverage}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                                <PenLine className="h-4 w-4" />
                                                <span>Schriftlich</span>
                                            </div>
                                            <p className="text-2xl font-bold">{writtenGradesCount}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                                <MessageSquare className="h-4 w-4" />
                                                <span>Mündlich</span>
                                            </div>
                                            <p className="text-2xl font-bold">{oralGradesCount}</p>
                                        </div>
                                         <div>
                                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                                <BookCopy className="h-4 w-4" />
                                                <span>Fächer</span>
                                            </div>
                                            <p className="text-2xl font-bold">{totalSubjectsCount}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                                <span>Noten gesamt</span>
                                            </div>
                                            <p className="text-2xl font-bold">{totalGradesCount}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </ScrollArea>
        </>
    );
}
