"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings, Weight, Palette, Briefcase, School } from 'lucide-react';
import { cn } from "@/lib/utils";

type SettingsPageProps = {
  mainSubjectWeight: number;
  onMainSubjectWeightChange: (weight: number) => void;
  minorSubjectWeight: number;
  onMinorSubjectWeightChange: (weight: number) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  isDarkMode: boolean;
  onIsDarkModeChange: (isDark: boolean) => void;
  userRole: string;
  onUserRoleChange: (role: 'student' | 'teacher') => void;
  userSchool: string;
  onUserSchoolChange: (school: string) => void;
};

const themes = [
    { name: "blue", label: "Blau", color: "hsl(217.2 91.2% 59.8%)" },
    { name: "green", label: "Grün", color: "hsl(142.1 76.2% 36.3%)" },
    { name: "violet", label: "Violett", color: "hsl(262.1 83.3% 57.8%)" },
    { name: "orange", label: "Orange", color: "hsl(25 95% 53%)" },
    { name: "rose", label: "Rose", color: "hsl(346.8 77.2% 49.8%)" },
    { name: "yellow", label: "Gelb", color: "hsl(48 96% 53%)" },
    { name: "zinc", label: "Zink", color: "hsl(240 5.2% 33.9%)" },
    { name: "slate", label: "Schiefer", color: "hsl(215 39% 35%)" },
];

export function SettingsPage({
    mainSubjectWeight,
    onMainSubjectWeightChange,
    minorSubjectWeight,
    onMinorSubjectWeightChange,
    theme,
    onThemeChange,
    isDarkMode,
    onIsDarkModeChange,
    userRole,
    onUserRoleChange,
    userSchool,
    onUserSchoolChange,
}: SettingsPageProps) {

    const handleWeightChange = (setter: (weight: number) => void, value: string) => {
        const num = Number(value);
        if (!isNaN(num) && num >= 0) {
            setter(num);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full border-8 border-primary/5">
                        <Settings className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold">Einstellungen</h1>
                <p className="text-muted-foreground mt-2">
                    Passe die App an deine Bedürfnisse an.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Weight className="h-5 w-5 text-muted-foreground" />Notengewichtung</CardTitle>
                    <CardDescription>
                        Passe die globale Gewichtung für Haupt- und Nebenfächer an.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                        <Label htmlFor="main-weight">Hauptfach</Label>
                        <Input
                            id="main-weight"
                            type="number"
                            min="0"
                            step="0.5"
                            value={mainSubjectWeight}
                            onChange={(e) => handleWeightChange(onMainSubjectWeightChange, e.target.value)}
                            className="w-24"
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                        <Label htmlFor="minor-weight">Nebenfach</Label>
                        <Input
                            id="minor-weight"
                            type="number"
                            min="0"
                            step="0.5"
                            value={minorSubjectWeight}
                            onChange={(e) => handleWeightChange(onMinorSubjectWeightChange, e.target.value)}
                            className="w-24"
                        />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-muted-foreground" />Erscheinungsbild</CardTitle>
                    <CardDescription>
                        Passe das Farbschema und den Dark Mode an.
                    </CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <div>
                        <Label>Farbschema</Label>
                         <div className="flex items-center flex-wrap gap-2 pt-2">
                            {themes.map((t) => (
                                <button
                                key={t.name}
                                onClick={() => onThemeChange(t.name)}
                                className={cn(
                                    "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all",
                                    theme === t.name ? "border-ring scale-110" : "border-transparent"
                                )}
                                style={{ backgroundColor: t.color }}
                                aria-label={`Farbe ${t.label} auswählen`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <Switch
                            id="dark-mode"
                            checked={isDarkMode}
                            onCheckedChange={onIsDarkModeChange}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Persönliche Daten</CardTitle>
                    <CardDescription>Diese Einstellungen sind privat und gelten nur für dich.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-3 border rounded-md">
                        <School className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                            <Label htmlFor="school" className="text-xs text-muted-foreground">Schule</Label>
                            <Input id="school" value={userSchool} onChange={(e) => onUserSchoolChange(e.target.value)} placeholder="Name deiner Schule" className="border-0 px-0 h-auto text-base focus-visible:ring-0 focus-visible:ring-offset-0" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 border rounded-md">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">Rolle</Label>
                            <RadioGroup
                                value={userRole}
                                onValueChange={(value) => onUserRoleChange(value as any)}
                                className="flex space-x-4 pt-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="student" id="role-student" />
                                    <Label htmlFor="role-student" className="font-normal">Schüler</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="teacher" id="role-teacher" />
                                    <Label htmlFor="role-teacher" className="font-normal">Lehrer</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
