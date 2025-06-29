"use client";

import type { Subject, AddSubjectData, AddGradeData, Grade } from '@/lib/types';
import { SidebarContent } from './sidebar-content';

type AppSidebarProps = {
  subjects: Subject[];
  grades: Grade[];
  overallAverage: string;
  onAddSubject: (values: AddSubjectData) => void;
  onAddGrade: (subjectId: string, values: Omit<AddGradeData, 'subjectId'>) => void;
  mainSubjectsAverage: string;
  minorSubjectsAverage: string;
  writtenGradesCount: number;
  oralGradesCount: number;
  totalSubjectsCount: number;
  totalGradesCount: number;
  currentView: 'subjects' | 'tutor' | 'calculator' | 'data' | 'files' | 'awards' | 'coach';
  onSetView: (view: 'subjects' | 'tutor' | 'calculator' | 'data' | 'files' | 'awards' | 'coach') => void;
};

export function AppSidebar(props: AppSidebarProps) {
    return (
        <aside className="hidden lg:flex flex-col gap-4 w-80 bg-background border-r fixed top-0 left-0 h-screen p-6">
            <SidebarContent {...props} />
        </aside>
    );
}
