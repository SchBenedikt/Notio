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
import { Calendar as CalendarIcon, Loader2, Notebook, ListTodo, PencilLine } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { Subject, TimetableEntry, TaskType } from "@/lib/types";
import { Switch } from "./ui/switch";

const formSchema = z.object({
  subjectId: z.string().min(1, "Bitte wähle ein Fach aus."),
  type: z.enum(['homework', 'todo', 'note']),
  content: z.string().min(1, "Der Inhalt darf nicht leer sein.").max(200),
  hasDueDate: z.boolean().default(false),
  dueDateOption: z.enum(["next", "second", "custom"], {
    required_error: "Bitte wähle eine Fälligkeit.",
  }).optional(),
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

type AddTaskDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: { content: string; dueDate?: Date; subjectId: string, type: TaskType }) => Promise<void>;
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

    // Fallback if not found within 3 weeks
    const fallback = new Date(today);
    fallback.setDate(today.getDate() + 7 * n);
    return fallback;
};


export function AddTaskDialog({ isOpen, onOpenChange, onSubmit, subjects, timetable }: AddTaskDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectId: "",
      type: "homework",
      content: "",
      hasDueDate: true,
      dueDateOption: "next",
    }
  });

  const [nextLessonDate, setNextLessonDate] = useState(new Date());
  const [secondNextLessonDate, setSecondNextLessonDate] = useState(new Date());
  
  const selectedSubjectId = form.watch("subjectId");
  const taskType = form.watch("type");
  const hasDueDate = form.watch("hasDueDate");
  const dueDateOption = form.watch("dueDateOption");

  useEffect(() => {
    if (isOpen) {
      form.reset({
        subjectId: "",
        type: "homework",
        content: "",
        hasDueDate: true,
        dueDateOption: "next",
        customDate: undefined,
      });
    }
  }, [isOpen, form]);
  
  useEffect(() => {
      form.setValue('hasDueDate', taskType === 'homework');
      if (taskType === 'homework') {
          form.setValue('dueDateOption', 'next');
      }
  }, [taskType, form]);

  useEffect(() => {
    if (selectedSubjectId && timetable) {
        setNextLessonDate(getNthLessonDate(selectedSubjectId, timetable, 1));
        setSecondNextLessonDate(getNthLessonDate(selectedSubjectId, timetable, 2));
    }
  }, [selectedSubjectId, timetable]);

  const { isSubmitting } = form.formState;

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    let dueDate: Date | undefined;
    if (values.hasDueDate) {
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
    }
    await onSubmit({ content: values.content, dueDate, subjectId: values.subjectId, type: values.type as TaskType });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neue Aufgabe erstellen</DialogTitle>
          <DialogDescription>Wähle eine Art, ein Fach und gib die Details der Aufgabe ein.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
             <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Aufgaben-Typ</FormLabel>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-2 pt-1">
                        <Label htmlFor="type-homework" className={cn("flex flex-col items-center justify-center gap-2 rounded-md border-2 p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer", taskType === 'homework' && "border-primary")}>
                            <RadioGroupItem value="homework" id="type-homework" className="sr-only" />
                            <Notebook className="h-6 w-6" /> Hausaufgabe
                        </Label>
                         <Label htmlFor="type-todo" className={cn("flex flex-col items-center justify-center gap-2 rounded-md border-2 p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer", taskType === 'todo' && "border-primary")}>
                            <RadioGroupItem value="todo" id="type-todo" className="sr-only" />
                            <ListTodo className="h-6 w-6" /> To-Do
                        </Label>
                         <Label htmlFor="type-note" className={cn("flex flex-col items-center justify-center gap-2 rounded-md border-2 p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer", taskType === 'note' && "border-primary")}>
                            <RadioGroupItem value="note" id="type-note" className="sr-only" />
                            <PencilLine className="h-6 w-6" /> Notiz
                        </Label>
                    </RadioGroup>
                </FormItem>
                )}
            />

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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inhalt</FormLabel>
                  <FormControl><Textarea placeholder="z.B. S. 42 Nr. 5a,b" className="resize-none" {...field} /></FormControl>
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
                    </div>
                    <FormControl>
                    <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={taskType === 'homework'}
                    />
                    </FormControl>
                </FormItem>
                )}
            />
            
            {hasDueDate && (
                <div className="space-y-3 animate-fade-in-down">
                {taskType === 'homework' ? (
                <FormField
                    control={form.control}
                    name="dueDateOption"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                                <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-md border has-[:checked]:bg-muted">
                                    <FormControl><RadioGroupItem value="next" id="due-next" disabled={!selectedSubjectId} /></FormControl>
                                    <Label htmlFor="due-next" className={cn("font-normal w-full cursor-pointer", !selectedSubjectId && "text-muted-foreground/50")}>
                                        Nächste Stunde {selectedSubjectId && <span className="text-muted-foreground block text-xs">({format(nextLessonDate, "eeee, dd.MM.yyyy", { locale: de })})</span>}
                                    </Label>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-md border has-[:checked]:bg-muted">
                                    <FormControl><RadioGroupItem value="second" id="due-second" disabled={!selectedSubjectId} /></FormControl>
                                    <Label htmlFor="due-second" className={cn("font-normal w-full cursor-pointer", !selectedSubjectId && "text-muted-foreground/50")}>
                                        In 2. Stunde {selectedSubjectId && <span className="text-muted-foreground block text-xs">({format(secondNextLessonDate, "eeee, dd.MM.yyyy", { locale: de })})</span>}
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
                ) : <FormField control={form.control} name="dueDateOption" render={({ field }) => <input type="hidden" {...field} value="custom" />} />}

                {(dueDateOption === 'custom' || taskType !== 'homework') && (
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

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Abbrechen</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Aufgabe speichern
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
