"use client";

import { useState, useMemo, useEffect } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { Subject, Grade, AddSubjectData, AddGradeData } from "@/lib/types";
import { AppHeader } from "./header";
import { AddSubjectDialog } from "./add-subject-dialog";
import { SubjectList } from "./subject-list";
import { useToast } from "@/hooks/use-toast";
import { calculateOverallAverage, calculateCategoryAverage, generateCSV, importDataFromCSV } from "@/lib/utils";
import { AppSidebar } from "./app-sidebar";
import { TutorChat } from "./tutor-chat";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar-content";
import { GradeCalculatorPage } from "./grade-calculator-page";
import { AddGradeDialog } from "./add-grade-dialog";
import { EditSubjectDialog } from "./edit-subject-dialog";
import { DataManagementPage } from "./data-management-page";
import { FileManagementPage } from "./file-management-page";
import { GradeInfoDialog } from "./grade-info-dialog";

export default function Dashboard() {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>("noten-meister-subjects", []);
  const [grades, setGrades] = useLocalStorage<Grade[]>("noten-meister-grades", []);
  const [selectedGradeLevel, setSelectedGradeLevel] = useLocalStorage<number>("noten-meister-grade-level", 10);
  const [mainSubjectWeight, setMainSubjectWeight] = useLocalStorage<number>("noten-meister-main-weight", 2);
  const [minorSubjectWeight, setMinorSubjectWeight] = useLocalStorage<number>("noten-meister-minor-weight", 1);
  const [theme, setTheme] = useLocalStorage<string>("noten-meister-theme", "blue");
  
  const [storedDarkMode, setStoredDarkMode] = useLocalStorage<boolean | null>('noten-meister-dark-mode', null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<'subjects' | 'tutor' | 'calculator' | 'data' | 'files'>('subjects');
  
  const [gradeDialogState, setGradeDialogState] = useState<{isOpen: boolean, subjectId: string | null, gradeToEdit?: Grade | null}>({isOpen: false, subjectId: null});
  const [editSubjectState, setEditSubjectState] = useState<{isOpen: boolean, subject: Subject | null}>({isOpen: false, subject: null});
  const [gradeInfoDialogState, setGradeInfoDialogState] = useState<{isOpen: boolean, grade: Grade | null, subject: Subject | null}>({isOpen: false, grade: null, subject: null});


  const { toast } = useToast();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("theme-zinc", "theme-rose", "theme-green", "theme-violet", "theme-orange", "theme-yellow", "theme-slate");

    if (theme !== "blue") {
      root.classList.add(`theme-${theme}`);
    }
  }, [theme]);
  
  useEffect(() => {
    const handleSystemPreference = (e: MediaQueryListEvent) => {
        if (storedDarkMode === null) {
          setIsDarkMode(e.matches);
        }
    };

    if (storedDarkMode !== null) {
        setIsDarkMode(storedDarkMode);
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.removeEventListener('change', handleSystemPreference);
        return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleSystemPreference);

    return () => {
        mediaQuery.removeEventListener('change', handleSystemPreference);
    };
  }, [storedDarkMode]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);


  const subjectsForGradeLevel = useMemo(() => {
    return subjects.filter((s) => s.gradeLevel === selectedGradeLevel);
  }, [subjects, selectedGradeLevel]);

  const filteredSubjects = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();

    if (!lowercasedQuery) {
      return subjectsForGradeLevel;
    }

    return subjectsForGradeLevel.filter((subject) => {
      if (subject.name.toLowerCase().includes(lowercasedQuery)) {
        return true;
      }

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

  const totalSubjectsCount = useMemo(() => {
    return filteredSubjects.length;
  }, [filteredSubjects]);

  const totalGradesCount = useMemo(() => {
    return gradesForFilteredSubjects.length;
  }, [gradesForFilteredSubjects]);

  const handleAddSubject = (values: AddSubjectData) => {
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      gradeLevel: selectedGradeLevel,
      name: values.name,
      category: values.category,
      ...(values.targetGrade && { targetGrade: values.targetGrade }),
      ...(values.category === 'Hauptfach' && { writtenWeight: 2, oralWeight: 1 }),
    };
    setSubjects([...subjects, newSubject]);
    toast({
      title: "Fach hinzugefügt",
      description: `Das Fach "${newSubject.name}" wurde erfolgreich erstellt.`,
    });
  };

  const handleUpdateSubject = (subjectId: string, updatedValues: Partial<Omit<Subject, 'id' | 'gradeLevel'>>) => {
    setSubjects(currentSubjects => 
        currentSubjects.map(s => 
            s.id === subjectId ? { ...s, ...updatedValues } : s
        )
    );
    toast({
      title: "Fach aktualisiert",
      description: `Die Einstellungen für das Fach wurden gespeichert.`,
    });
     setEditSubjectState({ isOpen: false, subject: null });
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

  const handleSaveGrade = (subjectId: string, values: AddGradeData, gradeId?: string) => {
    if (gradeId) {
      setGrades(currentGrades =>
        currentGrades.map(g =>
          g.id === gradeId
            ? { ...g, ...values, date: values.date.toISOString() }
            : g
        )
      );
      toast({
        title: "Note aktualisiert",
        description: "Die Änderungen an der Note wurden gespeichert.",
      });
    } else {
      const newGrade: Grade = {
        id: crypto.randomUUID(),
        subjectId,
        ...values,
        date: values.date.toISOString(),
      };
      setGrades([...grades, newGrade]);
      toast({
        title: "Note hinzugefügt",
        description: `Eine neue Note wurde erfolgreich gespeichert.`,
      });
    }
  };


  const handleDeleteGrade = (gradeId: string) => {
    setGrades(grades.filter((g) => g.id !== gradeId));
     toast({
      title: "Note gelöscht",
      description: `Die ausgewählte Note wurde entfernt.`,
      variant: "destructive",
    });
  };
  
  const handleOpenAddGradeDialog = (subjectId: string) => {
    setGradeDialogState({ isOpen: true, subjectId: subjectId, gradeToEdit: null });
  };

  const handleOpenEditGradeDialog = (grade: Grade) => {
      setGradeDialogState({ isOpen: true, subjectId: grade.subjectId, gradeToEdit: grade });
  };

  const handleCloseGradeDialog = () => {
      setGradeDialogState({ isOpen: false, subjectId: null, gradeToEdit: null });
  };

  const handleOpenEditSubjectDialog = (subject: Subject) => {
    setEditSubjectState({ isOpen: true, subject });
  };

  const handleOpenGradeInfoDialog = (grade: Grade) => {
    const subject = subjects.find(s => s.id === grade.subjectId);
    if (subject) {
      setGradeInfoDialogState({ isOpen: true, grade, subject });
    }
  };

  const handleCloseGradeInfoDialog = () => {
    setGradeInfoDialogState({ isOpen: false, grade: null, subject: null });
  };


  const handleExportCSV = () => {
    if (filteredSubjects.length === 0) {
      toast({
        title: "Keine Daten zum Exportieren",
        description: "Für die ausgewählte Klassenstufe gibt es keine Fächer.",
        variant: "destructive",
      });
      return;
    }
    const csvContent = generateCSV(filteredSubjects, gradesForFilteredSubjects);
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `noten-meister-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
     toast({
      title: "Daten exportiert",
      description: "Deine Noten wurden erfolgreich als CSV-Datei heruntergeladen.",
    });
  };
  
  const handleImportCSV = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const csvContent = event.target?.result as string;
                const { subjects: importedSubjects, grades: importedGrades, importedCount, skippedCount } = importDataFromCSV(csvContent, subjects, grades, selectedGradeLevel);
                setSubjects(importedSubjects);
                setGrades(importedGrades);
                toast({
                    title: "Import abgeschlossen",
                    description: `${importedCount} Einträge wurden importiert, ${skippedCount} Duplikate oder fehlerhafte Zeilen übersprungen.`,
                });
            };
            reader.readAsText(file);
        }
    };
    input.click();
  };


  const sidebarProps = {
    subjects: filteredSubjects,
    grades: gradesForFilteredSubjects,
    overallAverage: overallAverage,
    onAddSubject: handleAddSubject,
    onAddGrade: (subjectId: string, values: AddGradeData) => handleSaveGrade(subjectId, values),
    mainSubjectsAverage: mainSubjectsAverage,
    minorSubjectsAverage: minorSubjectsAverage,
    writtenGradesCount: writtenGradesCount,
    oralGradesCount: oralGradesCount,
    totalSubjectsCount: totalSubjectsCount,
    totalGradesCount: totalGradesCount,
    currentView: view,
    onSetView: setView,
  };
  
  const renderView = () => {
    switch (view) {
      case 'subjects':
        return (
          <SubjectList
            mainSubjects={mainSubjects}
            minorSubjects={minorSubjects}
            grades={grades}
            onDeleteSubject={handleDeleteSubject}
            onUpdateSubject={handleUpdateSubject}
            onAddSubject={() => setIsAddSubjectOpen(true)}
            totalSubjectsCount={subjectsForGradeLevel.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddGradeToSubject={handleOpenAddGradeDialog}
            onEditSubject={handleOpenEditSubjectDialog}
            onShowGradeInfo={handleOpenGradeInfoDialog}
          />
        );
      case 'tutor':
        return (
          <div className="h-[calc(100vh-10rem)]">
            <TutorChat subjects={subjectsForGradeLevel} allGrades={grades} />
          </div>
        );
      case 'calculator':
        return (
          <GradeCalculatorPage 
              subjects={subjectsForGradeLevel} 
              allGrades={grades} 
          />
        );
       case 'data':
        return (
          <DataManagementPage
            onImport={handleImportCSV}
            onExport={handleExportCSV}
          />
        );
      case 'files':
        return (
          <FileManagementPage
            subjects={subjectsForGradeLevel}
            grades={grades}
            onShowGradeInfo={handleOpenGradeInfoDialog}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AppSidebar {...sidebarProps} />
      <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 lg:hidden w-80">
            <div className="flex flex-col gap-4 h-full p-6">
                <SidebarContent
                    {...sidebarProps}
                    onClose={() => setMobileSidebarOpen(false)}
                />
            </div>
        </SheetContent>
      </Sheet>
      <div className="flex-1 lg:pl-80">
        <AppHeader 
          selectedGradeLevel={selectedGradeLevel}
          onGradeLevelChange={setSelectedGradeLevel}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          overallAverage={overallAverage}
          mainSubjectWeight={mainSubjectWeight}
          onMainSubjectWeightChange={setMainSubjectWeight}
          minorSubjectWeight={minorSubjectWeight}
          onMinorSubjectWeightChange={setMinorSubjectWeight}
          theme={theme}
          onThemeChange={setTheme}
          isDarkMode={isDarkMode}
          onIsDarkModeChange={(isDark) => setStoredDarkMode(isDark ? isDark : null)}
        />
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
      <AddSubjectDialog 
        isOpen={isAddSubjectOpen}
        onOpenChange={setIsAddSubjectOpen}
        onSubmit={handleAddSubject}
      />
      <AddGradeDialog
        isOpen={gradeDialogState.isOpen}
        onOpenChange={(isOpen) => !isOpen && handleCloseGradeDialog()}
        onSubmit={(values, gradeId) => {
            if (gradeDialogState.subjectId) {
                handleSaveGrade(gradeDialogState.subjectId, values, gradeId);
            }
        }}
        subjectName={subjects.find(s => s.id === gradeDialogState.subjectId)?.name || ''}
        gradeToEdit={gradeDialogState.gradeToEdit}
      />
      {editSubjectState.subject && (
        <EditSubjectDialog
          isOpen={editSubjectState.isOpen}
          onOpenChange={(isOpen) => !isOpen && setEditSubjectState({ isOpen: false, subject: null })}
          onSubmit={handleUpdateSubject}
          subject={editSubjectState.subject}
        />
      )}
      <GradeInfoDialog
        isOpen={gradeInfoDialogState.isOpen}
        onOpenChange={(isOpen) => !isOpen && handleCloseGradeInfoDialog()}
        grade={gradeInfoDialogState.grade}
        subject={gradeInfoDialogState.subject}
        onEdit={(grade) => {
            handleCloseGradeInfoDialog();
            handleOpenEditGradeDialog(grade);
        }}
        onDelete={(gradeId) => {
            handleCloseGradeInfoDialog();
            handleDeleteGrade(gradeId);
        }}
      />
    </div>
  );
}
