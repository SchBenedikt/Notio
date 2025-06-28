"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Grade, Subject } from "@/lib/types";
import { getStudyCoachTips, StudyCoachOutput } from "@/ai/flows/study-coach-flow";
import { Skeleton } from "./ui/skeleton";
import { BrainCircuit, Sparkles, Lightbulb } from "lucide-react";
import { Badge } from "./ui/badge";

type StudyCoachDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  subject: Subject;
  grades: Grade[];
};

export function StudyCoachDialog({ isOpen, onOpenChange, subject, grades }: StudyCoachDialogProps) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<StudyCoachOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      setResponse(null);
      
      const mappedGrades = grades.map(g => ({
          value: g.value,
          type: g.type,
          notes: g.notes,
          weight: g.weight
      }));

      getStudyCoachTips({ subjectName: subject.name, grades: mappedGrades })
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
    }
  }, [isOpen, subject, grades]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span>Lern-Coach für {subject.name}</span>
          </DialogTitle>
          <DialogDescription>
            Dein persönlicher KI-Assistent für bessere Noten.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-8 w-1/3" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          {response && (
             <div className="space-y-6">
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
