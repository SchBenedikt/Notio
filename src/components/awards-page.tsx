"use client";

import { useState } from "react";
import { Award as AwardType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Award as AwardIcon, Share2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AwardsShareDialog } from "./awards-share-dialog";

const tierStyles = {
  bronze: {
    bg: "bg-amber-700/10 dark:bg-amber-950/20",
    border: "border-amber-700/20 dark:border-amber-900/40",
    iconBg: "bg-amber-700/10",
    iconText: "text-amber-600 dark:text-amber-500",
    text: "text-amber-700 dark:text-amber-500",
  },
  silver: {
    bg: "bg-slate-400/10 dark:bg-slate-600/10",
    border: "border-slate-400/20 dark:border-slate-500/30",
    iconBg: "bg-slate-400/10",
    iconText: "text-slate-500 dark:text-slate-400",
    text: "text-slate-600 dark:text-slate-400",
  },
  gold: {
    bg: "bg-yellow-400/10 dark:bg-yellow-600/10",
    border: "border-yellow-400/20 dark:border-yellow-500/30",
    iconBg: "bg-yellow-400/10",
    iconText: "text-yellow-500 dark:text-yellow-400",
    text: "text-yellow-600 dark:text-yellow-400",
  },
  special: {
    bg: "bg-primary/10",
    border: "border-primary/20",
    iconBg: "bg-primary/10",
    iconText: "text-primary",
    text: "text-primary",
  },
};

const AwardCard = ({ award }: { award: AwardType }) => {
  const styles = tierStyles[award.tier];
  
  if (award.unlocked) {
    return (
      <Card className={cn("flex flex-col animate-fade-in-down transition-all", styles.bg, styles.border)}>
          <CardHeader className="flex-row items-start gap-4 space-y-0 pb-3">
              <div className={cn("p-3 rounded-lg", styles.iconBg)}>
                  <award.icon className={cn("h-6 w-6", styles.iconText)} />
              </div>
              <div className="flex-1">
                   <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold">{award.name}</CardTitle>
                        {award.isRepeatable && award.progress && award.progress.current > 0 && (
                            <Badge variant="secondary" className={cn("font-bold", styles.text, styles.iconBg)}>x{award.progress.current}</Badge>
                        )}
                    </div>
                  <p className="text-sm text-muted-foreground mt-1">{award.description}</p>
              </div>
          </CardHeader>
          <CardContent className="pt-0 mt-auto">
              {!award.isRepeatable && award.progress && award.progress.target > 1 && award.progress.current < award.progress.target && (
                  <div className="mt-2">
                       <div className="flex justify-between text-xs mb-1">
                            <span className={cn(styles.text, "font-semibold")}>Fortschritt</span>
                            <span className="text-muted-foreground">{award.progress.current} / {award.progress.target}</span>
                       </div>
                       <Progress value={(award.progress.current / award.progress.target) * 100} className="h-2" />
                  </div>
              )}
          </CardContent>
      </Card>
    )
  }

  // Locked Award
  return (
       <Card className="flex flex-col bg-card/50 shadow-sm border">
          <CardHeader className="flex-row items-start gap-4 space-y-0 pb-3">
              <div className="p-3 bg-muted rounded-lg">
                  <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                  <CardTitle className="text-base font-bold text-muted-foreground">{award.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{award.secretDescription}</p>
              </div>
          </CardHeader>
           <CardContent className="pt-0 mt-auto">
              {award.progress && (
                  <div className="mt-2">
                       <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground font-semibold">Fortschritt</span>
                            <span className="text-muted-foreground">{award.progress.current} / {award.progress.target}</span>
                       </div>
                       <Progress value={(award.progress.current / award.progress.target) * 100} className="h-2" />
                  </div>
              )}
          </CardContent>
      </Card>
  )
}


type AwardsPageProps = {
  awards: AwardType[];
  selectedGradeLevel: number;
};

export function AwardsPage({ awards, selectedGradeLevel }: AwardsPageProps) {
    const [isShareDialogOpen, setShareDialogOpen] = useState(false);
    const unlockedAwards = awards.filter(a => a.unlocked).sort((a,b) => a.name.localeCompare(b.name));
    const lockedAwards = awards.filter(a => !a.unlocked).sort((a,b) => a.name.localeCompare(b.name));

  return (
    <>
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
         <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full border-8 border-primary/5">
                <AwardIcon className="h-8 w-8 text-primary" />
            </div>
        </div>
        <h1 className="text-3xl font-bold">Deine Auszeichnungen</h1>
        <p className="text-muted-foreground mt-2">
          Sammle Trophäen für deine Erfolge und deinen Fleiß in dieser Klassenstufe.
        </p>
        <div className="mt-6">
            <Button onClick={() => setShareDialogOpen(true)} disabled={unlockedAwards.length === 0}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Awards
            </Button>
        </div>
      </div>
      
      <div className="space-y-10">
        {unlockedAwards.length > 0 && (
            <div>
                <h2 className="text-2xl font-semibold mb-4">Freigeschaltet ({unlockedAwards.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unlockedAwards.map(award => (
                        <AwardCard key={award.id} award={award} />
                    ))}
                </div>
            </div>
        )}
        
        {lockedAwards.length > 0 && (
            <div>
                <h2 className="text-2xl font-semibold mb-4">Noch gesperrt ({lockedAwards.length})</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lockedAwards.map(award => (
                        <AwardCard key={award.id} award={award} />
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
    <AwardsShareDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setShareDialogOpen}
        unlockedAwards={unlockedAwards}
        gradeLevel={selectedGradeLevel}
    />
    </>
  );
}
