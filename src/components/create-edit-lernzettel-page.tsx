"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Lernzettel, Subject, TimetableEntry, StudySet } from "@/lib/types";
import { Loader2, ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const formSchema = z.object({
  title: z.string().min(1, "Titel darf nicht leer sein.").max(100),
  subjectId: z.string().optional(),
  studySetId: z.string().optional(),
  content: z.string().min(1, "Inhalt darf nicht leer sein."),
  hasDueDate: z.boolean().default(false),
  dueDateOption: z.enum(["next", "second", "custom"]).optional(),
  customDate: z.date().optional(),
}).refine(data => {
    if (data.hasDueDate) {
      if (data.dueDateOption === 'custom') {
        return !!data.customDate;
      }
      return !!data.dueDateOption;
    }
    return true;
}, {
    message: "Bitte wähle ein Fälligkeitsdatum.",
    path: ["customDate"],
});


type FormValues = z.infer<typeof formSchema>;

const getNthLessonDate = (subjectId: string, timetable: TimetableEntry[], n: number): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIndex = (today.getDay() + 6) % 7; // Monday: 0, ..., Sunday: 6

    const lessonDaysForSubject = new Set(
        timetable.filter(e => e.subjectId === subjectId).map(e => e.day)
    );

    if (lessonDaysForSubject.size === 0) {
        const fallback = new Date(today);
        fallback.setDate(today.getDate() + (n === 1 ? 1 : 7)); // Fallback to tomorrow or a week later
        return fallback;
    }

    let lessonsFoundCount = 0;
    for (let i = 1; i <= 21; i++) { // Search up to 3 weeks ahead
        const futureDayIndex = (todayIndex + i) % 7;
        
        if (lessonDaysForSubject.has(futureDayIndex)) {
            lessonsFoundCount++;
            if (lessonsFoundCount === n) {
                const dueDate = new Date(today);
                dueDate.setDate(today.getDate() + i);
                return dueDate;
            }
        }
    }
    
    const fallback = new Date(today);
    fallback.setDate(today.getDate() + 7 * n);
    return fallback;
};


type CreateEditLernzettelPageProps = {
  onBack: () => void;
  onSave: (values: Omit<FormValues, 'id'>, lernzettelId?: string) => Promise<void>;
  lernzettelToEdit?: Lernzettel | null;
  subjects: Subject[];
  allStudySets: StudySet[];
  timetable: TimetableEntry[];
};

