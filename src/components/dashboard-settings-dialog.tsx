"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "./ui/scroll-area";

type DashboardSettingsDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  widgets: Record<string, boolean>;
  onWidgetChange: (newWidgets: Record<string, boolean>) => void;
};

const widgetLabels: Record<string, string> = {
    performance: "Leistungsübersicht",
    actions: "Schnellzugriff",
    upcoming: "Anstehende Prüfungen",
    tasks: "Anstehende Aufgaben",
    calendar: "Schulkalender",
    tutor: "KI-Tutor & Coach",
};

export function DashboardSettingsDialog({ isOpen, onOpenChange, widgets, onWidgetChange }: DashboardSettingsDialogProps) {
  
  const handleSwitchChange = (widgetKey: string, checked: boolean) => {
    onWidgetChange({
        ...widgets,
        [widgetKey]: checked,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dashboard personalisieren</DialogTitle>
          <DialogDescription>
            Wähle aus, welche Widgets auf deinem Dashboard angezeigt werden sollen.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[50vh] pr-4 -mr-4">
            <div className="space-y-4 pr-4">
                {Object.entries(widgetLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-md">
                        <Label htmlFor={`widget-${key}`} className="font-medium">
                            {label}
                        </Label>
                        <Switch
                            id={`widget-${key}`}
                            checked={widgets[key] ?? false}
                            onCheckedChange={(checked) => handleSwitchChange(key, checked)}
                        />
                    </div>
                ))}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
