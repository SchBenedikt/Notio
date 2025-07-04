
"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { AddGradeData, Grade, Attachment } from "@/lib/types";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar as CalendarIcon, UploadCloud, File as FileIcon, X, Sparkles, ChevronDown, Loader2 } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { generateGradingScale } from "@/ai/flows/generate-grading-scale-flow";
import { useAuth } from "@/hooks/use-auth";


const formSchema = z.object({
  date: z.date({
    required_error: "Ein Datum ist erforderlich.",
  }),
  type: z.enum(["Schulaufgabe", "mündliche Note"], {
    required_error: "Du musst einen Notentyp auswählen.",
  }),
  name: z.string().max(50, "Name darf nicht länger als 50 Zeichen sein.").optional(),
  value: z.preprocess(
    (val) => (val === "" || val == null ? undefined : Number(val)),
    z.number({ invalid_type_error: "Muss eine Zahl sein" }).min(1, "Note muss 1-6 sein").max(6, "Note muss 1-6 sein").optional()
  ),
  weight: z.preprocess(
    (val) => (String(val).trim() === "" ? "1" : val),
    z.coerce.number().min(0.1, "Gewichtung muss positiv sein.")
  ),
  notes: z.string().max(100, "Notiz darf nicht länger als 100 Zeichen sein.").optional(),
  attachments: z.array(z.object({
    name: z.string(),
    dataUrl: z.string(),
  })).optional(),
  
  // New optional fields
  achievedPoints: z.preprocess((val) => (val === "" || val == null ? undefined : Number(val)), z.number().optional()),
  maxPoints: z.preprocess((val) => (val === "" || val == null ? undefined : Number(val)), z.number().optional()),
  classAverage: z.preprocess((val) => (val === "" || val == null ? undefined : Number(val)), z.number().optional()),
  gradeDistribution: z.object({
    "1": z.preprocess((val) => (val === "" || val == null ? undefined : Number(val)), z.number().optional()),
    "2": z.preprocess((val) => (val === "" || val == null ? undefined : Number(val)), z.number().optional()),
    "3": z.preprocess((val) => (val === "" || val == null ? undefined : Number(val)), z.number().optional()),
    "4": z.preprocess((val) => (val === "" || val == null ? undefined : Number(val)), z.number().optional()),
    "5": z.preprocess((val) => (val === "" || val == null ? undefined : Number(val)), z.number().optional()),
    "6": z.preprocess((val) => (val === "" || val == null ? undefined : Number(val)), z.number().optional()),
  }).optional(),
  gradingScale: z.string().optional(),
}).refine(data => {
    if (data.achievedPoints != null && data.maxPoints != null) {
        return data.achievedPoints <= data.maxPoints;
    }
    return true;
}, {
    message: "Erreichte Punkte dürfen nicht größer als max. Punkte sein.",
    path: ["achievedPoints"],
});


type AddGradeFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: AddGradeData, gradeId?: string) => void;
  subjectName: string;
  gradeToEdit?: Grade | null;
  googleAiApiKey?: string;
};

const defaultFormValues = {
  date: new Date(),
  type: "mündliche Note" as const,
  name: "",
  value: undefined,
  weight: 1,
  notes: "",
  attachments: [],
  achievedPoints: undefined,
  maxPoints: undefined,
  classAverage: undefined,
  gradeDistribution: { "1": undefined, "2": undefined, "3": undefined, "4": undefined, "5": undefined, "6": undefined },
  gradingScale: "",
}

