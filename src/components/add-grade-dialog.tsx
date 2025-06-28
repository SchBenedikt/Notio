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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { AddGradeData, Grade } from "@/lib/types";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";


const formSchema = z.object({
  date: z.date({
    required_error: "Ein Datum ist erforderlich.",
  }),
  type: z.enum(["Schulaufgabe", "mündliche Note"], {
    required_error: "Du musst einen Notentyp auswählen.",
  }),
  name: z.string().max(50, "Name darf nicht länger als 50 Zeichen sein.").optional(),
  value: z.coerce.number().min(1, "Note muss 1-6 sein.").max(6, "Note muss 1-6 sein."),
  weight: z.coerce.number().min(0.1, "Gewichtung muss positiv sein.").default(1),
  notes: z.string().max(100, "Notiz darf nicht länger als 100 Zeichen sein.").optional(),
});

type AddGradeFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: AddGradeData, gradeId?: string) => void;
  subjectName: string;
  gradeToEdit?: Grade | null;
};

const defaultFormValues = {
  date: new Date(),
  type: "mündliche Note" as const,
  name: "",
  value: undefined,
  weight: 1,
  notes: "",
}

export function AddGradeDialog({ isOpen, onOpenChange, onSubmit, subjectName, gradeToEdit }: AddGradeFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (gradeToEdit) {
        form.reset({
          ...gradeToEdit,
          date: new Date(gradeToEdit.date),
        });
      } else {
        form.reset(defaultFormValues);
      }
    }
  }, [isOpen, gradeToEdit, form]);

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values, gradeToEdit?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{gradeToEdit ? 'Note bearbeiten' : `Neue Note für ${subjectName}`}</DialogTitle>
          <DialogDescription>
            {gradeToEdit ? 'Ändere die Details für die Note.' : 'Gib die Details für die neue Note ein.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-4">
             <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Notentyp</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Schulaufgabe" />
                        </FormControl>
                        <FormLabel className="font-normal">Schulaufgabe</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="mündliche Note" />
                        </FormControl>
                        <FormLabel className="font-normal">Mündliche Note</FormLabel>
                      </FormItem>
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
                  <FormLabel>Note (1-6)</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" placeholder="z.B. 2" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP", { locale: de })
                          ) : (
                            <span>Wähle ein Datum</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                          disabled={(date) =>
                          date > new Date() || date < new Date("2000-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bezeichnung (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Vokabeltest, Referat" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gewichtung</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.5" placeholder="z.B. 1 oder 2" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notiz (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="z.B. Thema der Ex, Schwierigkeiten..."
                      className="resize-none"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button type="submit">{gradeToEdit ? 'Änderungen speichern' : 'Note speichern'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
