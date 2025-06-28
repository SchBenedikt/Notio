"use client";

import { useState, useMemo, useEffect } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { Subject, Grade, AddSubjectData } from "@/lib/types";
import { AppHeader } from "./header";
import { AddSubjectDialog } from "./add-subject-dialog";
import { SubjectList } from "./subject-list";
import { useToast } from "@/hooks/use-toast";
import { calculateOverallAverage, calculateCategoryAverage } from "@/lib/utils";
import { AppSidebar } from "./app-sidebar";
import { TutorChat } from "./tutor-chat";

export default function Dashboard() {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>("noten-meister-subjects", []);
  const [grades, setGrades] = useLocalStorage<Grade[]>("noten-meister-grades", []);
  const [selectedGradeLevel, setSelectedGradeLevel] = useLocalStorage<number>("noten-meister-grade-level", 10);
  const [mainSubjectWeight, setMainSubjectWeight] = useLocalStorage<number>("noten-meister-main-weight", 2);
  const [minorSubjectWeight, setMinorSubjectWeight] = useLocalStorage<number>("noten-meister-minor-weight", 1);
  const [theme, setTheme] = useLocalStorage<string>("noten-meister-theme", "blue");
  
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<'subjects' | 'tutor'>('subjects');
  const { toast } = useToast();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("theme-zinc", "theme-rose", "theme-green", "theme-violet");

    if (theme !== "blue") {
      root.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  const subjectsForGradeLevel = useMemo(() => {
    return subjects.filter((s) => s.gradeLevel === selectedGradeLevel);
  }, [subjects, selectedGradeLevel]);

  const filteredSubjects = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();

    if (!lowercasedQuery) {
      return subjectsForGradeLevel;
    }

    return subjectsForGradeLevel.filter((subject) => {
      // Check subject name
      if (subject.name.toLowerCase().includes(lowercasedQuery)) {
        return true;
      }

      // Check grades associated with the subject
      const subjectGrades = grades.filter((g) => g.subjectId === subject.id);
      return subjectGrades.some((grade) => {
        const gradeName = grade.name || "";
        const gradeNotes = grade.notes || "";
        const gradeValueStr = String(grade.value);
        
        return (
          gradeName.toLowerCase().includes(lowercasedQuery) ||
          gradeNotes.toLowerCase().includes(lowercasedQuery) ||
          gradeValueStr.includes(lowercasedQuery)
        );
      });
    });
  }, [subjectsForGradeLevel, grades, searchQuery]);


  const gradesForFilteredSubjects = useMemo(() => {
    const filteredSubjectIds = new Set(filteredSubjects.map(s => s.id));
    return grades.filter(g => filteredSubjectIds.has(g.subjectId));
  }, [grades, filteredSubjects]);

  const mainSubjects = useMemo(() => {
    return filteredSubjects
      .filter((s) => s.category === 'Hauptfach')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredSubjects]);

  const minorSubjects = useMemo(() => {
    return filteredSubjects
      .filter((s) => s.category === 'Nebenfach')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredSubjects]);


  const overallAverage = useMemo(() => {
    return calculateOverallAverage(filteredSubjects, grades, mainSubjectWeight, minorSubjectWeight);
  }, [filteredSubjects, grades, mainSubjectWeight, minorSubjectWeight]);

  const mainSubjectsAverage = useMemo(() => {
    return calculateCategoryAverage(mainSubjects, grades);
  }, [mainSubjects, grades]);

  const minorSubjectsAverage = useMemo(() => {
    return calculateCategoryAverage(minorSubjects, grades);
  }, [minorSubjects, grades]);
  
  const writtenGradesCount = useMemo(() => {
    return gradesForFilteredSubjects.filter(g => g.type === 'Schulaufgabe').length;
  }, [gradesForFilteredSubjects]);

  const oralGradesCount = useMemo(() => {
     return gradesForFilteredSubjects.filter(g => g.type === 'mündliche Note').length;
  }, [gradesForFilteredSubjects]);


  const handleAddSubject = (values: AddSubjectData) => {
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      gradeLevel: selectedGradeLevel,
      ...values,
      ...(values.category === 'Hauptfach' && { writtenWeight: 2, oralWeight: 1 }),
    };
    setSubjects([...subjects, newSubject]);
    toast({
      title: "Fach hinzugefügt",
      description: `Das Fach "${newSubject.name}" wurde erfolgreich erstellt.`,
    });
  };

  const handleUpdateSubject = (subjectId: string, updatedValues: Partial<Subject>) => {
    setSubjects(currentSubjects => 
        currentSubjects.map(s => 
            s.id === subjectId ? { ...s, ...updatedValues } : s
        )
    );
    toast({
      title: "Fach aktualisiert",
      description: `Die Einstellungen für das Fach wurden gespeichert.`,
    });
  };

  const handleDeleteSubject = (subjectId: string) => {
    const subjectName = subjects.find(s => s.id === subjectId)?.name || 'Das Fach';
    setSubjects(subjects.filter((s) => s.id !== subjectId));
    setGrades(grades.filter((g) => g.subjectId !== subjectId));
    toast({
      title: "Fach gelöscht",
      description: `${subjectName} und alle zugehörigen Noten wurden gelöscht.`,
      variant: "destructive",
    });
  };

  const handleAddGrade = (subjectId: string, values: AddGradeData) => {
    const newGrade: Grade = {
      id: crypto.randomUUID(),
      subjectId,
      date: new Date().toISOString(),
      ...values,
    };
    setGrades([...grades, newGrade]);
     toast({
      title: "Note hinzugefügt",
      description: `Eine neue Note wurde erfolgreich gespeichert.`,
    });
  };

  const handleDeleteGrade = (gradeId: string) => {
    setGrades(grades.filter((g) => g.id !== gradeId));
     toast({
      title: "Note gelöscht",
      description: `Die ausgewählte Note wurde entfernt.`,
      variant: "destructive",
    });
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AppSidebar 
        subjects={filteredSubjects}
        overallAverage={overallAverage}
        onAddSubject={handleAddSubject}
        onAddGrade={handleAddGrade}
        mainSubjectsAverage={mainSubjectsAverage}
        minorSubjectsAverage={minorSubjectsAverage}
        writtenGradesCount={writtenGradesCount}
        oralGradesCount={oralGradesCount}
        currentView={view}
        onSetView={setView}
      />
      <div className="flex-1 lg:pl-80">
        <AppHeader 
          selectedGradeLevel={selectedGradeLevel}
          onGradeLevelChange={setSelectedGradeLevel}
          onAddSubject={() => setIsAddSubjectOpen(true)}
          overallAverage={overallAverage}
          mainSubjectWeight={mainSubjectWeight}
          onMainSubjectWeightChange={setMainSubjectWeight}
          minorSubjectWeight={minorSubjectWeight}
          onMinorSubjectWeightChange={setMinorSubjectWeight}
          theme={theme}
          onThemeChange={setTheme}
        />
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
          {view === 'subjects' ? (
            <SubjectList
              mainSubjects={mainSubjects}
              minorSubjects={minorSubjects}
              grades={grades}
              onAddGrade={handleAddGrade}
              onDeleteGrade={handleDeleteGrade}
              onDeleteSubject={handleDeleteSubject}
              onUpdateSubject={handleUpdateSubject}
              onAddSubject={() => setIsAddSubjectOpen(true)}
              totalSubjectsCount={subjectsForGradeLevel.length}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          ) : (
            <div className="h-[calc(100vh-10rem)]">
              <TutorChat subjects={subjectsForGradeLevel.map(s => s.name)} />
            </div>
          )}
        </main>
      </div>
      <AddSubjectDialog 
        isOpen={isAddSubjectOpen}
        onOpenChange={setIsAddSubjectOpen}
        onSubmit={handleAddSubject}
      />
    </div>
  );
}
