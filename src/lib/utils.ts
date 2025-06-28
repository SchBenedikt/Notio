import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type Grade } from "@/lib/types";

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
