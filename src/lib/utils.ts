import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Grade, type Subject, GradeType } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function getGradeSums(grades: Grade[]) {
  const sums = {
    written: { value: 0, weight: 0 },
    oral: { value: 0, weight: 0 },
  };

  for (const grade of grades) {
    const weightedValue = grade.value * grade.weight;
    if (grade.type === 'Schulaufgabe') {
      sums.written.value += weightedValue;
      sums.written.weight += grade.weight;
    } else {
      sums.oral.value += weightedValue;
      sums.oral.weight += grade.weight;
    }
  }
  return sums;
}


export function calculateFinalGrade(grades: Grade[], subject: Subject): string {
    if (grades.length === 0) {
      return "-";
    }

    const sums = getGradeSums(grades);

    // New logic for subjects with specific written/oral weighting (typically main subjects)
    if (subject.category === 'Hauptfach' && subject.writtenWeight != null && subject.oralWeight != null && (subject.writtenWeight > 0 || subject.oralWeight > 0)) {
        const { written, oral } = sums;
        const writtenAverage = written.weight > 0 ? written.value / written.weight : 0;
        const oralAverage = oral.weight > 0 ? oral.value / oral.weight : 0;

        const hasWrittenGrades = written.weight > 0;
        const hasOralGrades = oral.weight > 0;

        const writtenWeight = subject.writtenWeight;
        const oralWeight = subject.oralWeight;

        if (hasWrittenGrades && hasOralGrades) {
            const totalWeight = writtenWeight + oralWeight;
            if (totalWeight > 0) {
              const finalGrade = (writtenAverage * writtenWeight + oralAverage * oralWeight) / totalWeight;
              return finalGrade.toFixed(2);
            }
        } else if (hasWrittenGrades) {
            return writtenAverage.toFixed(2);
        } else if (hasOralGrades) {
            return oralAverage.toFixed(2);
        } else {
            return "-";
        }
    }

    // Fallback to old logic (sum of all weighted grades)
    const totalWeightedValue = sums.written.value + sums.oral.value;
    const totalWeight = sums.written.weight + sums.oral.weight;

    if (totalWeight === 0) {
        return "-";
    }

    const finalGrade = totalWeightedValue / totalWeight;
    return finalGrade.toFixed(2);
}


export function calculateOverallAverage(
    subjects: Subject[], 
    grades: Grade[],
    mainSubjectWeight: number,
    minorSubjectWeight: number
): string {
    const subjectAverages: { average: number; weight: number }[] = [];

    subjects.forEach(subject => {
        const subjectGrades = grades.filter(g => g.subjectId === subject.id);
        if (subjectGrades.length > 0) {
            const finalGradeStr = calculateFinalGrade(subjectGrades, subject);
            if (finalGradeStr !== '-') {
                const finalGrade = parseFloat(finalGradeStr.replace(',', '.'));
                const weight = subject.category === 'Hauptfach' ? mainSubjectWeight : minorSubjectWeight;
                if(weight > 0) {
                  subjectAverages.push({ average: finalGrade, weight });
                }
            }
        }
    });

    if (subjectAverages.length === 0) {
        return "-";
    }

    const totalWeightedValue = subjectAverages.reduce(
        (sum, item) => sum + item.average * item.weight,
        0
    );
    const totalWeight = subjectAverages.reduce((sum, item) => sum + item.weight, 0);

    if (totalWeight === 0) {
        return "-";
    }

    const overallAverage = totalWeightedValue / totalWeight;
    return overallAverage.toFixed(2);
}

export function calculateCategoryAverage(
    subjects: Subject[], 
    grades: Grade[]
): string {
    if (subjects.length === 0) {
        return "-";
    }
    
    const subjectFinalGrades = subjects.map(subject => {
        const subjectGrades = grades.filter(g => g.subjectId === subject.id);
        if (subjectGrades.length === 0) return null;
        const finalGradeStr = calculateFinalGrade(subjectGrades, subject);
        return finalGradeStr !== '-' ? parseFloat(finalGradeStr) : null;
    }).filter(g => g !== null) as number[];

    if (subjectFinalGrades.length === 0) {
        return "-";
    }

    const average = subjectFinalGrades.reduce((sum, grade) => sum + grade, 0) / subjectFinalGrades.length;
    return average.toFixed(2);
}


export function calculateGradeForTarget(
  grades: Grade[],
  subject: Subject,
  targetAverage: number,
  newGradeWeight: number,
  newGradeType: GradeType
): number | null {
  if (newGradeWeight <= 0) return null;

  const sums = getGradeSums(grades);

  // Nebenfach or subject without special weighting
  if (subject.category !== 'Hauptfach' || subject.writtenWeight == null || subject.oralWeight == null) {
    const currentSum = sums.written.value + sums.oral.value;
    const currentWeight = sums.written.weight + sums.oral.weight;
    const requiredGrade = (targetAverage * (currentWeight + newGradeWeight) - currentSum) / newGradeWeight;
    return requiredGrade;
  }

  // Hauptfach with special weighting
  const Ww = subject.writtenWeight;
  const Ow = subject.oralWeight;

  if (Ww + Ow <= 0) return null; // Avoid division by zero

  const CWS = sums.written.value;
  const CWW = sums.written.weight;
  const COS = sums.oral.value;
  const COW = sums.oral.weight;

  const oralAvg = COW > 0 ? COS / COW : 0;
  const writtenAvg = CWW > 0 ? CWS / CWW : 0;

  let requiredGrade;

  if (newGradeType === 'Schulaufgabe') {
     if (Ww <= 0) { // If written grades have no weight, can't influence average with a written grade
        if (oralAvg > 0) return targetAverage <= oralAvg ? 1.0 : 6.0; // If oral grades exist, check if target is already met
        return targetAverage; // If no grades exist at all
     }
    
    let targetWrittenAvg;
    if (COW > 0) {
        targetWrittenAvg = (targetAverage * (Ww + Ow) - oralAvg * Ow) / Ww;
    } else {
        targetWrittenAvg = targetAverage;
    }
    requiredGrade = (targetWrittenAvg * (CWW + newGradeWeight) - CWS) / newGradeWeight;
  } else { // 'mündliche Note'
    if (Ow <= 0) { // If oral grades have no weight
        if (writtenAvg > 0) return targetAverage <= writtenAvg ? 1.0 : 6.0;
        return targetAverage;
    }

    let targetOralAvg;
    if (CWW > 0) {
        targetOralAvg = (targetAverage * (Ww + Ow) - writtenAvg * Ww) / Ow;
    } else {
        targetOralAvg = targetAverage;
    }
    requiredGrade = (targetOralAvg * (COW + newGradeWeight) - COS) / newGradeWeight;
  }

  return requiredGrade;
}


function escapeCsvField(field: any): string {
  const str = String(field ?? '');
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCSV(subjects: Subject[], grades: Grade[]): string {
  const headers = [
    'Fachname',
    'Kategorie',
    'Notentyp',
    'Bezeichnung',
    'Note',
    'Gewichtung',
    'Datum',
    'Notizen',
  ].map(escapeCsvField);

  const rows = grades.map(grade => {
    const subject = subjects.find(s => s.id === grade.subjectId);
    if (!subject) return null;

    return [
      subject.name,
      subject.category,
      grade.type,
      grade.name || '',
      grade.value,
      grade.weight,
      new Date(grade.date).toLocaleDateString('de-DE'),
      grade.notes || '',
    ].map(escapeCsvField).join(',');
  }).filter(row => row !== null) as string[];

  return [headers.join(','), ...rows].join('\n');
}
