"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowRight, Calculator, Shield, Target } from "lucide-react";
import { calculateFinalGrade, calculateGradeForTarget } from "@/lib/utils";
import type { Grade, Subject, GradeType } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const GradeCalculator = ({ subject, grades, finalGrade: finalGradeString }: { subject: Subject; grades: Grade[], finalGrade: string }) => {
    // State for "What-if" tab
    const [hypotheticalGrade, setHypotheticalGrade] = useState({ value: '', weight: '1', type: 'mündliche Note' as GradeType });
    
    // State for "Target" and "Maintain" tabs
    const [futureGradeWeight, setFutureGradeWeight] = useState('1');
    const [futureGradeType, setFutureGradeType] = useState<GradeType>('mündliche Note');
    // New state for the custom target grade input
    const [targetGradeInput, setTargetGradeInput] = useState('');

    const finalGrade = finalGradeString === '-' ? null : parseFloat(finalGradeString);

    // Effect to pre-fill the target grade input with a sensible default
    useEffect(() => {
        if (finalGrade) {
            let autoTarget = Math.floor(finalGrade * 2) / 2;
            if (autoTarget >= finalGrade) {
                autoTarget = parseFloat((autoTarget - 0.5).toFixed(1));
            }
            if (autoTarget < 1.0) autoTarget = 1.0;
            setTargetGradeInput(autoTarget.toFixed(1));
        } else {
            setTargetGradeInput('');
        }
    }, [finalGrade]);

    // What-if calculation
    const newAverage = useMemo(() => {
        const gradeValue = parseFloat(hypotheticalGrade.value);
        const gradeWeight = parseFloat(hypotheticalGrade.weight);

        if (isNaN(gradeValue) || isNaN(gradeWeight) || gradeValue < 1 || gradeValue > 6 || gradeWeight <= 0) {
            return null;
        }

        const tempGrade: Grade = {
            id: 'hypothetical',
            subjectId: subject.id,
            value: gradeValue,
            weight: gradeWeight,
            type: hypotheticalGrade.type,
            date: new Date().toISOString(),
        };

        const newGrades = [...grades, tempGrade];
        return calculateFinalGrade(newGrades, subject);
    }, [hypotheticalGrade, grades, subject]);

    const { requiredGradeResult, targetAverageDisplay } = useMemo(() => {
        if (!finalGrade) return { requiredGradeResult: "Kein Schnitt", targetAverageDisplay: null };
        
        const targetAverage = parseFloat(targetGradeInput);
        if (isNaN(targetAverage) || targetAverage < 1.0 || targetAverage > 6.0) {
             return { requiredGradeResult: "Ungültiges Ziel", targetAverageDisplay: targetGradeInput || "-" };
        }

        const weight = parseFloat(futureGradeWeight);
        if (isNaN(weight) || weight <= 0) return { requiredGradeResult: "-", targetAverageDisplay: targetGradeInput };
        
        const result = calculateGradeForTarget(grades, subject, targetAverage, weight, futureGradeType);
        
        let requiredGradeResult;
        if (result === null) requiredGradeResult = "-";
        else if (result <= 1.0) requiredGradeResult = `Note ≤ 1.0`;
        else if (result > 6.0) requiredGradeResult = `Nicht möglich`;
        else requiredGradeResult = `Note ${result.toFixed(2)}`;
        
        return { requiredGradeResult, targetAverageDisplay: targetGradeInput };
    }, [finalGrade, grades, subject, futureGradeWeight, futureGradeType, targetGradeInput]);
    
    const { maintainGradeResult, maintainAverageDisplay } = useMemo(() => {
        if (!finalGrade) return { maintainGradeResult: "Kein Schnitt", maintainAverageDisplay: null };
        const weight = parseFloat(futureGradeWeight);
        if (isNaN(weight) || weight <= 0) return { maintainGradeResult: "-", maintainAverageDisplay: null };

        let maintainAverage = Math.ceil(finalGrade * 2) / 2;
        if (maintainAverage <= finalGrade) {
            maintainAverage += 0.5;
        }

        if (maintainAverage > 6.0) return { maintainGradeResult: "Jede Note ok", maintainAverageDisplay: "6,0" };

        const result = calculateGradeForTarget(grades, subject, maintainAverage, weight, futureGradeType);
        
        let maintainGradeResult;
        if (result === null) maintainGradeResult = "-";
        else if (result > 6.0) maintainGradeResult = `Jede Note ok`;
        else if (result < 1.0) maintainGradeResult = `Nicht möglich`;
        else maintainGradeResult = `Schlechteste: ${result.toFixed(2)}`;
        
        return { maintainGradeResult, maintainAverageDisplay: maintainAverage.toFixed(1) };
    }, [finalGrade, grades, subject, futureGradeWeight, futureGradeType]);

    const renderFutureGradeInputs = () => (
        <div className="space-y-3">
             <div className="flex-1">
                <Label htmlFor={`future-weight-${subject.id}`} className="text-xs">Gewichtung der nächsten Note</Label>
                <Input 
                    id={`future-weight-${subject.id}`}
                    type="number"
                    placeholder="z.B. 1"
                    value={futureGradeWeight}
                    onChange={(e) => setFutureGradeWeight(e.target.value)}
                    className="h-9"
                />
            </div>
            {subject.category === "Hauptfach" && (
              <div>
                <Label className="text-xs">Art der nächsten Note</Label>
                <RadioGroup
                  value={futureGradeType}
                  onValueChange={(type) => setFutureGradeType(type as GradeType)}
                  className="flex space-x-4 pt-1"
                >
                  <div className="flex items-center space-x-2 space-y-0">
                      <RadioGroupItem value="Schulaufgabe" id={`future-type-written-${subject.id}`} />
                      <Label htmlFor={`future-type-written-${subject.id}`} className="font-normal text-sm">Schulaufgabe</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-y-0">
                      <RadioGroupItem value="mündliche Note" id={`future-type-oral-${subject.id}`} />
                      <Label htmlFor={`future-type-oral-${subject.id}`} className="font-normal text-sm">Mündliche Note</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
        </div>
    );

    return (
        <Tabs defaultValue="what-if" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger value="what-if" className="text-xs px-1 flex-col sm:flex-row h-auto py-1.5 gap-1">
                    <Calculator className="h-4 w-4" />
                    <span>Was wäre wenn?</span>
                </TabsTrigger>
                <TabsTrigger value="reach-goal" className="text-xs px-1 flex-col sm:flex-row h-auto py-1.5 gap-1">
                    <Target className="h-4 w-4" />
                    <span>Zielnote</span>
                </TabsTrigger>
                <TabsTrigger value="maintain" className="text-xs px-1 flex-col sm:flex-row h-auto py-1.5 gap-1">
                    <Shield className="h-4 w-4" />
                    <span>Schnitt halten</span>
                </TabsTrigger>
            </TabsList>
            <TabsContent value="what-if" className="mt-4">
                <div className="space-y-3">
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <Label htmlFor={`if-grade-${subject.id}`} className="text-xs">Note</Label>
                            <Input 
                                id={`if-grade-${subject.id}`}
                                type="number"
                                placeholder="z.B. 2"
                                value={hypotheticalGrade.value}
                                onChange={(e) => setHypotheticalGrade(prev => ({...prev, value: e.target.value}))}
                                className="h-9"
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor={`if-weight-${subject.id}`} className="text-xs">Gewichtung</Label>
                            <Input 
                                id={`if-weight-${subject.id}`}
                                type="number"
                                placeholder="z.B. 1"
                                value={hypotheticalGrade.weight}
                                onChange={(e) => setHypotheticalGrade(prev => ({...prev, weight: e.target.value}))}
                                className="h-9"
                            />
                        </div>
                        <div className="flex items-center text-2xl font-bold pb-1">
                            <ArrowRight className="h-5 w-5 text-muted-foreground mx-1" />
                            <span className="text-primary">{newAverage ?? '-'}</span>
                        </div>
                    </div>
                    {subject.category === "Hauptfach" && (
                        <div>
                            <Label className="text-xs">Notentyp</Label>
                            <RadioGroup
                                value={hypotheticalGrade.type}
                                onValueChange={(type) => setHypotheticalGrade(prev => ({...prev, type: type as GradeType}))}
                                className="flex space-x-4 pt-1"
                            >
                                <div className="flex items-center space-x-2 space-y-0">
                                    <RadioGroupItem value="Schulaufgabe" id={`if-type-written-${subject.id}`} />
                                    <Label htmlFor={`if-type-written-${subject.id}`} className="font-normal text-sm">Schulaufgabe</Label>
                                </div>
                                <div className="flex items-center space-x-2 space-y-0">
                                    <RadioGroupItem value="mündliche Note" id={`if-type-oral-${subject.id}`} />
                                    <Label htmlFor={`if-type-oral-${subject.id}`} className="font-normal text-sm">Mündliche Note</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}
                </div>
            </TabsContent>
            <TabsContent value="reach-goal" className="mt-4">
                 <div className="space-y-3">
                    <div className="space-y-3">
                         <div>
                            <Label htmlFor={`target-grade-input-${subject.id}`} className="text-xs">Wunschnote</Label>
                            <Input 
                                id={`target-grade-input-${subject.id}`}
                                type="number"
                                step="0.1"
                                placeholder="z.B. 2,5"
                                value={targetGradeInput}
                                onChange={(e) => setTargetGradeInput(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        <div>
                            <Label htmlFor={`future-weight-reach-${subject.id}`} className="text-xs">Gewichtung der nächsten Note</Label>
                            <Input 
                                id={`future-weight-reach-${subject.id}`}
                                type="number"
                                placeholder="z.B. 1"
                                value={futureGradeWeight}
                                onChange={(e) => setFutureGradeWeight(e.target.value)}
                                className="h-9"
                            />
                        </div>
                        {subject.category === "Hauptfach" && (
                          <div>
                            <Label className="text-xs">Art der nächsten Note</Label>
                            <RadioGroup
                              value={futureGradeType}
                              onValueChange={(type) => setFutureGradeType(type as GradeType)}
                              className="flex space-x-4 pt-1"
                            >
                              <div className="flex items-center space-x-2 space-y-0">
                                  <RadioGroupItem value="Schulaufgabe" id={`reach-type-written-${subject.id}`} />
                                  <Label htmlFor={`reach-type-written-${subject.id}`} className="font-normal text-sm">Schulaufgabe</Label>
                              </div>
                              <div className="flex items-center space-x-2 space-y-0">
                                  <RadioGroupItem value="mündliche Note" id={`reach-type-oral-${subject.id}`} />
                                  <Label htmlFor={`reach-type-oral-${subject.id}`} className="font-normal text-sm">Mündliche Note</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}
                    </div>
                    <div className="text-center bg-background p-3 rounded-md">
                        <p className="text-xs text-muted-foreground">Um Schnitt <span className="font-bold text-primary">{targetAverageDisplay}</span> zu erreichen:</p>
                        <p className="text-lg font-bold text-primary">{requiredGradeResult}</p>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="maintain" className="mt-4">
                 <div className="space-y-3">
                    {renderFutureGradeInputs()}
                    <div className="text-center bg-background p-3 rounded-md">
                        <p className="text-xs text-muted-foreground">Um Schnitt <span className="font-bold text-destructive">{maintainAverageDisplay}</span> zu vermeiden:</p>
                        <p className="text-lg font-bold text-foreground">{maintainGradeResult}</p>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
};