export function AddGradeDialog({ isOpen, onOpenChange, onSubmit, subjectName, gradeToEdit, googleAiApiKey }: AddGradeFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isGeneratingScale, setIsGeneratingScale] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (gradeToEdit) {
        form.reset({
          ...gradeToEdit,
          date: new Date(gradeToEdit.date),
          value: gradeToEdit.value ?? undefined,
          attachments: gradeToEdit.attachments || [],
          achievedPoints: gradeToEdit.achievedPoints ?? undefined,
          maxPoints: gradeToEdit.maxPoints ?? undefined,
          classAverage: gradeToEdit.classAverage ?? undefined,
          gradeDistribution: {
             "1": gradeToEdit.gradeDistribution?.["1"] ?? undefined,
             "2": gradeToEdit.gradeDistribution?.["2"] ?? undefined,
             "3": gradeToEdit.gradeDistribution?.["3"] ?? undefined,
             "4": gradeToEdit.gradeDistribution?.["4"] ?? undefined,
             "5": gradeToEdit.gradeDistribution?.["5"] ?? undefined,
             "6": gradeToEdit.gradeDistribution?.["6"] ?? undefined,
          },
          gradingScale: gradeToEdit.gradingScale ? JSON.stringify(gradeToEdit.gradingScale, null, 2) : "",
        });
      } else {
        form.reset(defaultFormValues);
      }
    }
  }, [isOpen, gradeToEdit, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const filePromises = Array.from(files).map(file => {
      return new Promise<Attachment>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({ name: file.name, dataUrl: e.target?.result as string });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(results => {
      const currentAttachments = form.getValues('attachments') || [];
      form.setValue('attachments', [...currentAttachments, ...results]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    const currentAttachments = form.getValues('attachments') || [];
    form.setValue('attachments', currentAttachments.filter((_, index) => index !== indexToRemove));
  };
  
  const handleGenerateScale = async () => {
    const maxPoints = form.getValues("maxPoints");
    if (!maxPoints) {
      toast({ variant: "destructive", title: "Maximale Punktzahl erforderlich" });
      return;
    }
    setIsGeneratingScale(true);
    try {
      const result = await generateGradingScale({ maxPoints, apiKey: googleAiApiKey });
      const scaleText = Object.entries(result.scale)
        .sort(([gradeA], [gradeB]) => parseInt(gradeA) - parseInt(gradeB))
        .map(([grade, points]) => `${grade}: ${points} Pkt.`)
        .join('\n');
      form.setValue('gradingScale', scaleText);
      toast({ title: "Punkteschlüssel generiert!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Fehler", description: "Der Punkteschlüssel konnte nicht generiert werden." });
    } finally {
      setIsGeneratingScale(false);
    }
  };
  
  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    let finalGradingScale: Record<string, number> | null = null;
    if (values.gradingScale) {
        try {
            // First, assume it's valid JSON
            finalGradingScale = JSON.parse(values.gradingScale);
        } catch {
             // If parsing fails, try to convert the text format
             try {
                finalGradingScale = Object.fromEntries(
                    values.gradingScale.split('\n').map(line => {
                        const parts = line.split(':');
                        if (parts.length === 2) {
                            const grade = parts[0].trim();
                            const points = parseInt(parts[1].replace(/[^0-9]/g, ''));
                            if (grade && !isNaN(points)) {
                                return [grade, points];
                            }
                        }
                        return null;
                    }).filter(Boolean) as [string, number][]
                );
             } catch {
                console.error("Could not parse gradingScale string.");
                finalGradingScale = null;
             }
        }
    }

    const submissionData = { ...values, gradingScale: finalGradingScale };
    onSubmit(submissionData, gradeToEdit?.id);
    onOpenChange(false);
  };
  
  const title = gradeToEdit ? 'Note bearbeiten' : 'Neue Note / Planung';
  const description = gradeToEdit 
      ? 'Ändere die Details der Note.' 
      : 'Füge eine neue Note hinzu. Lass das Notenfeld leer, um einen Termin zu planen.';
  const buttonText = gradeToEdit ? 'Änderungen speichern' : 'Speichern';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem className="space-y-3">
                    <FormLabel>Notentyp</FormLabel>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Schulaufgabe" /></FormControl><FormLabel className="font-normal">Schulaufgabe</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="mündliche Note" /></FormControl><FormLabel className="font-normal">Mündliche Note</FormLabel></FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Note (optional, 1-6)</FormLabel>
                    <FormControl><Input type="number" step="1" placeholder="z.B. 2" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem className="flex flex-col"><FormLabel>Datum</FormLabel>
                        <Popover><PopoverTrigger asChild><FormControl>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP", { locale: de }) : <span>Wähle ein Datum</span>}
                            </Button>
                        </FormControl></PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("2000-01-01")} initialFocus /></PopoverContent>
                        </Popover><FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem><FormLabel>Bezeichnung (optional)</FormLabel><FormControl><Input placeholder="z.B. Vokabeltest, Referat" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                    <FormItem><FormLabel>Gewichtung</FormLabel><FormControl><Input type="number" step="0.5" placeholder="z.B. 1 oder 2" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem><FormLabel>Notiz (optional)</FormLabel><FormControl><Textarea placeholder="z.B. Thema der Ex, Schwierigkeiten..." className="resize-none" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                )}
                />
            </div>
            
            <Collapsible>
                <CollapsibleTrigger asChild>
                    <Button type="button" variant="ghost" className="w-full text-muted-foreground">
                        Zusätzliche Leistungsdaten
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4 animate-accordion-down">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={form.control} name="achievedPoints" render={({ field }) => (<FormItem><FormLabel>Erreichte Punkte</FormLabel><FormControl><Input type="number" placeholder="z.B. 85" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="maxPoints" render={({ field }) => (<FormItem><FormLabel>Max. Punkte</FormLabel><FormControl><Input type="number" placeholder="z.B. 100" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="classAverage" render={({ field }) => (<FormItem><FormLabel>Klassenschnitt</FormLabel><FormControl><Input type="number" step="0.1" placeholder="z.B. 3,4" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <div>
                        <Label>Notenverteilung (Anzahl Schüler)</Label>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-2">
                           {["1", "2", "3", "4", "5", "6"].map(grade => (
                             <FormField key={grade} control={form.control} name={`gradeDistribution.${grade as "1"|"2"|"3"|"4"|"5"|"6"}`} render={({ field }) => (<FormItem><FormLabel className="font-normal text-muted-foreground text-center block">Note {grade}</FormLabel><FormControl><Input type="number" placeholder="Anzahl" {...field} value={field.value ?? ''} /></FormControl></FormItem>)} />
                           ))}
                        </div>
                    </div>
                     <div>
                        <Label>Punkteschlüssel</Label>
                        <div className="flex gap-2 items-end">
                            <FormField control={form.control} name="gradingScale" render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl><Textarea placeholder="z.B. 1: 92 Pkt." className="resize-y" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <Button type="button" variant="outline" onClick={handleGenerateScale} disabled={isGeneratingScale}>
                                {isGeneratingScale ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                KI
                            </Button>
                        </div>
                        <FormDescription>Gib den Schlüssel manuell ein oder lasse ihn von der KI basierend auf der max. Punktzahl erstellen.</FormDescription>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            <div className="space-y-2">
              <FormLabel>Anhänge (optional)</FormLabel>
              <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}><UploadCloud className="mr-2 h-4 w-4" /> Dateien auswählen</Button>
              <Input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFileChange} />
              <div className="space-y-2">
                {form.watch('attachments')?.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-2 bg-muted/50">
                    <div className="flex items-center gap-2 truncate"><FileIcon className="h-4 w-4 text-muted-foreground" /><span className="text-sm truncate">{attachment.name}</span></div>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAttachment(index)}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button type="submit">{buttonText}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
