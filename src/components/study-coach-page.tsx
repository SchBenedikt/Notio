"use client";

import { useState, useMemo, useEffect } from 'react';
import { Subject, Grade } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Sparkles, Lightbulb } from 'lucide-react';
import { getStudyCoachTips, StudyCoachOutput } from "@/ai/flows/study-coach-flow";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";

const StudyCoachResult = ({ subject, grades }: { subject: Subject; grades: Grade[] }) => {
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<StudyCoachOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    const mappedGrades = grades.map(g => ({
        value: g.value,
        type: g.type,
        notes: g.notes,
        weight: g.weight,
        name: g.name
    }));

    getStudyCoachTips({ 
      subjectName: subject.name, 
      subjectCategory: subject.category,
      writtenWeight: subject.writtenWeight,
      oralWeight: subject.oralWeight,
      targetGrade: subject.targetGrade,
      grades: mappedGrades 
    })
      .then(res => {
        setResponse(res);
      })
      .catch(err => {
        console.error("AI Coach Error:", err);
        setError("Der Lern-Coach konnte leider nicht erreicht werden. Bitte versuche es später erneut.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [subject, grades]);

  if (loading) {
    return (
      <div className="space-y-6 mt-4">
        <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-6 w-1/3" />
            <div className="space-y-3 pt-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-5/6" />
            </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <p className="text-destructive mt-4">{error}</p>
  }
  
  if (!response) return null;

  return (
       <div className="space-y-6 mt-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2"><Sparkles className="h-5 w-5 text-amber-500" />Analyse</h3>
            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">{response.analysis}</p>
          </div>
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-2"><Lightbulb className="h-5 w-5 text-blue-500" />Deine nächsten Schritte</h3>
            <ul className="space-y-2 list-none">
              {response.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <Badge variant="outline" className="mt-1 border-primary/50 text-primary">{index + 1}</Badge>
                  <span className="flex-1">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
      </div>
  )
}


type StudyCoachPageProps = {
  subjects: Subject[];
  allGrades: Grade[];
};

export function StudyCoachPage({ subjects, allGrades }: StudyCoachPageProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>();

  const selectedSubject = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId);
  }, [subjects, selectedSubjectId]);

  const gradesForSelectedSubject = useMemo(() => {
    if (!selectedSubjectId) return [];
    return allGrades.filter(g => g.subjectId === selectedSubjectId);
  }, [allGrades, selectedSubjectId]);

  if (subjects.length === 0) {
    return (
       <div className="text-center py-20 flex flex-col items-center justify-center min-h-[60vh] bg-background/50 rounded-lg border border-dashed">
        <h2 className="text-2xl font-semibold">Lern-Coach</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Füge zuerst Fächer hinzu, um den Lern-Coach verwenden zu können.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <div className="text-center">
         <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full border-8 border-primary/5">
                <BrainCircuit className="h-8 w-8 text-primary" />
            </div>
        </div>
        <h1 className="text-3xl font-bold">Lern-Coach</h1>
        <p className="text-muted-foreground mt-2">
            Erhalte personalisierte Lerntipps basierend auf deinen Noten.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Fach auswählen</CardTitle>
          <CardDescription>Wähle ein Fach aus, um eine Analyse zu erhalten.</CardDescription>
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
            <CardTitle className="flex items-center gap-2">
                <span>Analyse für {selectedSubject.name}</span>
            </CardTitle>
             <CardDescription>
                Dein persönlicher KI-Assistent für bessere Noten.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudyCoachResult subject={selectedSubject} grades={gradesForSelectedSubject} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
