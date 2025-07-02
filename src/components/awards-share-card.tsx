"use client"
import React from 'react';
import { Award } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

type AwardsShareCardProps = {
    unlockedAwards: Award[];
    gradeLevel: number;
};

const tierStyles = {
  bronze: "text-amber-700 dark:text-amber-500",
  silver: "text-slate-500 dark:text-slate-400",
  gold: "text-yellow-500 dark:text-yellow-400",
  special: "text-primary",
};

export const AwardsShareCard = React.forwardRef<HTMLDivElement, AwardsShareCardProps>(
    ({ unlockedAwards, gradeLevel }, ref) => {
        return (
            <div ref={ref} className="w-[400px] h-[400px] bg-background p-6 flex flex-col shadow-2xl rounded-xl border-4 border-primary/20">
                 <div className="flex items-center justify-between">
                     <div>
                        <h1 className="text-2xl font-bold text-foreground">My Achievements</h1>
                        <p className="text-muted-foreground font-medium">Grade {gradeLevel}</p>
                     </div>
                     <Logo />
                 </div>

                 <div className="flex-1 grid grid-cols-4 gap-4 items-center justify-center py-4">
                     {unlockedAwards.slice(0, 16).map(award => (
                         <div key={award.id} className="flex flex-col items-center justify-center text-center gap-1">
                             <div className={cn("p-3 rounded-lg bg-primary/5")}>
                                <award.icon className={cn("h-8 w-8", tierStyles[award.tier])} />
                             </div>
                             <p className="text-xs text-muted-foreground leading-tight">{award.name}</p>
                         </div>
                     ))}
                 </div>

                 <div className="text-center text-xs text-muted-foreground border-t pt-2">
                    Generated with Noten-Meister
                 </div>
            </div>
        )
    }
);
AwardsShareCard.displayName = "AwardsShareCard";
