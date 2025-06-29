import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Grade, type Subject, GradeType, SubjectCategory } from "@/lib/types";
import { addDoc, collection, doc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function getGradeSums(grades: Grade[]) {
  const sums = {
    written: { value: 0, weight: 0 },
    oral: { value: 0, weight: 0 },
  };

  for (const grade of grades) {
    if (grade.value == null) continue;
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
    const gradedEntries = grades.filter(g => g.value != null);
    if (gradedEntries.length === 0) {
      return "-";
    }

    const sums = getGradeSums(gradedEntries);

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

  const gradedEntries = grades.filter(g => g.value != null);
  const sums = getGradeSums(gradedEntries);

  if (subject.category !== 'Hauptfach' || subject.writtenWeight == null || subject.oralWeight == null) {
    const currentSum = sums.written.value + sums.oral.value;
    const currentWeight = sums.written.weight + sums.oral.weight;
    const requiredGrade = (targetAverage * (currentWeight + newGradeWeight) - currentSum) / newGradeWeight;
    return requiredGrade;
  }

  const Ww = subject.writtenWeight;
  const Ow = subject.oralWeight;

  if (Ww + Ow <= 0) return null;

  const CWS = sums.written.value;
  const CWW = sums.written.weight;
  const COS = sums.oral.value;
  const COW = sums.oral.weight;

  const oralAvg = COW > 0 ? COS / COW : 0;
  const writtenAvg = CWW > 0 ? CWS / CWW : 0;

  let requiredGrade;

  if (newGradeType === 'Schulaufgabe') {
     if (Ww <= 0) {
        if (oralAvg > 0) return targetAverage <= oralAvg ? 1.0 : 6.0;
        return targetAverage;
     }
    
    let targetWrittenAvg;
    if (COW > 0) {
        targetWrittenAvg = (targetAverage * (Ww + Ow) - oralAvg * Ow) / Ww;
    } else {
        targetWrittenAvg = targetAverage;
    }
    requiredGrade = (targetWrittenAvg * (CWW + newGradeWeight) - CWS) / newGradeWeight;
  } else {
    if (Ow <= 0) {
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

const csvRegex = /(?:,|^)("(?:[^"]|"")*"|[^,]*)/g;

function parseCsvLine(line: string): string[] {
    const fields = [];
    let match;
    csvRegex.lastIndex = 0; 
    while ((match = csvRegex.exec(line))) {
        let field = match[1];
        if (field.startsWith('"') && field.endsWith('"')) {
            field = field.substring(1, field.length - 1).replace(/""/g, '"');
        }
        fields.push(field);
    }
    return fields;
}

export async function importDataFromCSV(
    csvContent: string,
    currentSubjects: Subject[],
    currentGrades: Grade[],
    gradeLevel: number,
    userId: string
): Promise<{ newSubjects: Subject[], newGrades: Grade[], importedCount: number, skippedCount: number }> {
    const subjectsMap = new Map(currentSubjects.map(s => [s.name.toLowerCase(), s]));
    const newSubjects: Subject[] = [...currentSubjects];
    const newGrades: Grade[] = [...currentGrades];
    const lines = csvContent.split(/\r?\n/).slice(1);

    let importedCount = 0;
    let skippedCount = 0;
    
    const batch = writeBatch(db);
    const gradesToAdd = [];

    for (const line of lines) {
        if (line.trim() === '') continue;
        
        const [subjectName, category, type, name, valueStr, weightStr, dateStr, notes] = parseCsvLine(line);

        if (!subjectName || !category || !type || !valueStr || !weightStr || !dateStr) {
            console.warn("Skipping invalid CSV line:", line);
            skippedCount++;
            continue;
        }
        
        const value = parseFloat(valueStr);
        const weight = parseFloat(weightStr);
        const dateParts = dateStr.split('.');
        const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);

        if (isNaN(value) || isNaN(weight) || isNaN(date.getTime())) {
            console.warn("Skipping line with invalid data:", line);
            skippedCount++;
            continue;
        }

        let subject = subjectsMap.get(subjectName.toLowerCase());
        let isNewSubject = false;
        if (!subject) {
            const newSubjectData = {
                gradeLevel,
                name: subjectName,
                category: category as SubjectCategory,
            };
            const subjectDocRef = doc(collection(db, 'users', userId, 'subjects'));
            batch.set(subjectDocRef, newSubjectData);
            subject = { id: subjectDocRef.id, ...newSubjectData };
            subjectsMap.set(subjectName.toLowerCase(), subject);
            newSubjects.push(subject);
            isNewSubject = true;
        }
        
        const newGradeData = {
            subjectId: subject.id,
            type: type as GradeType,
            name: name || undefined,
            value,
            weight,
            date: date.toISOString(), 
            notes: notes || undefined,
        };

        const gradeExists = currentGrades.some(g => 
            g.subjectId === newGradeData.subjectId &&
            g.value === newGradeData.value &&
            g.weight === newGradeData.weight &&
            new Date(g.date).toDateString() === new Date(newGradeData.date).toDateString() &&
            (g.name || '') === (newGradeData.name || '')
        );
        
        if (!gradeExists) {
            const gradeDocRef = doc(collection(db, 'users', userId, 'grades'));
            batch.set(gradeDocRef, newGradeData);
            newGrades.push({ id: gradeDocRef.id, ...newGradeData });
            importedCount++;
        } else {
            skippedCount++;
        }
    }

    if (importedCount > 0) {
        await batch.commit();
    }
    
    return { newSubjects, newGrades, importedCount, skippedCount };
}
