import type { Timestamp } from "firebase/firestore";

export interface Attachment {
  name: string;
  dataUrl: string;
}

export type SubjectCategory = "Hauptfach" | "Nebenfach";
export type GradeType = "Schulaufgabe" | "mündliche Note";

export interface Subject {
  id: string;
  name: string;
  category: SubjectCategory;
  gradeLevel: number;
  writtenWeight?: number;
  oralWeight?: number;
  targetGrade?: number;
}

export interface Grade {
  id:string;
  subjectId: string;
  type: GradeType;
  name?: string;
  value?: number;
  weight: number;
  date: string;
  notes?: string;
  attachments?: Attachment[];
}

export type AddGradeData = {
  date: Date;
  type: GradeType;
  name?: string;
  value?: number;
  weight: number;
  notes?: string;
  attachments?: Attachment[];
}

export type AddSubjectData = {
  name: string;
  category: SubjectCategory;
  targetGrade?: number;
};

export interface Profile {
  uid: string;
  name: string;
  email: string;
  bio?: string;
  following?: string[];
  followers?: string[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Timestamp;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  likes: string[];
  commentCount: number;
  createdAt: Timestamp;
  attachments?: Attachment[];
}

export interface Award {
  id: string;
  name: string;
  description: string;
  secretDescription: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'special';
  isRepeatable?: boolean;
  progress?: {
    current: number;
    target: number;
  };
}

export interface StudyCard {
  id: string;
  term: string;
  definition: string;
}

export interface StudySet {
  id: string;
  title: string;
  description?: string;
  cards: StudyCard[];
  gradeLevel: number;
  subjectId?: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

// New types for the "Test" mode
export interface MultipleChoiceTestQuestion {
    type: 'multiple-choice';
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}
export interface WrittenTestQuestion {
    type: 'written';
    question: string; // The definition
    correctAnswer: string; // The term
    explanation: string;
}
export interface TrueFalseTestQuestion {
    type: 'true-false';
    statement: string;
    correctAnswer: 'Wahr' | 'Falsch';
    explanation: string;
}
export type TestQuestion = MultipleChoiceTestQuestion | WrittenTestQuestion | TrueFalseTestQuestion;


export interface School {
  id: string;
  name: string;
  address?: string;
}

export type SchoolEventType = "Prüfung" | "Hausaufgabe" | "Ferien" | "Veranstaltung" | "Sonstiges";

export interface SchoolEvent {
  id: string;
  schoolId: string;
  authorId: string;
  authorName: string;
  title: string;
  description?: string;
  date: string; // ISO String
  type: SchoolEventType;
  target: 'school' | 'gradeLevel';
  gradeLevel?: number; // Only if target is 'gradeLevel'
  createdAt: Timestamp;
}


export interface FileSystemItem {
  id: string;
  name: string;
  parentId: string | null;
  type: 'folder' | 'file';
  createdAt: Timestamp;
  isReadOnly?: boolean;
  // file-specific
  dataUrl?: string;
  size?: number; // in bytes
  fileType?: string; // MIME type
}

export interface TimetableEntry {
  id: string;
  day: number; // 0 for Monday, 4 for Friday
  period: number;
  subjectId: string;
  room?: string;
}

export interface Homework {
  id: string;
  subjectId: string;
  task: string;
  dueDate: string; // ISO String
  isDone: boolean;
  createdAt: Timestamp;
}


export type AppView = 'dashboard' | 'subjects' | 'tutor' | 'calculator' | 'data' | 'files' | 'awards' | 'profile' | 'community' | 'user-profile' | 'settings' | 'studysets' | 'studyset-detail' | 'studyset-create' | 'studyset-edit' | 'timetable' | 'school-calendar';
