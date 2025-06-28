import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Grade, type Subject } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateFinalGrade(grades: Grade[]): string {
  if (grades.length === 0) {
    return "-";
  }

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
            const finalGradeStr = calculateFinalGrade(subjectGrades);
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
