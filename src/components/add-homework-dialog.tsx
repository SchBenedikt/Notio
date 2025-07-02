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
  entry: TimetableEntry;
};

export function AddHomeworkDialog({ isOpen, onOpenChange, onSubmit, entry }: AddHomeworkDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task: "",
      dueDateOption: "next",
    }
  });

  const dueDateOption = form.watch("dueDateOption");

  useEffect(() => {
    if (isOpen) {
      form.reset({
        task: "",
        dueDateOption: "next",
        customDate: undefined,
      });
    }
  }, [isOpen, form]);

  const { isSubmitting } = form.formState;
  
  const calculateDueDate = (option: 'next' | 'second' | 'custom', customDate?: Date): Date => {
      const today = new Date();
      today.setHours(0,0,0,0);
      const lessonDay = entry.day; // 0=Mon, 1=Tue etc.
      const todayWeekday = (today.getDay() + 6) % 7; // Adjust to 0=Mon

      let daysUntilNextLesson = (lessonDay - todayWeekday + 7) % 7;
      // If the lesson is later today, it's 0. We want the *next* occurrence.
      if (daysUntilNextLesson === 0) {
          daysUntilNextLesson = 7;
      }

      const nextLessonDate = new Date(today);
      if (option === 'next') {
          nextLessonDate.setDate(today.getDate() + daysUntilNextLesson);
      } else if (option === 'second') {
          nextLessonDate.setDate(today.getDate() + daysUntilNextLesson + 7);
      } else if (customDate) {
          return customDate;
      }
      return nextLessonDate;
  }

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    const dueDate = calculateDueDate(values.dueDateOption, values.customDate);
    await onSubmit({ task: values.task, dueDate, subjectId: entry.subjectId });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neue Hausaufgabe</DialogTitle>
          <DialogDescription>Füge eine neue Hausaufgabe für diese Stunde hinzu.</DialogDescription>
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
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="next" /></FormControl>
                        <FormLabel className="font-normal">Nächste Stunde</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="second" /></FormControl>
                        <FormLabel className="font-normal">In der 2. nächsten Stunde</FormLabel>
                      </FormItem>
                       <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="custom" /></FormControl>
                        <FormLabel className="font-normal">Datum wählen</FormLabel>
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
