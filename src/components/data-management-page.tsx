"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, Database } from "lucide-react";

type DataManagementPageProps = {
  onImport: () => void;
  onExport: () => void;
  isFirebaseEnabled: boolean;
};

export function DataManagementPage({ onImport, onExport, isFirebaseEnabled }: DataManagementPageProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
         <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full border-8 border-primary/5">
                <Database className="h-8 w-8 text-primary" />
            </div>
        </div>
        <h1 className="text-3xl font-bold">Datenverwaltung</h1>
        <p className="text-muted-foreground mt-2">
          Exportiere deine Noten als CSV-Datei oder importiere bestehende Daten.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daten exportieren</CardTitle>
          <CardDescription>
            Sichere alle Fächer und Noten der aktuell ausgewählten Klassenstufe in einer CSV-Datei.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onExport} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Als CSV exportieren
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Daten importieren</CardTitle>
          <CardDescription>
            Importiere Fächer und Noten aus einer CSV-Datei. Bestehende Einträge werden nicht überschrieben.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onImport} variant="outline" className="w-full" disabled={!isFirebaseEnabled}>
            <Upload className="mr-2 h-4 w-4" />
            Von CSV importieren
          </Button>
          {!isFirebaseEnabled && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
                Der Import ist nur im angemeldeten Zustand verfügbar, um Daten dauerhaft zu speichern.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
