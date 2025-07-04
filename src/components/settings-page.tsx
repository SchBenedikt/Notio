
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Settings, Weight, Palette, CalendarClock, KeyRound, Zap, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@/lib/types";


type SettingsPageProps = {
  mainSubjectWeight: number;
  onMainSubjectWeightChange: (weight: number) => void;
  minorSubjectWeight: number;
  onMinorSubjectWeightChange: (weight: number) => void;
  maxPeriods: number;
  onMaxPeriodsChange: (periods: number) => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  isDarkMode: boolean;
  onIsDarkModeChange: (isDark: boolean) => void;
  googleAiApiKey: string;
  onGoogleAiApiKeyChange: (key: string) => void;
  isPro: boolean;
  profile: Profile | null;
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
    maxPeriods,
    onMaxPeriodsChange,
    theme,
    onThemeChange,
    isDarkMode,
    onIsDarkModeChange,
    googleAiApiKey,
    onGoogleAiApiKeyChange,
    isPro,
    profile
}: SettingsPageProps) {
    const [isStripeLoading, setIsStripeLoading] = useState(false);
    const { toast } = useToast();

    const handleWeightChange = (setter: (weight: number) => void, value: string) => {
        const num = Number(value);
        if (!isNaN(num) && num >= 0) {
            setter(num);
        }
    };
    
    const handlePeriodsChange = (setter: (periods: number) => void, value: string) => {
        const num = parseInt(value, 10);
        if (!isNaN(num) && num > 0 && num <= 12) {
            setter(num);
        }
    };
    
    const handleUpgradeClick = () => {
        setIsStripeLoading(true);

        // This is your actual Stripe Payment Link.
        const checkoutUrl = 'https://buy.stripe.com/test_aFa14f3U11s40tK3Cg5wI00';

        if (!checkoutUrl.includes('buy.stripe.com')) {
        toast({
            variant: 'destructive',
            title: 'Konfigurationsfehler',
            description: 'Der Stripe Payment Link ist nicht konfiguriert.',
        });
        setIsStripeLoading(false);
        return;
        }

        window.location.href = checkoutUrl;
    };

    const handleManageSubscription = async () => {
        setIsStripeLoading(true);
        toast({
            title: "Funktion in Entwicklung",
            description: "In einer echten App würde hier eine Server-Funktion aufgerufen, um eine Stripe Customer Portal Session zu erstellen."
        });
        // In einer echten App:
        // const response = await fetch('/api/create-portal-session', { method: 'POST' });
        // const { url } = await response.json();
        // window.location.assign(url);
        setIsStripeLoading(false);
    }


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
                    Passe die App an deine Bedürfnisse an. Änderungen werden automatisch gespeichert.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-muted-foreground" />Pro-Mitgliedschaft</CardTitle>
                    <CardDescription>Verwalte deine Mitgliedschaft und schalte alle KI-Funktionen frei.</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div>
                    <p className="font-semibold">Aktueller Status</p>
                    {isPro ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">Pro-Mitglied</Badge>
                    ) : (
                        <Badge variant="secondary">Kostenlos</Badge>
                    )}
                    </div>
                    {isPro ? (
                    <Button onClick={handleManageSubscription} disabled={isStripeLoading}>
                        {isStripeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Abonnement verwalten
                    </Button>
                    ) : (
                    <Button onClick={handleUpgradeClick} disabled={isStripeLoading} className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transition-shadow">
                        {isStripeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Jetzt upgraden
                    </Button>
                    )}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                    Die Zahlungsabwicklung erfolgt sicher über Stripe. Wir speichern keine deiner Zahlungsdaten.
                </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Weight className="h-5 w-5 text-muted-foreground" />Notengewichtung</CardTitle>
                    <CardDescription>
                        Lege die globale Gewichtung für Haupt- und Nebenfächer fest, die zur Berechnung deines Gesamtschnitts verwendet wird.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                        <Label htmlFor="main-weight" className="font-medium">Hauptfächer</Label>
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
                        <Label htmlFor="minor-weight" className="font-medium">Nebenfächer</Label>
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
                    <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-muted-foreground" />Stundenplan</CardTitle>
                    <CardDescription>
                        Passe die Einstellungen für deinen Stundenplan an.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-md">
                        <Label htmlFor="max-periods" className="font-medium">Maximale Stunden pro Tag</Label>
                        <Input
                            id="max-periods"
                            type="number"
                            min="1"
                            max="12"
                            step="1"
                            value={maxPeriods}
                            onChange={(e) => handlePeriodsChange(onMaxPeriodsChange, e.target.value)}
                            className="w-24"
                        />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-muted-foreground" />Erscheinungsbild</CardTitle>
                    <CardDescription>
                        Personalisiere das Farbschema und den Dark Mode der App.
                    </CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="p-3 border rounded-md">
                        <Label className="font-medium">Farbschema</Label>
                         <div className="flex items-center flex-wrap gap-2 pt-2">
                            {themes.map((t) => (
                                <button
                                key={t.name}
                                onClick={() => onThemeChange(t.name)}
                                className={cn(
                                    "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all",
                                    theme === t.name ? "border-primary ring-2 ring-offset-2 ring-ring scale-110" : "border-transparent"
                                )}
                                style={{ backgroundColor: t.color }}
                                aria-label={`Farbe ${t.label} auswählen`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                        <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
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
                    <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-muted-foreground" />API-Schlüssel</CardTitle>
                    <CardDescription>
                        Optional: Gib deinen eigenen Google AI API-Schlüssel ein. Wenn du das Feld leer lässt, wird der Standard-Schlüssel der App verwendet.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="api-key">Google AI API Key</Label>
                        <Input
                            id="api-key"
                            type="password"
                            placeholder="••••••••••••••••••••••••••••"
                            value={googleAiApiKey}
                            onChange={(e) => onGoogleAiApiKeyChange(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
