"use client";

import { Award as AwardType } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Award as AwardIcon } from "lucide-react";

type AwardsPageProps = {
  awards: AwardType[];
};

export function AwardsPage({ awards }: AwardsPageProps) {
    const unlockedAwards = awards.filter(a => a.unlocked).sort((a,b) => a.name.localeCompare(b.name));
    const lockedAwards = awards.filter(a => !a.unlocked).sort((a,b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
         <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-400/10 rounded-full border-8 border-amber-400/5">
                <AwardIcon className="h-8 w-8 text-amber-500" />
            </div>
        </div>
        <h1 className="text-3xl font-bold">Auszeichnungen</h1>
        <p className="text-muted-foreground mt-2">
          Sammle Trophäen für deine Erfolge und deinen Fleiß in dieser Klassenstufe.
        </p>
      </div>
      
      <div className="space-y-6">
        {unlockedAwards.length > 0 && (
            <div>
                <h2 className="text-2xl font-semibold mb-4">Freigeschaltet ({unlockedAwards.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unlockedAwards.map(award => (
                        <Card key={award.id} className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50 border-amber-200 dark:border-amber-800/50 shadow-sm animate-fade-in-down">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                <div className="p-2 bg-amber-500/10 rounded-full">
                                    <award.icon className="h-6 w-6 text-amber-500" />
                                </div>
                                <CardTitle className="text-base font-bold">{award.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{award.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )}
        
        {lockedAwards.length > 0 && (
            <div>
                <h2 className="text-2xl font-semibold mb-4">Noch gesperrt ({lockedAwards.length})</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lockedAwards.map(award => (
                        <Card key={award.id} className="shadow-sm bg-card">
                           <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                <div className="p-2 bg-muted rounded-full">
                                    <Lock className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <CardTitle className="text-base font-bold text-muted-foreground">{award.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{award.secretDescription}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
