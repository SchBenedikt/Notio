"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { SchoolEvent, SchoolEventType } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import type { DateRange } from "react-day-picker";

const eventTypes: SchoolEventType[] = ["Prüfung", "Hausaufgabe", "Ferien", "Veranstaltung", "Sonstiges"];

const formSchema = z.object({
  title: z.string().min(2, "Titel muss mindestens 2 Zeichen lang sein.").max(50),
  date: z.date().optional(),
  dateRange: z.custom<DateRange>().optional(),
  type: z.enum(eventTypes, {
    required_error: "Du musst einen Ereignistyp auswählen.",
  }),
  target: z.enum(['school', 'gradeLevel'], {
    required_error: "Bitte wähle eine Zielgruppe aus."
  }),
  description: z.string().max(200, "Beschreibung darf nicht länger als 200 Zeichen sein.").optional(),
}).refine((data) => {
    if (data.type === 'Ferien') {
        return !!data.dateRange?.from;
    }
    return !!data.date;
}, {
    message: "Ein Datum ist erforderlich.",
    path: ["date"],
});

type FormValues = z.infer<typeof formSchema>;

type AddSchoolEventDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: Omit<SchoolEvent, 'id' | 'schoolId' | 'authorId' | 'authorName' | 'createdAt' | 'gradeLevel'>, eventId?: string) => Promise<void>;
  eventToEdit?: SchoolEvent | null;
  selectedDate?: Date;
};

export function AddSchoolEventDialog({ isOpen, onOpenChange, onSubmit, eventToEdit, selectedDate }: AddSchoolEventDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const eventType = form.watch("type");

  useEffect(() => {
    if (isOpen) {
        if (eventToEdit) {
            form.reset({
                title: eventToEdit.title,
                description: eventToEdit.description || "",
                type: eventToEdit.type,
                target: eventToEdit.target,
                ...(eventToEdit.type === 'Ferien'
                    ? { dateRange: { from: new Date(eventToEdit.date), to: eventToEdit.endDate ? new Date(eventToEdit.endDate) : undefined } }
                    : { date: new Date(eventToEdit.date) }
                ),
            });
        } else {
            form.reset({
                title: "",
                description: "",
                type: "Prüfung",
                date: selectedDate || new Date(),
                dateRange: { from: selectedDate || new Date(), to: addDays(selectedDate || new Date(), 7) },
                target: 'school',
            });
        }
    }
  }, [isOpen, eventToEdit, selectedDate, form]);

  const { isSubmitting } = form.formState;

  const handleFormSubmit = async (values: FormValues) => {
    const submissionData = {
        title: values.title,
        description: values.description,
        type: values.type,
        target: values.target,
        date: (values.type === 'Ferien' ? values.dateRange!.from! : values.date!).toISOString(),
        endDate: values.type === 'Ferien' ? (values.dateRange!.to?.toISOString() || values.dateRange!.from!.toISOString()) : undefined,
    } as Omit<SchoolEvent, 'id' | 'schoolId' | 'authorId' | 'authorName' | 'createdAt' | 'gradeLevel'>;
    
    await onSubmit(submissionData, eventToEdit?.id);
    onOpenChange(false);
  };
  
  const dialogTitle = eventToEdit ? 'Schulereignis bearbeiten' : 'Neues Schulereignis erstellen';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>Füge einen neuen Termin für deine Schule hinzu. Wähle aus, wer ihn sehen kann.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel</FormLabel>
                  <FormControl><Input placeholder="z.B. Mathematik-Schulaufgabe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {eventType === 'Ferien' ? (
                 <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Zeitraum</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "LLL dd, y")} -{" "}
                                    {format(field.value.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(field.value.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Wähle einen Zeitraum</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            locale={de}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            ) : (
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Datum</FormLabel>
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
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={de} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            )}
            <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Typ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Wähle einen Typ..." /></SelectTrigger></FormControl>
                    <SelectContent>
                        {eventTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Sichtbar für</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="school" /></FormControl>
                        <FormLabel className="font-normal">Ganze Schule</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl><RadioGroupItem value="gradeLevel" /></FormControl>
                        <FormLabel className="font-normal">Nur meine Jahrgangsstufe</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
                )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung (optional)</FormLabel>
                  <FormControl><Textarea placeholder="z.B. Themen: Kapitel 1-5" className="resize-none" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Abbrechen</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ereignis speichern
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
