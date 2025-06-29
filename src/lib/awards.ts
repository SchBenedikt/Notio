import type { Subject, Grade } from './types';
import { Award as AwardIcon, Star, Target, BookCopy, ClipboardList } from 'lucide-react';

type AwardDefinition = {
    id: string;
    name: string;
    description: string;
    secretDescription: string;
    icon: React.ComponentType<{ className?: string }>;
    check: (subjects: Subject[], grades: Grade[], overallAverage: string) => boolean;
}

export const awardsDefinitions: AwardDefinition[] = [
    {
        id: 'first_subject',
        name: 'Aller Anfang',
        description: 'Du hast dein erstes Fach angelegt. Super!',
        secretDescription: 'Lege dein erstes Fach an.',
        icon: BookCopy,
        check: (subjects) => subjects.length > 0,
    },
    {
        id: 'first_grade',
        name: 'Notensammler',
        description: 'Die erste Note ist eingetragen. Weiter so!',
        secretDescription: 'Trage deine erste Note ein.',
        icon: ClipboardList,
        check: (_, grades) => grades.length > 0,
    },
    {
        id: 'five_subjects',
        name: 'Fächer-Profi',
        description: 'Stark! Du hast bereits 5 Fächer erstellt.',
        secretDescription: 'Lege insgesamt 5 Fächer an.',
        icon: BookCopy,
        check: (subjects) => subjects.length >= 5,
    },
    {
        id: 'ten_grades',
        name: 'Noten-Jongleur',
        description: 'Du hast schon 10 Noten eingetragen. Beeindruckend!',
        secretDescription: 'Trage insgesamt 10 Noten ein.',
        icon: ClipboardList,
        check: (_, grades) => grades.length >= 10,
    },
    {
        id: 'first_one',
        name: 'Spitzenleistung',
        description: 'Wow! Deine erste 1. Das ist eine Feier wert.',
        secretDescription: 'Erziele eine 1 in einer Prüfung.',
        icon: Star,
        check: (_, grades) => grades.some(g => g.value === 1),
    },
    {
        id: 'main_subject_one',
        name: 'Hauptfach-Held',
        description: 'Eine 1 in einem Hauptfach. Das ist die Königsklasse!',
        secretDescription: 'Erziele eine 1 in einem Hauptfach.',
        icon: AwardIcon,
        check: (subjects, grades) => {
            const mainSubjectIds = subjects.filter(s => s.category === 'Hauptfach').map(s => s.id);
            return grades.some(g => g.value === 1 && mainSubjectIds.includes(g.subjectId));
        },
    },
    {
        id: 'good_average',
        name: 'Schnitt-Champion',
        description: 'Dein Gesamtschnitt ist besser als 1,5. Fantastisch!',
        secretDescription: 'Erreiche einen Gesamtschnitt von 1,5 oder besser.',
        icon: Target,
        check: (_, __, overallAverage) => {
            if (overallAverage === '-') return false;
            const avg = parseFloat(overallAverage);
            return !isNaN(avg) && avg < 1.5;
        },
    }
];
