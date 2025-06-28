import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Grade, type Subject } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateFinalGrade(grades: Grade[], subject: Subject): string {
    if (grades.length === 0) {
      return "-";
    }

    // New logic for subjects with specific written/oral weighting (typically main subjects)
    if (subject.category === 'Hauptfach' && subject.writtenWeight != null && subject.oralWeight != null && (subject.writtenWeight > 0 || subject.oralWeight > 0)) {
        const writtenGrades = grades.filter(g => g.type === 'Schulaufgabe');
        const oralGrades = grades.filter(g => g.type === 'mündliche Note');

        let writtenAverage = 0;
        let oralAverage = 0;
        let hasWrittenGrades = false;
        let hasOralGrades = false;

        if (writtenGrades.length > 0) {
            const totalWrittenValue = writtenGrades.reduce((sum, grade) => sum + grade.value * grade.weight, 0);
            const totalWrittenWeight = writtenGrades.reduce((sum, grade) => sum + grade.weight, 0);
            if (totalWrittenWeight > 0) {
                writtenAverage = totalWrittenValue / totalWrittenWeight;
                hasWrittenGrades = true;
            }
        }

        if (oralGrades.length > 0) {
            const totalOralValue = oralGrades.reduce((sum, grade) => sum + grade.value * grade.weight, 0);
            const totalOralWeight = oralGrades.reduce((sum, grade) => sum + grade.weight, 0);
            if(totalOralWeight > 0) {
                oralAverage = totalOralValue / totalOralWeight;
                hasOralGrades = true;
            }
        }

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
    const totalWeightedValue = grades.reduce(
        (sum, grade) => sum + grade.value * grade.weight,
        0
    );
    const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);

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
