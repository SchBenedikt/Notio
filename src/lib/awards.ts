import type { Subject, Grade, StudySet, Lernzettel, Task } from './types';
import { Award as AwardIcon, Star, Target, BookCopy, ClipboardList, TrendingUp, Shield, FileArchive, CheckCircle, Notebook, BrainCircuit, ListChecks } from 'lucide-react';
import { calculateFinalGrade } from '@/lib/utils';

type AwardCheckResult = {
    unlocked: boolean;
    progress?: {
        current: number;
        target: number;
    }
}

type AwardDefinition = {
    id: string;
    name: string;
    description: string;
    secretDescription: string;
    icon: React.ComponentType<{ className?: string }>;
    tier: 'bronze' | 'silver' | 'gold' | 'special';
    isRepeatable?: boolean;
    check: (
        subjects: Subject[], 
        grades: Grade[], 
        overallAverage: string,
        studySets: StudySet[],
        lernzettel: Lernzettel[],
        tasks: Task[],
    ) => AwardCheckResult;
}

export const awardsDefinitions: AwardDefinition[] = [
    // --- ONBOARDING AWARDS ---
    {
        id: 'first_subject',
        name: 'Aller Anfang',
        description: 'Du hast dein erstes Fach angelegt. Super!',
        secretDescription: 'Lege dein erstes Fach an.',
        icon: BookCopy,
        tier: 'bronze',
        check: (subjects) => ({ unlocked: subjects.length > 0, progress: { current: subjects.length, target: 1 } }),
    },
    {
        id: 'first_grade',
        name: 'Notensammler',
        description: 'Die erste Note ist eingetragen. Weiter so!',
        secretDescription: 'Trage deine erste Note ein.',
        icon: ClipboardList,
        tier: 'bronze',
        check: (_, grades) => ({ unlocked: grades.length > 0, progress: { current: grades.length, target: 1 } }),
    },
    {
        id: 'first_attachment',
        name: 'Digitaler Pionier',
        description: 'Du hast deine erste Datei an eine Note angehängt. Perfekt für die Organisation!',
        secretDescription: 'Hänge eine Datei an eine Note an.',
        icon: FileArchive,
        tier: 'bronze',
        check: (_, grades) => ({ unlocked: grades.some(g => g.attachments && g.attachments.length > 0) }),
    },
    {
        id: 'first_studyset',
        name: 'Kartenspieler',
        description: 'Dein erstes Lernset ist erstellt. Viel Erfolg beim Üben!',
        secretDescription: 'Erstelle dein erstes Lernset.',
        icon: BrainCircuit,
        tier: 'bronze',
        check: (subjects, grades, avg, studySets) => ({ unlocked: studySets.length > 0, progress: { current: studySets.length, target: 1 } }),
    },
    {
        id: 'first_lernzettel',
        name: 'Wissens-Grundstein',
        description: 'Dein erster Lernzettel ist geschrieben. Perfekt, um Wissen festzuhalten.',
        secretDescription: 'Erstelle deinen ersten Lernzettel.',
        icon: Notebook,
        tier: 'bronze',
        check: (subjects, grades, avg, studySets, lernzettel) => ({ unlocked: lernzettel.length > 0, progress: { current: lernzettel.length, target: 1 } }),
    },
    {
        id: 'first_task',
        name: 'Planungs-Genie',
        description: 'Du hast deine erste Aufgabe im Planer erstellt. Gut organisiert ist halb gelernt!',
        secretDescription: 'Erstelle deine erste Aufgabe (Hausaufgabe oder To-Do).',
        icon: ListChecks,
        tier: 'bronze',
        check: (subjects, grades, avg, studySets, lernzettel, tasks) => ({ unlocked: tasks.length > 0, progress: { current: tasks.length, target: 1 } }),
    },
    // --- QUANTITY AWARDS (Leveled) ---
    {
        id: 'grades_10',
        name: 'Eifriger Schüler',
        description: 'Du hast schon 10 Noten eingetragen. Beeindruckend!',
        secretDescription: 'Trage insgesamt 10 Noten ein.',
        icon: ClipboardList,
        tier: 'bronze',
        check: (_, grades) => ({ unlocked: grades.length >= 10, progress: { current: grades.length, target: 10 } }),
    },
    {
        id: 'grades_25',
        name: 'Noten-Virtuose',
        description: 'Wow, 25 Noten! Du meisterst dein Schuljahr.',
        secretDescription: 'Trage insgesamt 25 Noten ein.',
        icon: ClipboardList,
        tier: 'silver',
        check: (_, grades) => ({ unlocked: grades.length >= 25, progress: { current: grades.length, target: 25 } }),
    },
    {
        id: 'grades_50',
        name: 'Noten-Legende',
        description: '50 Noten! Deine Disziplin ist unübertroffen.',
        secretDescription: 'Trage insgesamt 50 Noten ein.',
        icon: ClipboardList,
        tier: 'gold',
        check: (_, grades) => ({ unlocked: grades.length >= 50, progress: { current: grades.length, target: 50 } }),
    },
    {
        id: 'subjects_5',
        name: 'Fächer-Kenner',
        description: 'Stark! Du hast bereits 5 Fächer erstellt.',
        secretDescription: 'Lege insgesamt 5 Fächer an.',
        icon: BookCopy,
        tier: 'bronze',
        check: (subjects) => ({ unlocked: subjects.length >= 5, progress: { current: subjects.length, target: 5 } }),
    },
    {
        id: 'subjects_10',
        name: 'Fächer-Experte',
        description: 'Über 10 Fächer im Blick. Du bist ein Organisationstalent!',
        secretDescription: 'Lege insgesamt 10 Fächer an.',
        icon: BookCopy,
        tier: 'silver',
        check: (subjects) => ({ unlocked: subjects.length >= 10, progress: { current: subjects.length, target: 10 } }),
    },
    {
        id: 'studysets_5',
        name: 'Karten-Hai',
        description: 'Du hast schon 5 Lernsets erstellt. Übung macht den Meister!',
        secretDescription: 'Erstelle 5 verschiedene Lernsets.',
        icon: BrainCircuit,
        tier: 'silver',
        check: (subjects, grades, avg, studySets) => ({ unlocked: studySets.length >= 5, progress: { current: studySets.length, target: 5 } }),
    },
     {
        id: 'lernzettel_10',
        name: 'Wissens-Architekt',
        description: '10 Lernzettel! Dein persönliches Lexikon wächst und wächst.',
        secretDescription: 'Erstelle 10 verschiedene Lernzettel.',
        icon: Notebook,
        tier: 'silver',
        check: (subjects, grades, avg, studySets, lernzettel) => ({ unlocked: lernzettel.length >= 10, progress: { current: lernzettel.length, target: 10 } }),
    },
    // --- PERFORMANCE AWARDS ---
    {
        id: 'first_one',
        name: 'Spitzenleistung',
        description: 'Eine 1 erzielt. Das ist eine Feier wert!',
        secretDescription: 'Erziele eine 1 in einer Prüfung.',
        icon: Star,
        tier: 'silver',
        isRepeatable: true,
        check: (_, grades) => {
            const count = grades.filter(g => g.value === 1).length;
            return { unlocked: count > 0, progress: { current: count, target: 1 } };
        },
    },
    {
        id: 'main_subject_one',
        name: 'Hauptfach-Held',
        description: 'Eine 1 in einem Hauptfach erzielt. Das ist die Königsklasse!',
        secretDescription: 'Erziele eine 1 in einem Hauptfach.',
        icon: AwardIcon,
        tier: 'gold',
        isRepeatable: true,
        check: (subjects, grades) => {
            const mainSubjectIds = subjects.filter(s => s.category === 'Hauptfach').map(s => s.id);
            const count = grades.filter(g => g.value === 1 && mainSubjectIds.includes(g.subjectId)).length;
            return { unlocked: count > 0, progress: { current: count, target: 1 } };
        },
    },
    {
        id: 'good_average',
        name: 'Schnitt-Champion',
        description: 'Dein Gesamtschnitt ist besser als 2,0. Fantastisch!',
        secretDescription: 'Erreiche einen Gesamtschnitt von 2,0 oder besser.',
        icon: Target,
        tier: 'silver',
        check: (_, __, overallAverage) => {
            if (overallAverage === '-') return { unlocked: false };
            const avg = parseFloat(overallAverage);
            return { unlocked: !isNaN(avg) && avg < 2.0 };
        },
    },
    {
        id: 'excellent_average',
        name: 'Einser-Kandidat',
        description: 'Dein Gesamtschnitt ist besser als 1,5. Herausragend!',
        secretDescription: 'Erreiche einen Gesamtschnitt von 1,5 oder besser.',
        icon: Target,
        tier: 'gold',
        check: (_, __, overallAverage) => {
            if (overallAverage === '-') return { unlocked: false };
            const avg = parseFloat(overallAverage);
            return { unlocked: !isNaN(avg) && avg < 1.5 };
        },
    },
     {
        id: 'subject_ace',
        name: 'Fach-Ass',
        description: 'Du hast in einem Fach einen Schnitt, der besser als 2,0 ist.',
        secretDescription: 'Erreiche in einem Fach einen Schnitt von unter 2,0.',
        icon: TrendingUp,
        tier: 'silver',
        check: (subjects, grades) => {
            const isUnlocked = subjects.some(s => {
                const subjectGrades = grades.filter(g => g.subjectId === s.id);
                if (subjectGrades.length === 0) return false;
                const avgStr = calculateFinalGrade(subjectGrades, s);
                if (avgStr === '-') return false;
                const avg = parseFloat(avgStr);
                return !isNaN(avg) && avg < 2.0;
            });
            return { unlocked: isUnlocked };
        },
    },
    {
        id: 'perfectionist',
        name: 'Perfektionist',
        description: 'Du hast in einem Fach einen glatten 1,0-Schnitt. Unglaublich!',
        secretDescription: 'Erreiche in einem Fach einen Schnitt von 1,0.',
        icon: CheckCircle,
        tier: 'gold',
        check: (subjects, grades) => {
            const isUnlocked = subjects.some(s => {
                const subjectGrades = grades.filter(g => g.subjectId === s.id);
                if (subjectGrades.length === 0) return false;
                const avgStr = calculateFinalGrade(subjectGrades, s);
                if (avgStr === '-') return false;
                const avg = parseFloat(avgStr);
                return !isNaN(avg) && avg === 1.0;
            });
            return { unlocked: isUnlocked };
        },
    },
    {
        id: 'solid_foundation',
        name: 'Solide Basis',
        description: 'Du hast keine Note, die schlechter als eine 4 ist. Starke Konstanz!',
        secretDescription: 'Habe keine Note, die schlechter als 4 ist (mind. 5 Noten nötig).',
        icon: Shield,
        tier: 'silver',
        check: (_, grades) => {
            if (grades.length < 5) return { unlocked: false, progress: {current: grades.length, target: 5} };
            return { unlocked: !grades.some(g => g.value != null && g.value > 4) };
        },
    },
];
