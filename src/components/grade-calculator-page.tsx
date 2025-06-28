"use client";

import { useState, useMemo } from 'react';
import { Subject, Grade } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GradeCalculator } from './grade-calculator';
import { calculateFinalGrade } from '@/lib/utils';
import { Calculator } from 'lucide-react';

type GradeCalculatorPageProps = {
  subjects: Subject[];
  allGrades: Grade[];
};

export function GradeCalculatorPage({ subjects, allGrades }: GradeCalculatorPageProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>();

  const selectedSubject = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId);
  }, [subjects, selectedSubjectId]);

  const gradesForSelectedSubject = useMemo(() => {
    if (!selectedSubjectId) return [];
    return allGrades.filter(g => g.subjectId === selectedSubjectId);
  }, [allGrades, selectedSubjectId]);
  
  const finalGrade = useMemo(() => {
    if (!selectedSubject) return "-";
    return calculateFinalGrade(gradesForSelectedSubject, selectedSubject);
  }, [gradesForSelectedSubject, selectedSubject]);


  if (subjects.length === 0) {
    return (
       <div className="text-center py-20 flex flex-col items-center justify-center min-h-[60vh] bg-background/50 rounded-lg border border-dashed">
        <h2 className="text-2xl font-semibold">Notenrechner</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Füge zuerst Fächer hinzu, um den Notenrechner verwenden zu können.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <div className="text-center">
            <h1 className="text-3xl font-bold">Notenrechner</h1>
            <p className="text-muted-foreground mt-2">
                Plane deine nächsten Schritte, um deine Ziele zu erreichen.
            </p>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Fach auswählen</CardTitle>
          <CardDescription>Wähle ein Fach aus, um Berechnungen durchzuführen.</CardDescription>
        </CardHeader>
        <CardContent>
            <Select onValueChange={setSelectedSubjectId} value={selectedSubjectId}>
                <SelectTrigger>
                    <SelectValue placeholder="Wähle ein Fach..." />
                </SelectTrigger>
                <SelectContent>
                    {subjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </CardContent>
      </Card>

      {selectedSubject && (
        <Card className="animate-fade-in-down">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>Rechner für {selectedSubject.name}</span>
                 <span className="text-lg font-bold text-primary">{finalGrade !== '-' ? `Schnitt: ${finalGrade}` : 'Kein Schnitt'}</span>
            </CardTitle>
             <CardDescription>
                Hier kannst du verschiedene Szenarien für deine nächste Note durchspielen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {gradesForSelectedSubject.length > 0 ? (
                 <GradeCalculator subject={selectedSubject} grades={gradesForSelectedSubject} finalGrade={finalGrade} />
            ): (
                <div className="text-center text-muted-foreground py-8 flex flex-col items-center gap-4">
                    <Calculator className="h-10 w-10 text-muted-foreground/50" />
                    <p className="font-medium">Für dieses Fach gibt es noch keine Noten.</p>
                    <p className="text-sm">Füge Noten hinzu, um den Rechner zu verwenden.</p>
                </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
