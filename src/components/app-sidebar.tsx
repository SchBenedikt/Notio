"use client";

import type { Subject, Grade, AppView } from '@/lib/types';
import { SidebarContent } from './sidebar-content';

type AppSidebarProps = {
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
  userName: string | null;
};

export function AppSidebar(props: AppSidebarProps) {
    return (
        <aside className="hidden lg:flex flex-col gap-4 w-80 bg-background border-r fixed top-0 left-0 h-screen p-6">
            <SidebarContent {...props} />
        </aside>
    );
}
