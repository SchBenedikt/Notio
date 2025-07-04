import type { Timestamp } from "firebase/firestore";
import type { LucideIcon } from "lucide-react";

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
  writtenWeight?: number | null;
  oralWeight?: number | null;
  targetGrade?: number | null;
}

export interface Grade {
  id:string;
  subjectId: string;
  type: GradeType;
  name?: string | null;
  value?: number | null;
  weight: number;
  date: string;
  notes?: string | null;
  attachments?: Attachment[] | null;
  achievedPoints?: number | null;
  maxPoints?: number | null;
  classAverage?: number | null;
  gradeDistribution?: Record<string, number> | null; // e.g., { "1": 5, "2": 10, ... }
  gradingScale?: Record<string, number> | null; // e.g., { "1": 92, "2": 81, ... }
}

export type AddGradeData = {
  date: Date;
  type: GradeType;
  name?: string | null;
  value?: number | null;
  weight: number;
  notes?: string | null;
  attachments?: Attachment[] | null;
  achievedPoints?: number | null;
  maxPoints?: number | null;
  classAverage?: number | null;
  gradeDistribution?: Record<string, number> | null;
  gradingScale?: Record<string, number> | null;
}

export type AddSubjectData = {
  name: string;
  category: SubjectCategory;
  targetGrade?: number;
};

export interface Profile {
  uid: string;
  name: string;
  name_lowercase: string;
  email: string;
  bio?: string | null;
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
  studySetRef?: {
    id: string;
    title: string;
    cardCount: number;
  };
  lernzettelRef?: {
    id: string;
    title: string;
  };
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
  srs?: {
    interval: number; // in days
    easeFactor: number;
    repetitions: number;
    lastReviewed: string; // ISO date string
  };
}

export interface StudySet {
  id: string;
  title: string;
  description?: string | null;
  cards: StudyCard[];
  gradeLevel: number;
  subjectId?: string | null;
  isFavorite?: boolean;
}

export interface Lernzettel {
  id: string;
  title: string;
  content: string; // Markdown
  summary?: string | null;
  subjectId?: string | null;
  studySetIds?: string[] | null;
  gradeLevel: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  dueDate?: string | null; // ISO String
  isDone?: boolean | null;
  isFavorite?: boolean;
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
  description?: string | null;
  date: string; // ISO String for start date
  endDate?: string | null; // Optional ISO String for end date
  type: SchoolEventType;
  target: 'school' | 'gradeLevel';
  gradeLevel?: number | null; // Only if target is 'gradeLevel'
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
  room?: string | null;
}

export type TaskType = 'homework' | 'todo';
export interface Task {
  id: string;
  subjectId: string;
  type: TaskType;
  content: string;
  dueDate?: string | null; // ISO String
  isDone: boolean;
  createdAt: Timestamp;
}

export type ActivityType = 
    | 'SUBJECT_CREATED' 
    | 'SUBJECT_DELETED'
    | 'GRADE_ADDED' 
    | 'GRADE_DELETED'
    | 'GRADE_PLANNED'
    | 'STUDY_SET_CREATED'
    | 'STUDY_SET_LEARNED'
    | 'LERNZETTEL_CREATED'
    | 'LERNZETTEL_EDITED'
    | 'TASK_CREATED'
    | 'TASK_COMPLETED'
    | 'DATA_IMPORTED'
    | 'TIMETABLE_IMPORTED'

export interface ActivityLog {
    id: string;
    type: ActivityType;
    timestamp: Timestamp;
    description: string;
    icon: string; // Lucide icon name
    details?: Record<string, any>;
}

export type AppView = 'dashboard' | 'subjects' | 'tutor' | 'calculator' | 'data' | 'files' | 'awards' | 'profile' | 'community' | 'user-profile' | 'settings' | 'studysets' | 'studyset-detail' | 'studyset-create' | 'studyset-edit' | 'planner' | 'school-calendar' | 'lernzettel' | 'lernzettel-create' | 'lernzettel-edit' | 'lernzettel-detail' | 'activity';
