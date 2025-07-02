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
import type { TimetableEntry } from "@/lib/types";

const formSchema = z.object({
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
  entry: TimetableEntry & { subjectName?: string };
};

const getNthLessonDate = (n: number, lessonDay: number): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayDayOfWeek = (today.getDay() + 6) % 7; // Make Monday 0
    
    let daysToAdd = (lessonDay - todayDayOfWeek + 7) % 7;
    
    // If the lesson is today, the 'next' (1st) one is in 7 days.
    if (daysToAdd === 0) {
        daysToAdd = 7;
    }

    // Add extra weeks if n > 1
    if (n > 1) {
       daysToAdd += (n - 1) * 7;
    }
    
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + daysToAdd);
    return dueDate;
};


export function AddHomeworkDialog({ isOpen, onOpenChange, onSubmit, entry }: AddHomeworkDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task: "",
      dueDateOption: "next",
    }
  });

  const [nextLessonDate, setNextLessonDate] = useState(new Date());
  const [secondNextLessonDate, setSecondNextLessonDate] = useState(new Date());

  const dueDateOption = form.watch("dueDateOption");

  useEffect(() => {
    if (isOpen) {
      form.reset({
        task: "",
        dueDateOption: "next",
        customDate: undefined,
      });
      setNextLessonDate(getNthLessonDate(1, entry.day));
      setSecondNextLessonDate(getNthLessonDate(2, entry.day));
    }
  }, [isOpen, form, entry.day]);

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
    await onSubmit({ task: values.task, dueDate, subjectId: entry.subjectId });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neue Hausaufgabe</DialogTitle>
          <DialogDescription>Füge eine neue Hausaufgabe für {entry.subjectName || 'diese Stunde'} hinzu.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
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
                        <FormControl><RadioGroupItem value="next" id="due-next" /></FormControl>
                        <Label htmlFor="due-next" className="font-normal w-full cursor-pointer">
                            Nächste Stunde
                            <span className="text-muted-foreground block text-xs">({format(nextLessonDate, "eeee, dd.MM.yyyy", { locale: de })})</span>
                        </Label>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 p-3 rounded-md border has-[:checked]:bg-muted">
                        <FormControl><RadioGroupItem value="second" id="due-second" /></FormControl>
                        <Label htmlFor="due-second" className="font-normal w-full cursor-pointer">
                            In der 2. nächsten Stunde
                             <span className="text-muted-foreground block text-xs">({format(secondNextLessonDate, "eeee, dd.MM.yyyy", { locale: de })})</span>
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
