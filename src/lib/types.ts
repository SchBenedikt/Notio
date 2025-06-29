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
  value: number;
  weight: number;
  date: string;
  notes?: string;
  attachments?: Attachment[];
}

export type AddGradeData = {
  date: Date;
  type: GradeType;
  name?: string;
  value: number;
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

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  likes: string[];
  createdAt: any;
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

export type AppView = 'subjects' | 'tutor' | 'calculator' | 'data' | 'files' | 'awards' | 'profile' | 'community' | 'user-profile';
