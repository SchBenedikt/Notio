"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, BookCopy, BrainCircuit, Check, ClipboardCheck, FilePlus, FileText, Import, ListChecks, Notebook, Plus, Settings, Trash2 } from "lucide-react";
import type { ActivityLog } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

const activityIcons: Record<string, React.ElementType> = {
    SUBJECT_CREATED: Plus,
    SUBJECT_DELETED: Trash2,
    GRADE_ADDED: ClipboardCheck,
    GRADE_DELETED: Trash2,
    GRADE_PLANNED: ClipboardCheck,
    STUDY_SET_CREATED: BrainCircuit,
    STUDY_SET_LEARNED: Check,
    LERNZETTEL_CREATED: FilePlus,
    LERNZETTEL_EDITED: FileText,
    TASK_CREATED: ListChecks,
    TASK_COMPLETED: Check,
    DATA_IMPORTED: Import,
    TIMETABLE_IMPORTED: Import,
    DEFAULT: Activity,
};

type ActivityPageProps = {
  activities: ActivityLog[];
};

export function ActivityPage({ activities }: ActivityPageProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
       <div className="text-center">
         <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full border-8 border-primary/5">
                <Activity className="h-8 w-8 text-primary" />
            </div>
        </div>
        <h1 className="text-3xl font-bold">Dein Aktivitätsverlauf</h1>
        <p className="text-muted-foreground mt-2">
          Eine Übersicht über alles, was du in der App gemacht hast.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="p-6 space-y-6">
                {activities.length > 0 ? (
                    activities.map((activity) => {
                        const Icon = activityIcons[activity.icon] || activityIcons.DEFAULT;
                        return (
                             <div key={activity.id} className="relative pl-10">
                                <div className="absolute left-0 top-0 flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="absolute left-4 top-8 bottom-0 w-px bg-border -ml-px"></div>

                                <p className="font-medium text-sm">{activity.description}</p>
                                <p className="text-xs text-muted-foreground">
                                    {activity.timestamp.toDate ? formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true, locale: de }) : 'Gerade eben'}
                                </p>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>Noch keine Aktivitäten vorhanden.</p>
                        <p className="text-sm">Leg los und erstelle ein Fach oder eine Note!</p>
                    </div>
                )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
