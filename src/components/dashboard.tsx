
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, writeBatch, query, where, setDoc, arrayUnion, arrayRemove, onSnapshot, serverTimestamp, orderBy, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Subject, Grade, AddSubjectData, AddGradeData, Award, AppView, Profile, StudySet, School, FileSystemItem, TimetableEntry, Task, SchoolEvent, StudyCard, TaskType, Lernzettel, ActivityType, ActivityLog } from "@/lib/types";
import { AppHeader } from "./header";
import { AddSubjectDialog } from "./add-subject-dialog";
import { SubjectList } from "./subject-list";
import { useToast } from "@/hooks/use-toast";
import { calculateOverallAverage, calculateCategoryAverage, generateCSV, importDataFromCSV } from "@/lib/utils";
import { AppSidebar } from "./app-sidebar";
import { TutorChat } from "./tutor-chat";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
import { CommunityPage } from "./community-page";
import { UserProfilePage } from "./user-profile-page";
import { SettingsPage } from "./settings-page";
import { StudySetsPage } from "./study-sets-page";
import { StudySetDetailPage } from "./study-set-detail-page";
import { CreateEditStudySetPage } from "./create-edit-study-set-page";
import { DashboardOverview, defaultLayouts } from "./dashboard-overview";
import { Skeleton } from "./ui/skeleton";
import type { Layouts } from "react-grid-layout";
import { debounce } from "lodash-es";
import { PlannerPage } from "./timetable-page";
import { AddTaskDialog } from "./add-homework-dialog";
import { SchoolCalendarPage } from "./school-calendar-page";
import { AddSchoolEventDialog } from "./AddSchoolEventDialog";
import { DashboardSettingsDialog } from "./dashboard-settings-dialog";
import { LernzettelPage } from "./lernzettel-page";
import { CreateEditLernzettelPage } from "./create-edit-lernzettel-page";
import { LernzettelDetailPage } from "./lernzettel-detail-page";
import { generateStudySetFromNote } from "@/ai/flows/create-studyset-from-note-flow";
import { ActivityPage } from "./activity-page";


const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div>
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <Skeleton className="h-64 rounded-lg xl:col-span-2" />
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  </div>
);

const defaultWidgets = {
    performance: true,
    actions: true,
    upcoming: true,
    tasks: true,
    calendar: true,
    tutor: true,
};