export function CreateEditLernzettelPage({ onBack, onSave, lernzettelToEdit, subjects, allStudySets, timetable }: CreateEditLernzettelPageProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subjectId: "",
      studySetId: "",
      content: "",
      hasDueDate: false,
    },
  });

  const { watch } = form;
  const hasDueDate = watch("hasDueDate");
  const selectedSubjectId = watch("subjectId");
  const dueDateOption = watch("dueDateOption");
  const [nextLessonDate, setNextLessonDate] = useState(new Date());
  const [secondNextLessonDate, setSecondNextLessonDate] = useState(new Date());

  useEffect(() => {
    if (lernzettelToEdit) {
      form.reset({
        title: lernzettelToEdit.title,
        subjectId: lernzettelToEdit.subjectId || "",
        studySetId: lernzettelToEdit.studySetId || "",
        content: lernzettelToEdit.content,
        hasDueDate: !!lernzettelToEdit.dueDate,
        customDate: lernzettelToEdit.dueDate ? new Date(lernzettelToEdit.dueDate) : undefined,
        dueDateOption: 'custom',
      });
    } else {
      form.reset({
        title: "",
        subjectId: "",
        studySetId: "",
        content: "",
        hasDueDate: false,
        dueDateOption: undefined,
        customDate: undefined,
      });
    }
  }, [lernzettelToEdit, form]);
  
  useEffect(() => {
    if (selectedSubjectId && timetable) {
        setNextLessonDate(getNthLessonDate(selectedSubjectId, timetable, 1));
        setSecondNextLessonDate(getNthLessonDate(selectedSubjectId, timetable, 2));
    }
  }, [selectedSubjectId, timetable]);

  const handleFormSubmit = async (values: FormValues) => {
    let finalDueDate: Date | undefined;
    if (values.hasDueDate) {
        switch(values.dueDateOption) {
            case 'next': finalDueDate = nextLessonDate; break;
            case 'second': finalDueDate = secondNextLessonDate; break;
            case 'custom': finalDueDate = values.customDate; break;
        }
    }
    await onSave({ ...values, dueDate: finalDueDate }, lernzettelToEdit?.id);
  };

  const { isSubmitting } = form.formState;

  const pageTitle = lernzettelToEdit ? 'Lernzettel bearbeiten' : 'Neuen Lernzettel erstellen';
  const pageDescription = lernzettelToEdit ? 'Ändere die Details deines Lernzettels.' : 'Fasse hier dein Wissen zusammen. Du kannst Markdown für die Formatierung verwenden.';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Button variant="ghost" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zu allen Lernzetteln
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{pageTitle}</CardTitle>
          <CardDescription>{pageDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titel</FormLabel>
                      <FormControl><Input placeholder="z.B. Die Weimarer Republik" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Fach (optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Einem Fach zuordnen..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {subjects.map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
              </div>
                <FormField
                    control={form.control}
                    name="studySetId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Lernset (optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Einem Lernset zuordnen..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {allStudySets.map((set) => (
                                <SelectItem key={set.id} value={set.id}>
                                {set.title}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
               <FormField
                control={form.control}
                name="hasDueDate"
                render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                    <FormLabel>Fälligkeitsdatum festlegen</FormLabel>
                    <FormDescription>Plane, bis wann du diesen Lernzettel beherrschen möchtest.</FormDescription>
                    </div>
                    <FormControl>
                    <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                    </FormControl>
                </FormItem>
                )}
            />
             {hasDueDate && (
                <div className="space-y-3 animate-fade-in-down pl-2">
                <FormField
                    control={form.control}
                    name="dueDateOption"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                                <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-md border has-[:checked]:bg-muted">
                                    <FormControl><RadioGroupItem value="next" id="due-next-note" disabled={!selectedSubjectId} /></FormControl>
                                    <Label htmlFor="due-next-note" className={cn("font-normal w-full cursor-pointer", !selectedSubjectId && "text-muted-foreground/50")}>
                                        Nächste Stunde {selectedSubjectId && <span className="text-muted-foreground block text-xs">({format(nextLessonDate, "eeee, dd.MM.yyyy", { locale: de })})</span>}
                                    </Label>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-md border has-[:checked]:bg-muted">
                                    <FormControl><RadioGroupItem value="second" id="due-second-note" disabled={!selectedSubjectId} /></FormControl>
                                    <Label htmlFor="due-second-note" className={cn("font-normal w-full cursor-pointer", !selectedSubjectId && "text-muted-foreground/50")}>
                                        In 2. Stunde {selectedSubjectId && <span className="text-muted-foreground block text-xs">({format(secondNextLessonDate, "eeee, dd.MM.yyyy", { locale: de })})</span>}
                                    </Label>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-md border has-[:checked]:bg-muted">
                                    <FormControl><RadioGroupItem value="custom" id="due-custom-note"/></FormControl>
                                    <Label htmlFor="due-custom-note" className="font-normal w-full cursor-pointer">Datum wählen</Label>
                                </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {dueDateOption === 'custom' && (
                <FormField
                    control={form.control}
                    name="customDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col animate-fade-in-down">
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP", { locale: de }) : <span>Wähle ein Datum</span>}
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                )}
                </div>
            )}
              <Separator />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inhalt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Schreibe hier deine Zusammenfassung... Markdown wird unterstützt."
                        className="min-h-[40vh] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Tipp: Verlinke andere Lernzettel mit `[Link-Text](/lernzettel/ID_DES_ZETTELS)`.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={onBack} disabled={isSubmitting}>Abbrechen</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {lernzettelToEdit ? 'Änderungen speichern' : 'Lernzettel erstellen'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
