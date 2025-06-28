"use client";

import { useState, useMemo } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { Subject, Grade, AddSubjectData, AddGradeData } from "@/lib/types";
import { AppHeader } from "./header";
import { AddSubjectDialog } from "./add-subject-dialog";
import { SubjectList } from "./subject-list";
import { useToast } from "@/hooks/use-toast";
import { calculateOverallAverage } from "@/lib/utils";

export default function Dashboard() {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>("noten-meister-subjects", []);
  const [grades, setGrades] = useLocalStorage<Grade[]>("noten-meister-grades", []);
  const [selectedGradeLevel, setSelectedGradeLevel] = useLocalStorage<number>("noten-meister-grade-level", 10);
  const [mainSubjectWeight, setMainSubjectWeight] = useLocalStorage<number>("noten-meister-main-weight", 2);
  const [minorSubjectWeight, setMinorSubjectWeight] = useLocalStorage<number>("noten-meister-minor-weight", 1);
  
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const { toast } = useToast();

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => s.gradeLevel === selectedGradeLevel);
  }, [subjects, selectedGradeLevel]);

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
        overallAverage={overallAverage}
        mainSubjectWeight={mainSubjectWeight}
        onMainSubjectWeightChange={setMainSubjectWeight}
        minorSubjectWeight={minorSubjectWeight}
        onMinorSubjectWeightChange={setMinorSubjectWeight}
      />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <SubjectList
          mainSubjects={mainSubjects}
          minorSubjects={minorSubjects}
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
