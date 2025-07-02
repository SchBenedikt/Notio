"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Subject, TimetableEntry } from "@/lib/types";

const formSchema = z.object({
  subjectId: z.string().min(1, "Bitte wähle ein Fach aus."),
  task: z.string().min(1, "Die Aufgabe darf nicht leer sein.").max(200),
  dueDateOption: z.enum(["next", "second", "custom"], {
    required_error: "Bitte wähle eine Fälligkeit.",
  }),
  customDate: z.date().optional(),
}).refine(data => {
    if (data.dueDateOption === 'custom') {
      return !!data.customDate;
    }
    return true;
}, {
    message: "Bitte wähle ein benutzerdefiniertes Datum.",
    path: ["customDate"],
});

type AddHomeworkDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: { task: string; dueDate: Date; subjectId: string }) => Promise<void>;
  subjects: Subject[];
  timetable: TimetableEntry[];
};

const getNthLessonDate = (subjectId: string, timetable: TimetableEntry[], n: number): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIndex = (today.getDay() + 6) % 7; // Monday: 0, ..., Sunday: 6

    const lessonDaysForSubject = new Set(
        timetable.filter(e => e.subjectId === subjectId).map(e => e.day)
    );

    if (lessonDaysForSubject.size === 0) {
        const fallback = new Date(today);
        fallback.setDate(today.getDate() + 7 * n); // Fallback to n weeks later
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

    // Fallback if not found within 3 weeks
    const fallback = new Date(today);
    fallback.setDate(today.getDate() + 7 * n);
    return fallback;
};


export function AddHomeworkDialog({ isOpen, onOpenChange, onSubmit, subjects, timetable }: AddHomeworkDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectId: "",
      task: "",
      dueDateOption: "next",
    }
  });

  const [nextLessonDate, setNextLessonDate] = useState(new Date());
  const [secondNextLessonDate, setSecondNextLessonDate] = useState(new Date());
  
  const selectedSubjectId = form.watch("subjectId");
  const dueDateOption = form.watch("dueDateOption");

  useEffect(() => {
    if (isOpen) {
      form.reset({
        subjectId: "",
        task: "",
        dueDateOption: "next",
        customDate: undefined,
      });
    }
  }, [isOpen, form]);

  useEffect(() => {
    if (selectedSubjectId && timetable) {
        setNextLessonDate(getNthLessonDate(selectedSubjectId, timetable, 1));
        setSecondNextLessonDate(getNthLessonDate(selectedSubjectId, timetable, 2));
    }
  }, [selectedSubjectId, timetable]);

  const { isSubmitting } = form.formState;

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    let dueDate: Date;
    switch(values.dueDateOption) {
        case 'next':
            dueDate = nextLessonDate;
            break;
        case 'second':
            dueDate = secondNextLessonDate;
            break;
        case 'custom':
            dueDate = values.customDate!;
            break;
    }
    await onSubmit({ task: values.task, dueDate, subjectId: values.subjectId });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neue Hausaufgabe erstellen</DialogTitle>
          <DialogDescription>Wähle ein Fach und gib die Details der Hausaufgabe ein.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
             <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fach</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wähle ein Fach..." />
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
            <FormField
              control={form.control}
              name="task"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aufgabe</FormLabel>
                  <FormControl><Textarea placeholder="z.B. S. 42 Nr. 5a,b" className="resize-none" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dueDateOption"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Fällig</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                      <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-md border has-[:checked]:bg-muted">
                        <FormControl><RadioGroupItem value="next" id="due-next" disabled={!selectedSubjectId} /></FormControl>
                        <Label htmlFor="due-next" className={cn("font-normal w-full cursor-pointer", !selectedSubjectId && "text-muted-foreground/50")}>
                            Nächste Stunde
                            {selectedSubjectId && <span className="text-muted-foreground block text-xs">({format(nextLessonDate, "eeee, dd.MM.yyyy", { locale: de })})</span>}
                        </Label>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-md border has-[:checked]:bg-muted">
                        <FormControl><RadioGroupItem value="second" id="due-second" disabled={!selectedSubjectId} /></FormControl>
                        <Label htmlFor="due-second" className={cn("font-normal w-full cursor-pointer", !selectedSubjectId && "text-muted-foreground/50")}>
                            In der 2. nächsten Stunde
                             {selectedSubjectId && <span className="text-muted-foreground block text-xs">({format(secondNextLessonDate, "eeee, dd.MM.yyyy", { locale: de })})</span>}
                        </Label>
                      </FormItem>
                       <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-md border has-[:checked]:bg-muted">
                        <FormControl><RadioGroupItem value="custom" id="due-custom"/></FormControl>
                        <Label htmlFor="due-custom" className="font-normal w-full cursor-pointer">Datum wählen</Label>
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

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Abbrechen</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hausaufgabe speichern
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