export default function Dashboard() {
  const { user, isFirebaseEnabled } = useAuth();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [lernzettel, setLernzettel] = useState<Lernzettel[]>([]);
  const [userFiles, setUserFiles] = useState<FileSystemItem[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allSchools, setAllSchools] = useState<School[]>([]);
  const [schoolEvents, setSchoolEvents] = useState<SchoolEvent[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  // Settings state
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<number>(10);
  const [mainSubjectWeight, setMainSubjectWeight] = useState<number>(2);
  const [minorSubjectWeight, setMinorSubjectWeight] = useState<number>(1);
  const [maxPeriods, setMaxPeriods] = useState<number>(10);
  const [theme, setTheme] = useState<string>("blue");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');
  const [userSchoolId, setUserSchoolId] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);
  const [dashboardWidgets, setDashboardWidgets] = useState<Record<string, boolean>>(defaultWidgets);

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDashboardSettingsOpen, setDashboardSettingsOpen] = useState(false);
  const [view, setView] = useState<AppView>('dashboard');
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [viewingStudySetId, setViewingStudySetId] = useState<string | null>(null);
  const [editingStudySet, setEditingStudySet] = useState<StudySet | null>(null);
  const [viewingLernzettelId, setViewingLernzettelId] = useState<string | null>(null);
  const [editingLernzettel, setEditingLernzettel] = useState<Lernzettel | null>(null);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  const [gradeDialogState, setGradeDialogState] = useState<{isOpen: boolean, subjectId: string | null, gradeToEdit?: Grade | null}>({isOpen: false, subjectId: null});
  const [editSubjectState, setEditSubjectState] = useState<{isOpen: boolean, subject: Subject | null}>({isOpen: false, subject: null});
  const [gradeInfoDialogState, setGradeInfoDialogState] = useState<{isOpen: boolean, grade: Grade | null, subject: Subject | null}>({isOpen: false, grade: null, subject: null});
  const [schoolEventDialogState, setSchoolEventDialogState] = useState<{isOpen: boolean, eventToEdit?: SchoolEvent | null, selectedDate?: Date}>({isOpen: false});
  
  const [dataLoading, setDataLoading] = useState(true);

  const { toast } = useToast();

  const logActivity = useCallback((type: ActivityType, description: string, icon: string, details?: Record<string, any>) => {
    if (!user || !isFirebaseEnabled) return;
    const activityData = {
      type,
      description,
      icon,
      details: details || {},
      timestamp: serverTimestamp(),
    };
    addDoc(collection(db, 'users', user.uid, 'activity'), activityData);
  }, [user, isFirebaseEnabled]);

  const saveSetting = useCallback(debounce((key: string, value: any) => {
    if (!user || !isFirebaseEnabled) return;
    const settingsDocRef = doc(db, 'users', user.uid, 'settings', 'main');
    try {
      const sanitizedData = JSON.parse(JSON.stringify({ [key]: value }));
      setDoc(settingsDocRef, sanitizedData, { merge: true });
    } catch (error) {
      console.error("Error updating setting: ", error);
      toast({ title: "Fehler beim Speichern der Einstellung", variant: "destructive" });
    }
  }, 1000), [user, isFirebaseEnabled, toast]);

  // Effect for user-level data (profile, settings) and one-time fetches (schools)
  useEffect(() => {
    if (!isFirebaseEnabled || !user) {
      setDataLoading(false);
      // Reset state for demo mode or logged out user
      setSubjects([]);
      setGrades([]);
      setStudySets([]);
      setLernzettel([]);
      setUserFiles([]);
      setTimetable([]);
      setTasks([]);
      setProfile(null);
      setUserName(null);
      setSchoolEvents([]);
      setActivityLogs([]);
      return;
    }

    const unsubscribers: (() => void)[] = [];

    // --- Settings listener ---
    const settingsRef = doc(db, 'users', user.uid, 'settings', 'main');
    const settingsUnsub = onSnapshot(settingsRef, (settingsSnap) => {
      if (settingsSnap.exists()) {
        const settingsData = settingsSnap.data();
        setSelectedGradeLevel(settingsData.selectedGradeLevel || 10);
        setMainSubjectWeight(settingsData.mainSubjectWeight || 2);
        setMinorSubjectWeight(settingsData.minorSubjectWeight || 1);
        setMaxPeriods(settingsData.maxPeriods || 10);
        setTheme(settingsData.theme || 'blue');
        setIsDarkMode(settingsData.isDarkMode || false);
        setUserRole(settingsData.role || 'student');
        setUserSchoolId(settingsData.schoolId || '');
        setDashboardWidgets({ ...defaultWidgets, ...(settingsData.dashboardWidgets || {}) });
        const savedLayouts = settingsData.dashboardLayouts;
        if (savedLayouts && Object.keys(savedLayouts).length > 0) {
            const mergedLayouts: Layouts = {};
            for (const breakpoint in defaultLayouts) {
                if(Object.prototype.hasOwnProperty.call(defaultLayouts, breakpoint)) {
                     mergedLayouts[breakpoint as keyof typeof defaultLayouts] = defaultLayouts[breakpoint as keyof typeof defaultLayouts].map(defaultItem => {
                        const savedItem = savedLayouts[breakpoint]?.find((item: { i: string; }) => item.i === defaultItem.i);
                        return savedItem || defaultItem;
                    });
                }
            }
            setLayouts(mergedLayouts);
        } else {
            setLayouts(defaultLayouts);
        }
      } else {
        const defaultSettings = {
          selectedGradeLevel: 10,
          mainSubjectWeight: 2,
          minorSubjectWeight: 1,
          maxPeriods: 10,
          theme: 'blue',
          isDarkMode: false,
          role: 'student',
          schoolId: '',
          dashboardLayouts: defaultLayouts,
          dashboardWidgets: defaultWidgets,
        };
        setDoc(settingsRef, defaultSettings);
      }
    });
    unsubscribers.push(settingsUnsub);

    // --- Profile listener ---
    const profileRef = doc(db, 'profiles', user.uid);
    const profileUnsub = onSnapshot(profileRef, (profileSnap) => {
      if (profileSnap.exists()) {
        const profileData = profileSnap.data() as Profile;
        setProfile(profileData);
        setUserName(profileData.name);
      } else {
        const newProfileData = {
          uid: user.uid,
          name: user.displayName || 'Neuer Nutzer',
          email: user.email,
          bio: `Hallo! Ich benutze Notio, um meinen Schulerfolg zu organisieren.`,
          followers: [],
          following: []
        };
        setDoc(profileRef, newProfileData);
      }
    });
    unsubscribers.push(profileUnsub);
    
    // --- User Files listener ---
    const filesQuery = query(collection(db, 'users', user.uid, 'files'), orderBy('createdAt', 'desc'));
    const filesUnsub = onSnapshot(filesQuery, (snapshot) => {
        const filesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FileSystemItem[];
        setUserFiles(filesData);
    }, (error) => {
        console.error("Error fetching files:", error);
    });
    unsubscribers.push(filesUnsub);
    
    // --- Timetable listener ---
    const timetableQuery = query(collection(db, 'users', user.uid, 'timetable'));
    const timetableUnsub = onSnapshot(timetableQuery, (snapshot) => {
        const timetableData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TimetableEntry[];
        setTimetable(timetableData);
    }, (error) => {
        console.error("Error fetching timetable:", error);
    });
    unsubscribers.push(timetableUnsub);

    // --- Tasks listener ---
    const tasksQuery = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'desc'));
    const tasksUnsub = onSnapshot(tasksQuery, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
        setTasks(tasksData);
    }, (error) => {
        console.error("Error fetching tasks:", error);
    });
    unsubscribers.push(tasksUnsub);

    // --- Activity Log listener ---
    const activityQuery = query(collection(db, 'users', user.uid, 'activity'), orderBy('timestamp', 'desc'), where('timestamp', '!=', null));
    const activityUnsub = onSnapshot(activityQuery, (snapshot) => {
        const activityData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ActivityLog[];
        setActivityLogs(activityData);
    }, (error) => {
        console.error("Error fetching activity log:", error);
    });
    unsubscribers.push(activityUnsub);

    // --- All schools (one-time fetch) ---
    const fetchSchools = async () => {
        const schoolsQuery = query(collection(db, 'schools'));
        const schoolsSnap = await getDocs(schoolsQuery);
        const schoolsData = schoolsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as School[];
        setAllSchools(schoolsData.sort((a, b) => a.name.localeCompare(b.name)));
    };
    fetchSchools();

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [isFirebaseEnabled, user]);

  // Effect for school-specific data (events)
  useEffect(() => {
    if (!isFirebaseEnabled || !user || !userSchoolId) {
      setSchoolEvents([]);
      return;
    }
    const eventsQuery = query(collection(db, 'schools', userSchoolId, 'events'), orderBy('date', 'desc'));
    const eventsUnsub = onSnapshot(eventsQuery, (snapshot) => {
        const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SchoolEvent[];
        setSchoolEvents(eventsData);
    }, (error) => {
        console.error("Error fetching school events:", error);
        toast({ title: "Fehler beim Laden der Schul-Termine", variant: "destructive" });
    });

    return () => eventsUnsub();
  }, [isFirebaseEnabled, user, userSchoolId, toast]);

  // Effect for grade-level dependent data
  useEffect(() => {
    if (!isFirebaseEnabled || !user) return;
    
    setDataLoading(true);
    const unsubscribers: (() => void)[] = [];

    // --- Subjects listener ---
    const subjectsQuery = query(collection(db, 'users', user.uid, 'subjects'), where('gradeLevel', '==', selectedGradeLevel));
    const subjectsUnsub = onSnapshot(subjectsQuery, (snapshot) => {
      const subjectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Subject[];
      setSubjects(subjectsData);
    }, (error) => {
      console.error("Error fetching subjects:", error);
      toast({ title: "Fehler beim Laden der Fächer", variant: "destructive" });
    });
    unsubscribers.push(subjectsUnsub);

    // --- Study Sets listener ---
    const studySetsQuery = query(collection(db, 'users', user.uid, 'studySets'), where('gradeLevel', '==', selectedGradeLevel));
    const studySetsUnsub = onSnapshot(studySetsQuery, (snapshot) => {
        const studySetsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StudySet[];
        setStudySets(studySetsData);
    }, (error) => {
        console.error("Error fetching study sets:", error);
    });
    unsubscribers.push(studySetsUnsub);
    
    // --- Lernzettel listener ---
    const lernzettelQuery = query(collection(db, 'users', user.uid, 'lernzettel'), where('gradeLevel', '==', selectedGradeLevel));
    const lernzettelUnsub = onSnapshot(lernzettelQuery, (snapshot) => {
        const lernzettelData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lernzettel[];
        setLernzettel(lernzettelData);
    }, (error) => {
        console.error("Error fetching lernzettel:", error);
    });
    unsubscribers.push(lernzettelUnsub);

    return () => {
      unsubscribers.forEach(unsub => unsub());
      setSubjects([]);
      setStudySets([]);
      setLernzettel([]);
    };
  }, [isFirebaseEnabled, user, selectedGradeLevel, toast]);

  // Effect for grades, dependent on subjects
  useEffect(() => {
    if (!isFirebaseEnabled || !user) return;

    if (subjects.length === 0) {
      setGrades([]);
      setDataLoading(false);
      return;
    }
    
    const subjectIds = subjects.map(s => s.id);
    if (subjectIds.length === 0) {
        setGrades([]);
        setDataLoading(false);
        return;
    }
    const gradesQuery = query(collection(db, 'users', user.uid, 'grades'), where('subjectId', 'in', subjectIds));
    
    const gradesUnsub = onSnapshot(gradesQuery, (snapshot) => {
        const gradesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Grade[];
        setGrades(gradesData);
        setDataLoading(false);
    }, (error) => {
        console.error("Error fetching grades:", error);
        toast({ title: "Fehler beim Laden der Noten", variant: "destructive" });
        setDataLoading(false);
    });

    return () => {
        gradesUnsub();
        setGrades([]);
    };
  }, [isFirebaseEnabled, user, subjects, toast]);


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

  const subjectsForGradeLevel = subjects;
  
  const plannedGrades = useMemo(() => {
    return grades
        .filter(g => g.value == null)
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [grades])

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
  
  const totalSubjectsCount = useMemo(() => {
    return subjectsForGradeLevel.length;
  }, [subjectsForGradeLevel]);

  const totalGradesCount = useMemo(() => {
    return grades.filter(g => g.value != null).length;
  }, [grades]);

  const awards = useMemo<Award[]>(() => {
    return awardsDefinitions.map(def => {
      const result = def.check(subjectsForGradeLevel, grades, overallAverage, studySets, lernzettel, tasks);
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
  }, [subjectsForGradeLevel, grades, overallAverage, studySets, lernzettel, tasks]);

  const handleAddSubject = async (values: AddSubjectData): Promise<string> => {
    const newSubjectData = {
      gradeLevel: selectedGradeLevel,
      name: values.name,
      category: values.category,
      targetGrade: values.targetGrade || null,
      writtenWeight: values.category === 'Hauptfach' ? 2 : null,
      oralWeight: values.category === 'Hauptfach' ? 1 : null,
    };

    if (!isFirebaseEnabled || !user) {
      const newId = `local-${Date.now()}`;
      const newSubject: Subject = { id: newId, ...newSubjectData } as Subject;
      setSubjects(s => [...s, newSubject]);
      toast({ title: "Fach hinzugefügt (Demo)", description: "Im Demo-Modus werden Daten nicht gespeichert." });
      return newId;
    }
    
    try {
        const docRef = await addDoc(collection(db, 'users', user.uid, 'subjects'), newSubjectData);
        logActivity('SUBJECT_CREATED', `Fach "${values.name}" erstellt`, 'Plus');
        toast({
            title: "Fach hinzugefügt",
            description: `Das Fach "${values.name}" wurde erfolgreich erstellt.`,
        });
        return docRef.id;
    } catch (error) {
        console.error("Error adding subject: ", error);
        toast({ title: "Fehler beim Hinzufügen des Fachs", variant: "destructive"});
        throw error;
    }
  };

  const handleUpdateSubject = async (subjectId: string, updatedValues: Partial<Omit<Subject, 'id' | 'gradeLevel'>>) => {
    if (!isFirebaseEnabled || !user) {
        setSubjects(currentSubjects => currentSubjects.map(s => s.id === subjectId ? { ...s, ...updatedValues } as Subject : s));
        toast({ title: "Fach aktualisiert (Demo)" });
        setEditSubjectState({ isOpen: false, subject: null });
        return;
    }

    const dataToUpdate = {
        ...updatedValues,
        targetGrade: updatedValues.targetGrade || null,
    };
    const subjectDocRef = doc(db, 'users', user.uid, 'subjects', subjectId);
    try {
        await setDoc(subjectDocRef, dataToUpdate, { merge: true });
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

      logActivity('SUBJECT_DELETED', `Fach "${subjectName}" gelöscht`, 'Trash2');

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
    const subjectName = subjects.find(s => s.id === subjectId)?.name || '';
    const gradeData = {
      subjectId,
      type: values.type,
      name: values.name || null,
      value: values.value ?? null,
      weight: values.weight,
      date: values.date.toISOString(),
      notes: values.notes || null,
      attachments: values.attachments || [],
    };
    
    if (!isFirebaseEnabled || !user) {
        if (gradeId) {
             setGrades(currentGrades => currentGrades.map(g => g.id === gradeId ? { ...g, id: g.id, ...gradeData } as Grade : g));
             toast({ title: "Note aktualisiert (Demo)" });
        } else {
            const newGrade: Grade = { id: `local-${Date.now()}`, ...gradeData } as Grade;
            setGrades(g => [...g, newGrade]);
            toast({ title: "Note hinzugefügt (Demo)" });
        }
        return;
    }

    try {
      if (gradeId) {
        const gradeDocRef = doc(db, 'users', user.uid, 'grades', gradeId);
        await setDoc(gradeDocRef, gradeData, { merge: true });
        toast({ title: "Note aktualisiert", description: "Die Änderungen an der Note wurden gespeichert." });
      } else {
        await addDoc(collection(db, 'users', user.uid, 'grades'), gradeData);
        if (values.value) {
            logActivity('GRADE_ADDED', `Note ${values.value} in "${subjectName}" hinzugefügt`, 'ClipboardCheck');
        } else {
            logActivity('GRADE_PLANNED', `Termin für "${subjectName}" geplant`, 'ClipboardCheck');
        }
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
      const gradeToDelete = grades.find(g => g.id === gradeId);
      if (gradeToDelete) {
          const subjectName = subjects.find(s => s.id === gradeToDelete.subjectId)?.name || 'einem Fach';
          logActivity('GRADE_DELETED', `Note in "${subjectName}" gelöscht`, 'Trash2');
      }
      await deleteDoc(doc(db, 'users', user.uid, 'grades', gradeId));
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
  
  const handleSaveStudySet = async (values: Omit<StudySet, 'id' | 'gradeLevel'>, setId?: string): Promise<string | undefined> => {
    if (!user || !isFirebaseEnabled) {
        toast({ title: "Funktion nicht verfügbar", description: "Lernsets sind im Demo-Modus nicht verfügbar.", variant: "destructive" });
        return;
    }
    const data = { 
        ...values,
        gradeLevel: selectedGradeLevel,
        subjectId: values.subjectId || null,
    };
    try {
        if (setId) {
            const setRef = doc(db, 'users', user.uid, 'studySets', setId);
            await setDoc(setRef, data, { merge: true });
            toast({ title: "Lernset aktualisiert" });
            return setId;
        } else {
            const docRef = await addDoc(collection(db, 'users', user.uid, 'studySets'), data);
            logActivity('STUDY_SET_CREATED', `Lernset "${values.title}" erstellt`, 'BrainCircuit');
            toast({ title: "Lernset erstellt" });
            return docRef.id;
        }
    } catch (error) {
        console.error("Error saving study set:", error);
        toast({ title: "Fehler beim Speichern des Lernsets", variant: "destructive" });
    }
  };

  const handleUpdateStudySetCards = async (setId: string, updatedCards: StudyCard[]) => {
      if (!user || !isFirebaseEnabled) return;
      try {
          const setRef = doc(db, 'users', user.uid, 'studySets', setId);
          await updateDoc(setRef, { cards: JSON.parse(JSON.stringify(updatedCards)) });
          const studySet = studySets.find(s => s.id === setId);
          logActivity('STUDY_SET_LEARNED', `Lerneinheit für "${studySet?.title}" abgeschlossen`, 'Check');
          toast({ title: "Lernfortschritt gespeichert!" });
      } catch (error) {
          console.error("Error updating study set cards:", error);
          toast({ title: "Fehler beim Speichern des Fortschritts", variant: "destructive" });
      }
  };

  const handleDeleteStudySet = async (setId: string) => {
    if (!user || !isFirebaseEnabled) return;
    try {
        await deleteDoc(doc(db, 'users', user.uid, 'studySets', setId));
        toast({ title: "Lernset gelöscht", variant: "destructive" });
    } catch (error) {
        console.error("Error deleting study set:", error);
        toast({ title: "Fehler beim Löschen des Lernsets", variant: "destructive" });
    }
  };
  
  const handleSaveLernzettel = async (values: Omit<Lernzettel, 'id' | 'gradeLevel' | 'createdAt' | 'updatedAt' | 'isDone'>, lernzettelId?: string) => {
    if (!user || !isFirebaseEnabled) {
        toast({ title: "Funktion nicht verfügbar", description: "Lernzettel sind im Demo-Modus nicht verfügbar.", variant: "destructive" });
        return;
    }
    
    const dataToSave = {
      title: values.title,
      content: values.content,
      subjectId: values.subjectId || null,
      studySetIds: values.studySetIds || [],
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      isDone: values.dueDate ? (values.isDone ?? false) : null,
    };

    if (lernzettelId) {
      const lernzettelRef = doc(db, 'users', user.uid, 'lernzettel', lernzettelId);
      await updateDoc(lernzettelRef, {...dataToSave, updatedAt: serverTimestamp() });
      logActivity('LERNZETTEL_EDITED', `Lernzettel "${values.title}" bearbeitet`, 'FileText');
      toast({ title: "Lernzettel aktualisiert" });
    } else {
      const finalData = { ...dataToSave, gradeLevel: selectedGradeLevel, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
      await addDoc(collection(db, 'users', user.uid, 'lernzettel'), finalData);
      logActivity('LERNZETTEL_CREATED', `Lernzettel "${values.title}" erstellt`, 'FilePlus');
      toast({ title: "Lernzettel erstellt" });
    }
    setView('lernzettel');
  };

  const handleCreateStudySetFromAI = async (note: Lernzettel) => {
    if (!user) return;
    toast({ title: "Lernset wird generiert...", description: "Die KI erstellt die Karteikarten. Dies kann einen Moment dauern." });
    try {
        const generatedData = await generateStudySetFromNote({
            noteTitle: note.title,
            noteContent: note.content,
        });

        const setId = await handleSaveStudySet({ ...generatedData, subjectId: note.subjectId || null }, undefined);
        
        if (setId) {
            const updatedIds = [...(note.studySetIds || []), setId];
            await handleSaveLernzettel({ ...note, studySetIds: updatedIds }, note.id);

            toast({ title: "Lernset erstellt!", description: "Dein neues Lernset ist bereit." });
            handleViewStudySet(setId);
        }
    } catch (error) {
        console.error("Error creating study set from note:", error);
        toast({ title: "Fehler", description: "Das Lernset konnte nicht erstellt werden.", variant: "destructive" });
    }
  };

  const handleDeleteLernzettel = async (lernzettelId: string) => {
    if (!user || !isFirebaseEnabled) return;
    try {
        await deleteDoc(doc(db, 'users', user.uid, 'lernzettel', lernzettelId));
        toast({ title: "Lernzettel gelöscht", variant: "destructive" });
    } catch (error) {
        console.error("Error deleting Lernzettel:", error);
        toast({ title: "Fehler beim Löschen des Lernzettels", variant: "destructive" });
    }
  };

  const handleToggleLernzettelDone = async (lernzettelId: string, isDone: boolean) => {
    if (!user || !isFirebaseEnabled) return;
    try {
        const ref = doc(db, 'users', user.uid, 'lernzettel', lernzettelId);
        await updateDoc(ref, { isDone });
        if(isDone) {
            const lz = lernzettel.find(l => l.id === lernzettelId);
            logActivity('TASK_COMPLETED', `Lernziel "${lz?.title}" als erledigt markiert`, 'Check');
        }
    } catch (error) {
        toast({title: 'Fehler', variant: 'destructive'})
    }
  }
  
  const handleDeleteLernzettelDueDate = async (lernzettelId: string) => {
     if (!user || !isFirebaseEnabled) return;
    try {
        const ref = doc(db, 'users', user.uid, 'lernzettel', lernzettelId);
        await updateDoc(ref, { dueDate: null, isDone: null });
        toast({ title: 'Vom Planer entfernt' });
    } catch (error) {
        toast({title: 'Fehler', variant: 'destructive'})
    }
  }


  const handleCreateFolder = async (folderName: string, parentId: string | null) => {
    if (!user || !folderName.trim()) return;
    try {
        await addDoc(collection(db, 'users', user.uid, 'files'), {
            name: folderName.trim(),
            parentId: parentId,
            type: 'folder',
            createdAt: serverTimestamp(),
        });
        toast({ title: "Ordner erstellt" });
    } catch (error) {
        console.error("Error creating folder:", error);
        toast({ title: "Fehler beim Erstellen des Ordners", variant: "destructive" });
    }
  };

  const handleUploadFiles = async (files: FileList, parentId: string | null) => {
    if (!user || files.length === 0) return;
    
    const uploadPromises = Array.from(files).map(file => {
        return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    await addDoc(collection(db, 'users', user.uid, 'files'), {
                        name: file.name,
                        parentId: parentId,
                        type: 'file',
                        dataUrl: e.target?.result as string,
                        size: file.size,
                        fileType: file.type,
                        createdAt: serverTimestamp(),
                    });
                    resolve();
                } catch(error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });

    try {
        await Promise.all(uploadPromises);
        toast({ title: `${files.length} Datei(en) erfolgreich hochgeladen.` });
    } catch (error) {
        console.error("Error uploading files:", error);
        toast({ title: "Fehler beim Hochladen der Dateien", variant: "destructive" });
    }
  };

  const getDescendantIds = (folderId: string, allItems: FileSystemItem[]): string[] => {
    const children = allItems.filter(item => item.parentId === folderId);
    let descendantIds: string[] = children.map(child => child.id);
    children.forEach(child => {
        if (child.type === 'folder') {
            descendantIds = [...descendantIds, ...getDescendantIds(child.id, allItems)];
        }
    });
    return descendantIds;
  };

  const handleDeleteFileSystemItem = async (itemId: string) => {
    if (!user) return;
    const itemToDelete = userFiles.find(f => f.id === itemId);
    if (!itemToDelete) return;

    const batch = writeBatch(db);
    const itemRef = doc(db, 'users', user.uid, 'files', itemId);
    batch.delete(itemRef);

    if (itemToDelete.type === 'folder') {
        const descendantIds = getDescendantIds(itemId, userFiles);
        descendantIds.forEach(id => {
            const descendantRef = doc(db, 'users', user.uid, 'files', id);
            batch.delete(descendantRef);
        });
    }

    try {
        await batch.commit();
        toast({ title: "Erfolgreich gelöscht", variant: "destructive" });
    } catch (error) {
        console.error("Error deleting item:", error);
        toast({ title: "Fehler beim Löschen", variant: "destructive" });
    }
  };

  const handleSaveTimetableEntry = async (day: number, period: number, values: { subjectId: string; room?: string }, entryId?: string) => {
    if (!user) return;
    const data = { day, period, ...values, room: values.room || null };
    try {
        if (entryId) {
            await setDoc(doc(db, 'users', user.uid, 'timetable', entryId), data, { merge: true });
        } else {
            await addDoc(collection(db, 'users', user.uid, 'timetable'), data);
        }
        toast({ title: "Stundenplan gespeichert" });
    } catch(error) {
        console.error("Error saving timetable entry:", error);
        toast({ title: "Fehler beim Speichern der Stunde", variant: "destructive" });
    }
  };
  
  const handleDeleteTimetableEntry = async (entryId: string) => {
    if (!user) return;
    try {
        await deleteDoc(doc(db, 'users', user.uid, 'timetable', entryId));
        toast({ title: "Stunde gelöscht", variant: "destructive" });
    } catch(error) {
        console.error("Error deleting timetable entry:", error);
        toast({ title: "Fehler beim Löschen der Stunde", variant: "destructive" });
    }
  }

  const handleSaveTask = async (values: { content: string; dueDate?: Date; subjectId: string; type: TaskType; }) => {
    if (!user) return;
    const subjectName = subjects.find(s => s.id === values.subjectId)?.name || '';
    const data = { 
        ...values, 
        dueDate: values.dueDate?.toISOString() || null, 
        isDone: false, 
        createdAt: serverTimestamp() 
    };
    try {
        await addDoc(collection(db, 'users', user.uid, 'tasks'), data);
        logActivity('TASK_CREATED', `Aufgabe für "${subjectName}" erstellt`, 'ListChecks');
        toast({ title: "Aufgabe gespeichert" });
    } catch(error) {
        console.error("Error saving task:", error);
        toast({ title: "Fehler beim Speichern der Aufgabe", variant: "destructive" });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
      if (!user) return;
      try {
          await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId));
          toast({ title: "Aufgabe gelöscht", variant: "destructive" });
      } catch(error) {
          console.error("Error deleting task:", error);
          toast({ title: "Fehler beim Löschen der Aufgabe", variant: "destructive" });
      }
  };
  
  const handleToggleTask = async (taskId: string, isDone: boolean) => {
      if (!user) return;
      try {
          await setDoc(doc(db, 'users', user.uid, 'tasks', taskId), { isDone }, { merge: true });
           if(isDone) {
            const task = tasks.find(t => t.id === taskId);
            logActivity('TASK_COMPLETED', `Aufgabe "${task?.content}" als erledigt markiert`, 'Check');
        }
      } catch(error) {
          console.error("Error toggling task:", error);
          toast({ title: "Fehler beim Aktualisieren der Aufgabe", variant: "destructive" });
      }
  };
  
  const handleSaveSchoolEvent = async (values: Omit<SchoolEvent, 'id' | 'schoolId' | 'authorId' | 'authorName' | 'createdAt' | 'gradeLevel'>, eventId?: string) => {
    if (!user || !userSchoolId) {
        toast({ title: "Aktion nicht möglich", description: "Du musst einer Schule zugeordnet sein.", variant: 'destructive' });
        return;
    }
    
    const dataToSave = {
        ...values,
        description: values.description || null,
        endDate: values.endDate || null,
    }

    if (eventId) {
        // Update existing event
        const eventRef = doc(db, 'schools', userSchoolId, 'events', eventId);
        const eventToUpdate = schoolEvents.find(e => e.id === eventId);
        if (eventToUpdate?.authorId !== user.uid) {
            toast({ title: "Keine Berechtigung", description: "Du kannst nur deine eigenen Termine bearbeiten.", variant: 'destructive' });
            return;
        }
        
        await updateDoc(eventRef, dataToSave);
        toast({ title: "Ereignis aktualisiert" });

    } else {
        // Create new event
        const eventData = {
          ...dataToSave,
          schoolId: userSchoolId,
          authorId: user.uid,
          authorName: user.displayName || 'Anonym',
          createdAt: serverTimestamp(),
          ...(values.target === 'gradeLevel' ? { gradeLevel: selectedGradeLevel } : { gradeLevel: null }),
        };

        try {
            await addDoc(collection(db, 'schools', userSchoolId, 'events'), eventData);
            toast({ title: "Ereignis erstellt", description: "Das Ereignis wurde dem Schulkalender hinzugefügt." });
        } catch (error) {
            console.error("Error adding school event:", error);
            toast({ title: "Fehler", description: "Das Ereignis konnte nicht erstellt werden.", variant: 'destructive' });
        }
    }
  };

  const handleDeleteSchoolEvent = async (eventId: string) => {
    if (!user || !userSchoolId) return;
    const eventRef = doc(db, 'schools', userSchoolId, 'events', eventId);
    const eventToDelete = schoolEvents.find(e => e.id === eventId);
     if (eventToDelete?.authorId !== user.uid) {
        toast({ title: "Keine Berechtigung", description: "Du kannst nur deine eigenen Termine löschen.", variant: 'destructive' });
        return;
    }
    try {
        await deleteDoc(eventRef);
        toast({ title: "Ereignis gelöscht", variant: 'destructive' });
    } catch(error) {
        console.error("Error deleting school event:", error);
        toast({ title: "Fehler", description: "Das Ereignis konnte nicht gelöscht werden.", variant: 'destructive' });
    }
  };

   const handleShareTimetable = async (): Promise<string> => {
    if (!user || timetable.length === 0) {
        toast({ title: "Fehler", description: "Es gibt keinen Stundenplan zum Teilen.", variant: "destructive" });
        throw new Error("No timetable to share.");
    }

    const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
    let shareCode = generateCode();
    
    let codeExists = await getDoc(doc(db, 'timetableShares', shareCode));
    while(codeExists.exists()) {
        shareCode = generateCode();
        codeExists = await getDoc(doc(db, 'timetableShares', shareCode));
    }

    const subjectIdsInTimetable = new Set(timetable.map(e => e.subjectId));
    const subjectsToShare = subjects.filter(s => subjectIdsInTimetable.has(s.id));

    const shareData = {
        userId: user.uid,
        createdAt: serverTimestamp(),
        data: {
          timetable: timetable.map(({ id, ...rest }) => rest), // Remove IDs for import
          subjects: subjectsToShare.map(s => ({id: s.id, name: s.name, category: s.category })),
        }
    };

    try {
        await setDoc(doc(db, 'timetableShares', shareCode), shareData);
        toast({ title: "Teilen-Code erstellt!", description: "Dein Code ist für 24 Stunden gültig." });
        return shareCode;
    } catch(error) {
        console.error("Error creating share link:", error);
        toast({ title: "Fehler", description: "Der Stundenplan konnte nicht geteilt werden.", variant: "destructive" });
        throw error;
    }
  };

  const handleImportTimetable = async (shareCode: string): Promise<void> => {
    if (!user || !shareCode.trim()) {
        toast({ title: "Fehler", description: "Bitte gib einen gültigen Code ein.", variant: "destructive" });
        throw new Error("Invalid code");
    }

    const shareRef = doc(db, 'timetableShares', shareCode.trim());
    const shareSnap = await getDoc(shareRef);

    if (!shareSnap.exists()) {
        toast({ title: "Fehler", description: "Dieser Teilen-Code ist ungültig oder abgelaufen.", variant: "destructive" });
        throw new Error("Share not found");
    }

    const importedData = shareSnap.data().data as {
        timetable: Omit<TimetableEntry, 'id'>[];
        subjects: {id: string; name: string; category: SubjectCategory}[];
    };

    const currentSubjects = subjectsForGradeLevel;
    const subjectIdMap = new Map<string, string>();
    const batch = writeBatch(db);

    for (const importedSubject of importedData.subjects) {
        const existingSubject = currentSubjects.find(s => s.name.toLowerCase() === importedSubject.name.toLowerCase());
        if (existingSubject) {
            subjectIdMap.set(importedSubject.id, existingSubject.id);
        } else {
            const newSubjectData = {
                gradeLevel: selectedGradeLevel,
                name: importedSubject.name,
                category: importedSubject.category,
                targetGrade: null,
                writtenWeight: importedSubject.category === 'Hauptfach' ? 2 : null,
                oralWeight: importedSubject.category === 'Hauptfach' ? 1 : null,
            };
            const newSubjectRef = doc(collection(db, 'users', user.uid, 'subjects'));
            batch.set(newSubjectRef, newSubjectData);
            subjectIdMap.set(importedSubject.id, newSubjectRef.id);
        }
    }

    const oldTimetableQuery = query(collection(db, 'users', user.uid, 'timetable'));
    const oldTimetableSnap = await getDocs(oldTimetableQuery);
    oldTimetableSnap.forEach(doc => batch.delete(doc.ref));

    importedData.timetable.forEach(entry => {
        const newSubjectId = subjectIdMap.get(entry.subjectId);
        if (newSubjectId) {
            const newEntryRef = doc(collection(db, 'users', user.uid, 'timetable'));
            batch.set(newEntryRef, { ...entry, subjectId: newSubjectId });
        }
    });

    try {
        await batch.commit();
        logActivity('TIMETABLE_IMPORTED', 'Stundenplan importiert', 'Import');
        toast({ title: "Erfolg!", description: "Der Stundenplan wurde erfolgreich importiert." });
    } catch(error) {
        console.error("Error importing timetable:", error);
        toast({ title: "Fehler", description: "Der Stundenplan konnte nicht importiert werden.", variant: "destructive" });
        throw error;
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
    link.setAttribute("download", `notio-export-${new Date().toISOString().split('T')[0]}.csv`);
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
                    logActivity('DATA_IMPORTED', `${importedCount} Einträge aus CSV importiert`, 'Import');
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
        router.push('/');
        return;
    }
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      toast({ title: "Fehler beim Abmelden", variant: "destructive" });
    }
  };
  
  const setAppView = (view: AppView) => {
    if (view !== 'user-profile') setViewingProfileId(null);
    if (!['studyset-detail', 'studyset-create', 'studyset-edit'].includes(view)) {
      setViewingStudySetId(null);
      setEditingStudySet(null);
    }
     if (!['lernzettel-detail', 'lernzettel-create', 'lernzettel-edit'].includes(view)) {
      setViewingLernzettelId(null);
      setEditingLernzettel(null);
    }
    setView(view);
  }

  const handleViewProfile = (userId: string) => {
    setViewingProfileId(userId);
    setView('user-profile');
  };

  const handleViewStudySet = (setId: string) => {
    setViewingStudySetId(setId);
    setView('studyset-detail');
  };
  
  const handleViewLernzettel = (id: string) => {
    setViewingLernzettelId(id);
    setView('lernzettel-detail');
  };
  
  const handleNavigateToCreateLernzettel = () => {
    setEditingLernzettel(null);
    setView('lernzettel-create');
  };

  const handleNavigateToEditLernzettel = (lernzettel: Lernzettel) => {
    setEditingLernzettel(lernzettel);
    setView('lernzettel-edit');
  };

  const handleNavigateToCreateStudySet = () => {
    setEditingStudySet(null);
    setView('studyset-create');
  };

  const handleNavigateToEditStudySet = (set: StudySet) => {
    setEditingStudySet(set);
    setView('studyset-edit');
  };

  const handleToggleFollow = async (targetUserId: string) => {
    if (!user || !profile || user.uid === targetUserId) return;

    const currentUserProfileRef = doc(db, 'profiles', user.uid);
    const targetUserProfileRef = doc(db, 'profiles', targetUserId);

    const isFollowing = profile.following?.includes(targetUserId);
    
    const batch = writeBatch(db);

    batch.update(currentUserProfileRef, {
        following: isFollowing ? arrayRemove(targetUserId) : arrayUnion(targetUserId)
    });

    batch.update(targetUserProfileRef, {
        followers: isFollowing ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });

    try {
        await batch.commit();
        toast({ title: isFollowing ? "Nicht mehr gefolgt" : "Gefolgt!", description: `Du folgst diesem Nutzer ${isFollowing ? 'nicht mehr' : 'jetzt'}.` });
    } catch (error) {
        console.error("Error toggling follow:", error);
        toast({ variant: 'destructive', title: 'Fehler', description: 'Aktion konnte nicht ausgeführt werden.' });
    }
  }

  const handleAddSchool = async (name: string, address: string): Promise<string> => {
      const docRef = await addDoc(collection(db, "schools"), { name, address });
      const newSchool = { id: docRef.id, name, address };
      setAllSchools(prev => [...prev, newSchool].sort((a, b) => a.name.localeCompare(b.name)));
      return docRef.id;
  }
  
  const handleLayoutChange = (currentLayout: ReactGridLayout.Layout[], allLayouts: Layouts) => {
      setLayouts(allLayouts);
      saveSetting('dashboardLayouts', allLayouts);
  };
  
  const handleWidgetsChange = (newWidgets: Record<string, boolean>) => {
    setDashboardWidgets(newWidgets);
    saveSetting('dashboardWidgets', newWidgets);
  }

  const sidebarProps = {
    currentView: view,
    onSetView: setAppView,
    userName: userName,
  };
  
  const renderView = () => {
    if (dataLoading && !['community', 'user-profile', 'school-calendar', 'activity'].includes(view)) {
      return <DashboardSkeleton />;
    }
    switch (view) {
      case 'dashboard':
        return (
          <DashboardOverview
            userName={userName}
            overallAverage={overallAverage}
            mainSubjectsAverage={mainSubjectsAverage}
            minorSubjectsAverage={minorSubjectsAverage}
            totalSubjectsCount={totalSubjectsCount}
            totalGradesCount={totalGradesCount}
            plannedGrades={plannedGrades}
            tasks={tasks}
            schoolEvents={schoolEvents}
            subjects={subjectsForGradeLevel}
            onNavigate={setAppView}
            onAddSubject={() => setIsAddSubjectOpen(true)}
            onAddGrade={handleOpenAddGradeDialog}
            onAddTask={() => setIsAddTaskOpen(true)}
            layouts={layouts}
            onLayoutChange={handleLayoutChange}
            visibleWidgets={dashboardWidgets}
            onOpenSettings={() => setDashboardSettingsOpen(true)}
          />
        );
      case 'activity':
          return <ActivityPage activities={activityLogs} />;
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
            onEditGrade={handleOpenEditGradeDialog}
            studySets={studySets}
            onViewStudySet={handleViewStudySet}
            onEditStudySet={handleNavigateToEditStudySet}
            onDeleteStudySet={handleDeleteStudySet}
          />
        );
      case 'planner':
        return (
          <PlannerPage
            timetable={timetable}
            subjects={subjectsForGradeLevel}
            tasks={tasks}
            lernzettel={lernzettel}
            maxPeriods={maxPeriods}
            onSaveEntry={handleSaveTimetableEntry}
            onDeleteEntry={handleDeleteTimetableEntry}
            onSaveTask={handleSaveTask}
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
            onAddSubject={handleAddSubject}
            onToggleLernzettelDone={handleToggleLernzettelDone}
            onDeleteLernzettelDueDate={handleDeleteLernzettelDueDate}
            onViewLernzettel={handleViewLernzettel}
            onShareTimetable={handleShareTimetable}
            onImportTimetable={handleImportTimetable}
          />
        );
      case 'school-calendar':
        const school = allSchools.find(s => s.id === userSchoolId);
        return <SchoolCalendarPage 
            schoolId={userSchoolId}
            schoolName={school?.name || null}
            events={schoolEvents}
            selectedGradeLevel={selectedGradeLevel}
            onAddEvent={(selectedDate) => setSchoolEventDialogState({isOpen: true, selectedDate: selectedDate})}
            onEditEvent={(event) => setSchoolEventDialogState({isOpen: true, eventToEdit: event})}
            onDeleteEvent={handleDeleteSchoolEvent}
        />;
      case 'lernzettel':
        return <LernzettelPage 
            lernzettel={lernzettel}
            subjects={subjectsForGradeLevel}
            onViewLernzettel={handleViewLernzettel}
            onEditLernzettel={handleNavigateToEditLernzettel}
            onDeleteLernzettel={handleDeleteLernzettel}
            onAddNew={handleNavigateToCreateLernzettel}
        />;
      case 'lernzettel-create':
        return <CreateEditLernzettelPage 
            subjects={subjectsForGradeLevel}
            allStudySets={studySets}
            timetable={timetable}
            onBack={() => setView('lernzettel')}
            onSave={handleSaveLernzettel}
        />;
      case 'lernzettel-edit':
        return <CreateEditLernzettelPage 
            lernzettelToEdit={editingLernzettel}
            subjects={subjectsForGradeLevel}
            allStudySets={studySets}
            timetable={timetable}
            onBack={() => setView('lernzettel')}
            onSave={handleSaveLernzettel}
        />;
      case 'lernzettel-detail':
        const lz = lernzettel.find(l => l.id === viewingLernzettelId);
        if (lz) {
          return <LernzettelDetailPage 
            lernzettel={lz}
            onBack={() => setView('lernzettel')}
            onEdit={handleNavigateToEditLernzettel}
            onNavigateToNote={handleViewLernzettel}
            allStudySets={studySets}
            onViewStudySet={handleViewStudySet}
            onCreateStudySetFromAI={handleCreateStudySetFromAI}
          />;
        }
        return null;
      case 'studysets':
        return <StudySetsPage 
            studySets={studySets} 
            subjects={subjectsForGradeLevel}
            onViewStudySet={handleViewStudySet}
            onEditStudySet={handleNavigateToEditStudySet}
            onDeleteStudySet={handleDeleteStudySet}
            onAddNew={handleNavigateToCreateStudySet}
        />;
      case 'studyset-create':
        return <CreateEditStudySetPage 
            subjects={subjectsForGradeLevel}
            onBack={() => { setView('studysets'); }}
            onSave={async (values, id) => {
              await handleSaveStudySet(values, id);
              setView('studysets');
            }}
        />;
      case 'studyset-edit':
        return <CreateEditStudySetPage 
            studySetToEdit={editingStudySet}
            subjects={subjectsForGradeLevel}
            onBack={() => { setView('studysets'); }}
            onSave={async (values, id) => {
              await handleSaveStudySet(values, id);
              setView('studysets');
            }}
        />;
      case 'studyset-detail':
        const set = studySets.find(s => s.id === viewingStudySetId);
        if (set) {
          return <StudySetDetailPage 
            studySet={set}
            onBack={() => setView('studysets')}
            onEditSet={handleNavigateToEditStudySet}
            onSessionFinish={(updatedCards) => handleUpdateStudySetCards(set.id, updatedCards)}
            allLernzettel={lernzettel}
            onViewLernzettel={handleViewLernzettel}
          />;
        }
        return null;
      case 'tutor':
        return (
          <TutorChat
            subjects={subjectsForGradeLevel}
            allGrades={grades}
            studySets={studySets}
          />
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
            files={userFiles}
            subjects={subjectsForGradeLevel}
            grades={grades}
            onCreateFolder={handleCreateFolder}
            onUploadFiles={handleUploadFiles}
            onDeleteItem={handleDeleteFileSystemItem}
          />
        );
      case 'awards':
        return (
          <AwardsPage awards={awards} selectedGradeLevel={selectedGradeLevel} />
        );
      case 'profile':
        return <ProfilePage 
                  profile={profile}
                  onUserNameChange={(name) => {
                      setUserName(name);
                  }}
                  onToggleFollow={onToggleFollow}
                  userRole={userRole}
                  onUserRoleChange={(role) => {
                      setUserRole(role);
                      saveSetting('role', role);
                  }}
                  userSchoolId={userSchoolId}
                  onUserSchoolIdChange={(schoolId) => {
                      setUserSchoolId(schoolId);
                      saveSetting('schoolId', schoolId);
                  }}
                  allSchools={allSchools}
                  onAddSchool={handleAddSchool}
               />;
      case 'community':
        return <CommunityPage 
                  currentUserProfile={profile}
                  onViewProfile={handleViewProfile}
                  onToggleFollow={onToggleFollow}
                  subjects={subjectsForGradeLevel}
                  grades={grades}
               />;
      case 'user-profile':
        if (viewingProfileId) {
            return <UserProfilePage 
                      userId={viewingProfileId} 
                      onBack={() => setView('community')}
                      onToggleFollow={onToggleFollow}
                      currentUserProfile={profile}
                   />
        }
        return null;
      case 'settings':
        return <SettingsPage
            mainSubjectWeight={mainSubjectWeight}
            onMainSubjectWeightChange={(weight) => {
                setMainSubjectWeight(weight);
                saveSetting('mainSubjectWeight', weight);
            }}
            minorSubjectWeight={minorSubjectWeight}
            onMinorSubjectWeightChange={(weight) => {
                setMinorSubjectWeight(weight);
                saveSetting('minorSubjectWeight', weight);
            }}
            maxPeriods={maxPeriods}
            onMaxPeriodsChange={(periods) => {
                setMaxPeriods(periods);
                saveSetting('maxPeriods', periods);
            }}
            theme={theme}
            onThemeChange={(newTheme) => {
                setTheme(newTheme);
                saveSetting('theme', newTheme);
            }}
            isDarkMode={isDarkMode}
            onIsDarkModeChange={(isDark) => {
                setIsDarkMode(isDark);
                saveSetting('isDarkMode', isDark);
            }}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AppSidebar {...sidebarProps} />
      <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 lg:hidden w-80">
          <SheetHeader>
            <SheetTitle className="sr-only">Hauptnavigation</SheetTitle>
            <SheetDescription className="sr-only">
              Navigiere durch die Hauptbereiche der Anwendung.
            </SheetDescription>
          </SheetHeader>
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
            saveSetting('selectedGradeLevel', level);
          }}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onLogout={handleLogout}
          onNavigate={setAppView}
        />
        <main className="p-4 md:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        subjects={subjectsForGradeLevel}
        onNavigate={setAppView}
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
      <AddTaskDialog
        isOpen={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onSubmit={handleSaveTask}
        subjects={subjectsForGradeLevel}
        timetable={timetable}
      />
       <AddSchoolEventDialog 
        isOpen={schoolEventDialogState.isOpen}
        onOpenChange={(isOpen) => setSchoolEventDialogState({ isOpen })}
        onSubmit={handleSaveSchoolEvent}
        eventToEdit={schoolEventDialogState.eventToEdit}
        selectedDate={schoolEventDialogState.selectedDate}
    />
    <DashboardSettingsDialog
        isOpen={isDashboardSettingsOpen}
        onOpenChange={setDashboardSettingsOpen}
        widgets={dashboardWidgets}
        onWidgetChange={handleWidgetsChange}
    />
    </div>
  );
}
