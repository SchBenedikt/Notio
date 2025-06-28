"use client";

import { useState, useMemo } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { Subject, Grade, SubjectCategory, AddSubjectData, AddGradeData } from "@/lib/types";
import { AppHeader } from "./header";
import { AddSubjectDialog } from "./add-subject-dialog";
import { SubjectList } from "./subject-list";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>("noten-meister-subjects", []);
  const [grades, setGrades] = useLocalStorage<Grade[]>("noten-meister-grades", []);
  const [selectedGradeLevel, setSelectedGradeLevel] = useLocalStorage<number>("noten-meister-grade-level", 10);
  
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const { toast } = useToast();

  const filteredSubjects = useMemo(() => {
    return subjects
      .filter((s) => s.gradeLevel === selectedGradeLevel)
      .sort((a, b) => {
        if (a.category === 'Hauptfach' && b.category !== 'Hauptfach') return -1;
        if (a.category !== 'Hauptfach' && b.category === 'Hauptfach') return 1;
        return a.name.localeCompare(b.name);
      });
  }, [subjects, selectedGradeLevel]);

  const handleAddSubject = (values: AddSubjectData) => {
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      gradeLevel: selectedGradeLevel,
      ...values,
    };
    setSubjects([...subjects, newSubject]);
    toast({
      title: "Fach hinzugefügt",
      description: `Das Fach "${newSubject.name}" wurde erfolgreich erstellt.`,
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
    <>
      <AppHeader 
        selectedGradeLevel={selectedGradeLevel}
        onGradeLevelChange={setSelectedGradeLevel}
        onAddSubject={() => setIsAddSubjectOpen(true)}
      />
      <main className="container mx-auto p-4 md:p-6">
        <SubjectList
          subjects={filteredSubjects}
          grades={grades}
          onAddGrade={handleAddGrade}
          onDeleteGrade={handleDeleteGrade}
          onDeleteSubject={handleDeleteSubject}
          onAddSubject={() => setIsAddSubjectOpen(true)}
        />
      </main>
      <AddSubjectDialog 
        isOpen={isAddSubjectOpen}
        onOpenChange={setIsAddSubjectOpen}
        onSubmit={handleAddSubject}
      />
    </>
  );
}
