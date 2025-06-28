export type SubjectCategory = "Hauptfach" | "Nebenfach";
export type GradeType = "Schulaufgabe" | "mündliche Note";

export interface Subject {
  id: string;
  name: string;
  category: SubjectCategory;
  gradeLevel: number;
  writtenWeight?: number;
  oralWeight?: number;
}

export interface Grade {
  id: string;
  subjectId: string;
  type: GradeType;
  name?: string;
  value: number;
  weight: number;
  date: string;
  notes?: string;
}

export type AddGradeData = {
  type: GradeType;
  name?: string;
  value: number;
  weight: number;
  notes?: string;
}

export type AddSubjectData = {
  name: string;
  category: SubjectCategory;
};
