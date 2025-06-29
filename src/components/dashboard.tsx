"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, writeBatch, query, where, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Subject, Grade, AddSubjectData, AddGradeData, Award, AppView } from "@/lib/types";
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
import { AwardsPage } from "./awards-page";
import { awardsDefinitions } from "@/lib/awards";
import { CommandPalette } from "./command-palette";
import { useRouter } from "next/navigation";
import { ProfilePage } from "./profile-page";

export default function Dashboard() {
  const { user, isFirebaseEnabled } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  
  // Settings state
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<number>(10);
  const [mainSubjectWeight, setMainSubjectWeight] = useState<number>(2);
  const [minorSubjectWeight, setMinorSubjectWeight] = useState<number>(1);
  const [theme, setTheme] = useState<string>("blue");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userRole, setUserRole] = useState('student');
  const [userSchool, setUserSchool] = useState('');

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [view, setView] = useState<AppView>('subjects');
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  const [gradeDialogState, setGradeDialogState] = useState<{isOpen: boolean, subjectId: string | null, gradeToEdit?: Grade | null}>({isOpen: false, subjectId: null});
  const [editSubjectState, setEditSubjectState] = useState<{isOpen: boolean, subject: Subject | null}>({isOpen: false, subject: null});
  const [gradeInfoDialogState, setGradeInfoDialogState] = useState<{isOpen: boolean, grade: Grade | null, subject: Subject | null}>({isOpen: false, grade: null, subject: null});
  
  const [dataLoading, setDataLoading] = useState(true);

  const { toast } = useToast();

  const settingsDocRef = useMemo(() => user ? doc(db, 'users', user.uid, 'settings', 'main') : null, [user]);

  const updateSetting = useCallback(async (key: string, value: any) => {
    if (!user || !isFirebaseEnabled || !settingsDocRef) return;
    try {
      // Using setDoc with merge: true is safer as it creates the doc if it doesn't exist.
      await setDoc(settingsDocRef, { [key]: value }, { merge: true });
    } catch (error) {
      console.error("Error updating setting: ", error);
      toast({ title: "Fehler beim Speichern der Einstellung", variant: "destructive" });
    }
  }, [user, settingsDocRef, toast, isFirebaseEnabled]);


  useEffect(() => {
    // If firebase is enabled and we have a user, fetch data from firestore
    if (isFirebaseEnabled && user) {
        setDataLoading(true);

        const fetchData = async () => {
          try {
            // Fetch Settings
            if(settingsDocRef) {
              const settingsSnap = await getDoc(settingsDocRef);
              if (settingsSnap.exists()) {
                const settingsData = settingsSnap.data();
                setSelectedGradeLevel(settingsData.selectedGradeLevel || 10);
                setMainSubjectWeight(settingsData.mainSubjectWeight || 2);
                setMinorSubjectWeight(settingsData.minorSubjectWeight || 1);
                setTheme(settingsData.theme || 'blue');
                setIsDarkMode(settingsData.isDarkMode || false);
                setUserRole(settingsData.role || 'student');
                setUserSchool(settingsData.school || '');
              } else {
                 // Settings document doesn't exist, create it with defaults
                const defaultSettings = {
                  selectedGradeLevel: 10,
                  mainSubjectWeight: 2,
                  minorSubjectWeight: 1,
                  theme: 'blue',
                  isDarkMode: false,
                  role: 'student',
                  school: '',
                };
                await setDoc(settingsDocRef, defaultSettings);
                // Set the state with the defaults we just saved
                setSelectedGradeLevel(defaultSettings.selectedGradeLevel);
                setMainSubjectWeight(defaultSettings.mainSubjectWeight);
                setMinorSubjectWeight(defaultSettings.minorSubjectWeight);
                setTheme(defaultSettings.theme);
                setIsDarkMode(defaultSettings.isDarkMode);
                setUserRole(defaultSettings.role as 'student' | 'teacher');
                setUserSchool(defaultSettings.school);
              }
            }
            
            // Fetch Subjects
            const subjectsQuery = query(collection(db, 'users', user.uid, 'subjects'), where('gradeLevel', '==', selectedGradeLevel));
            const subjectsSnap = await getDocs(subjectsQuery);
            const subjectsData = subjectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subject[];
            setSubjects(subjectsData);
            
            // Fetch Grades for these subjects
            if (subjectsData.length > 0) {
              const subjectIds = subjectsData.map(s => s.id);
              const gradesQuery = query(collection(db, 'users', user.uid, 'grades'), where('subjectId', 'in', subjectIds));
              const gradesSnap = await getDocs(gradesQuery);
              const gradesData = gradesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Grade[];
              setGrades(gradesData);
            } else {
              setGrades([]);
            }

          } catch (error) {
            console.error("Error fetching data:", error);
            toast({ title: "Fehler beim Laden der Daten", variant: "destructive" });
          } finally {
            setDataLoading(false);
          }
        };
        fetchData();
    } else {
        // Demo mode: not logged in or firebase disabled
        setDataLoading(true);
        setSubjects([]);
        setGrades([]);
        setDataLoading(false);
    }
  }, [user, selectedGradeLevel, settingsDocRef, toast, isFirebaseEnabled]);


  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("theme-zinc", "theme-rose", "theme-green", "theme-violet", "theme-orange", "theme-yellow", "theme-slate");

    if (theme !== "blue") {
      root.classList.add(`theme-${theme}`);
    }
  }, [theme]);
  
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);


  const subjectsForGradeLevel = subjects; // Already filtered by Firestore query or local state


  const mainSubjects = useMemo(() => {
    return subjectsForGradeLevel
      .filter((s) => s.category === 'Hauptfach')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [subjectsForGradeLevel]);

  const minorSubjects = useMemo(() => {
    return subjectsForGradeLevel
      .filter((s) => s.category === 'Nebenfach')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [subjectsForGradeLevel]);


  const overallAverage = useMemo(() => {
    return calculateOverallAverage(subjectsForGradeLevel, grades, mainSubjectWeight, minorSubjectWeight);
  }, [subjectsForGradeLevel, grades, mainSubjectWeight, minorSubjectWeight]);

  const mainSubjectsAverage = useMemo(() => {
    return calculateCategoryAverage(mainSubjects, grades);
  }, [mainSubjects, grades]);

  const minorSubjectsAverage = useMemo(() => {
    return calculateCategoryAverage(minorSubjects, grades);
  }, [minorSubjects, grades]);
  
  const writtenGradesCount = useMemo(() => {
    return grades.filter(g => g.type === 'Schulaufgabe').length;
  }, [grades]);

  const oralGradesCount = useMemo(() => {
     return grades.filter(g => g.type === 'mündliche Note').length;
  }, [grades]);

  const totalSubjectsCount = useMemo(() => {
    return subjectsForGradeLevel.length;
  }, [subjectsForGradeLevel]);

  const totalGradesCount = useMemo(() => {
    return grades.length;
  }, [grades]);

  const awards = useMemo<Award[]>(() => {
    return awardsDefinitions.map(def => {
      const result = def.check(subjectsForGradeLevel, grades, overallAverage);
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        secretDescription: def.secretDescription,
        icon: def.icon,
        tier: def.tier,
        isRepeatable: def.isRepeatable,
        unlocked: result.unlocked,
        progress: result.progress,
      };
    });
  }, [subjectsForGradeLevel, grades, overallAverage]);

  const handleAddSubject = async (values: AddSubjectData) => {
    const newSubjectData = {
      gradeLevel: selectedGradeLevel,
      name: values.name,
      category: values.category,
      ...(values.targetGrade && { targetGrade: values.targetGrade }),
      ...(values.category === 'Hauptfach' && { writtenWeight: 2, oralWeight: 1 }),
    };

    if (!isFirebaseEnabled || !user) {
      const newSubject: Subject = { id: `local-${Date.now()}`, ...newSubjectData };
      setSubjects(s => [...s, newSubject]);
      toast({ title: "Fach hinzugefügt (Demo)", description: "Im Demo-Modus werden Daten nicht gespeichert." });
      return;
    }
    
    try {
        const docRef = await addDoc(collection(db, 'users', user.uid, 'subjects'), newSubjectData);
        const newSubject: Subject = { id: docRef.id, ...newSubjectData } as Subject;
        setSubjects([...subjects, newSubject]);
        toast({
            title: "Fach hinzugefügt",
            description: `Das Fach "${newSubject.name}" wurde erfolgreich erstellt.`,
        });
    } catch (error) {
        console.error("Error adding subject: ", error);
        toast({ title: "Fehler beim Hinzufügen des Fachs", variant: "destructive"});
    }
  };

  const handleUpdateSubject = async (subjectId: string, updatedValues: Partial<Omit<Subject, 'id' | 'gradeLevel'>>) => {
    if (!isFirebaseEnabled || !user) {
        setSubjects(currentSubjects => currentSubjects.map(s => s.id === subjectId ? { ...s, ...updatedValues } : s));
        toast({ title: "Fach aktualisiert (Demo)" });
        setEditSubjectState({ isOpen: false, subject: null });
        return;
    }

    const subjectDocRef = doc(db, 'users', user.uid, 'subjects', subjectId);
    try {
        await setDoc(subjectDocRef, updatedValues, { merge: true });
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
    } catch(error) {
        console.error("Error updating subject: ", error);
        toast({ title: "Fehler beim Aktualisieren des Fachs", variant: "destructive"});
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    const subjectName = subjects.find(s => s.id === subjectId)?.name || 'Das Fach';

    if(!isFirebaseEnabled || !user) {
        setSubjects(s => s.filter((sub) => sub.id !== subjectId));
        setGrades(g => g.filter((grade) => grade.subjectId !== subjectId));
        toast({ title: "Fach gelöscht (Demo)", variant: "destructive" });
        return;
    }
    
    try {
      const batch = writeBatch(db);
      const subjectDocRef = doc(db, 'users', user.uid, 'subjects', subjectId);
      batch.delete(subjectDocRef);

      const gradesToDeleteQuery = query(collection(db, 'users', user.uid, 'grades'), where('subjectId', '==', subjectId));
      const gradesToDeleteSnap = await getDocs(gradesToDeleteQuery);
      gradesToDeleteSnap.forEach(gradeDoc => {
        batch.delete(gradeDoc.ref);
      });
      
      await batch.commit();

      setSubjects(subjects.filter((s) => s.id !== subjectId));
      setGrades(grades.filter((g) => g.subjectId !== subjectId));
      toast({
        title: "Fach gelöscht",
        description: `${subjectName} und alle zugehörigen Noten wurden gelöscht.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error deleting subject and grades: ", error);
      toast({ title: "Fehler beim Löschen des Fachs", variant: "destructive"});
    }
  };

  const handleSaveGrade = async (subjectId: string, values: AddGradeData, gradeId?: string) => {
    const gradeData = {
      subjectId,
      ...values,
      date: values.date.toISOString(),
    };
    
    if (!isFirebaseEnabled || !user) {
        if (gradeId) {
             setGrades(currentGrades => currentGrades.map(g => g.id === gradeId ? { ...g, id: g.id, ...gradeData } : g));
             toast({ title: "Note aktualisiert (Demo)" });
        } else {
            const newGrade: Grade = { id: `local-${Date.now()}`, ...gradeData };
            setGrades(g => [...g, newGrade]);
            toast({ title: "Note hinzugefügt (Demo)" });
        }
        return;
    }

    try {
      if (gradeId) {
        const gradeDocRef = doc(db, 'users', user.uid, 'grades', gradeId);
        await setDoc(gradeDocRef, gradeData, { merge: true });
        setGrades(currentGrades =>
          currentGrades.map(g =>
            g.id === gradeId ? { ...g, id: g.id, ...gradeData } : g
          )
        );
        toast({ title: "Note aktualisiert", description: "Die Änderungen an der Note wurden gespeichert." });
      } else {
        const docRef = await addDoc(collection(db, 'users', user.uid, 'grades'), gradeData);
        const newGrade: Grade = { id: docRef.id, ...gradeData };
        setGrades([...grades, newGrade]);
        toast({ title: "Note hinzugefügt", description: `Eine neue Note wurde erfolgreich gespeichert.` });
      }
    } catch (error) {
       console.error("Error saving grade: ", error);
       toast({ title: "Fehler beim Speichern der Note", variant: "destructive"});
    }
  };


  const handleDeleteGrade = async (gradeId: string) => {
    if (!isFirebaseEnabled || !user) {
        setGrades(g => g.filter((grade) => grade.id !== gradeId));
        toast({ title: "Note gelöscht (Demo)", variant: "destructive" });
        return;
    }

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'grades', gradeId));
      setGrades(grades.filter((g) => g.id !== gradeId));
      toast({
        title: "Note gelöscht",
        description: `Die ausgewählte Note wurde entfernt.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error deleting grade: ", error);
      toast({ title: "Fehler beim Löschen der Note", variant: "destructive"});
    }
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
    if (subjectsForGradeLevel.length === 0) {
      toast({
        title: "Keine Daten zum Exportieren",
        description: "Für die ausgewählte Klassenstufe gibt es keine Fächer.",
        variant: "destructive",
      });
      return;
    }
    const csvContent = generateCSV(subjectsForGradeLevel, grades);
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
  
  const handleImportCSV = async () => {
    if (!user || !isFirebaseEnabled) {
      toast({ title: "Funktion nicht verfügbar", description: "Der Datenimport ist im Demo-Modus nicht möglich.", variant: "destructive" });
      return;
    };
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const csvContent = event.target?.result as string;
                try {
                  const { newSubjects, newGrades, importedCount, skippedCount } = await importDataFromCSV(csvContent, subjects, grades, selectedGradeLevel, user.uid);
                  
                  if (importedCount > 0) {
                    setSubjects(newSubjects);
                    setGrades(newGrades);
                  }

                  toast({
                      title: "Import abgeschlossen",
                      description: `${importedCount} Einträge wurden importiert, ${skippedCount} Duplikate oder fehlerhafte Zeilen übersprungen.`,
                  });
                } catch(error: any) {
                   toast({
                      title: "Import fehlgeschlagen",
                      description: error.message,
                      variant: "destructive"
                   });
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
  };

  const handleLogout = async () => {
    if (!isFirebaseEnabled) {
        router.push('/login');
        return;
    }
    try {
      await auth.signOut();
      router.push('/login');
    } catch (error) {
      toast({ title: "Fehler beim Abmelden", variant: "destructive" });
    }
  };


  const sidebarProps = {
    subjects: subjectsForGradeLevel,
    grades: grades,
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
    if (dataLoading) {
      return <div>Loading...</div>; // Replace with a proper skeleton loader
    }
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
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onAddGradeToSubject={handleOpenAddGradeDialog}
            onEditSubject={handleOpenEditSubjectDialog}
            onShowGradeInfo={handleOpenGradeInfoDialog}
          />
        );
      case 'tutor':
        return (
          <TutorChat subjects={subjectsForGradeLevel} allGrades={grades} />
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
            isFirebaseEnabled={isFirebaseEnabled && !!user}
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
      case 'awards':
        return (
          <AwardsPage awards={awards} selectedGradeLevel={selectedGradeLevel} />
        );
      case 'profile':
        return <ProfilePage />;
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
          onGradeLevelChange={(level) => {
            setSelectedGradeLevel(level);
            updateSetting('selectedGradeLevel', level);
          }}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          overallAverage={overallAverage}
          mainSubjectWeight={mainSubjectWeight}
          onMainSubjectWeightChange={(weight) => {
            setMainSubjectWeight(weight);
            updateSetting('mainSubjectWeight', weight);
          }}
          minorSubjectWeight={minorSubjectWeight}
          onMinorSubjectWeightChange={(weight) => {
            setMinorSubjectWeight(weight);
            updateSetting('minorSubjectWeight', weight);
          }}
          theme={theme}
          onThemeChange={(newTheme) => {
            setTheme(newTheme);
            updateSetting('theme', newTheme);
          }}
          isDarkMode={isDarkMode}
          onIsDarkModeChange={(isDark) => {
            setIsDarkMode(isDark);
            updateSetting('isDarkMode', isDark);
          }}
          onLogout={handleLogout}
          userRole={userRole}
          onUserRoleChange={(role) => {
            setUserRole(role);
            updateSetting('role', role);
          }}
          userSchool={userSchool}
          onUserSchoolChange={(school) => {
            setUserSchool(school);
            updateSetting('school', school);
          }}
          onNavigate={setView}
        />
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        subjects={subjectsForGradeLevel}
        onNavigate={setView}
        onAddSubject={() => setIsAddSubjectOpen(true)}
        onAddGrade={handleOpenAddGradeDialog}
        onExport={handleExportCSV}
        onImport={handleImportCSV}
      />
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
