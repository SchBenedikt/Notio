"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { StudySet } from "@/lib/types";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";

const cardSchema = z.object({
  id: z.string(),
  term: z.string().min(1, "Begriff darf nicht leer sein."),
  definition: z.string().min(1, "Definition darf nicht leer sein."),
});

const formSchema = z.object({
  title: z.string().min(1, "Titel darf nicht leer sein.").max(100),
  description: z.string().max(500).optional(),
  cards: z.array(cardSchema).min(1, "Es muss mindestens eine Karteikarte vorhanden sein."),
});

type FormValues = z.infer<typeof formSchema>;

type CreateEditStudySetDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: Omit<StudySet, 'id' | 'gradeLevel'>, setId?: string) => Promise<void>;
  studySetToEdit?: StudySet | null;
};

export function CreateEditStudySetDialog({ isOpen, onOpenChange, onSubmit, studySetToEdit }: CreateEditStudySetDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      cards: [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cards",
  });

  useEffect(() => {
    if (isOpen) {
      if (studySetToEdit) {
        form.reset({
          title: studySetToEdit.title,
          description: studySetToEdit.description || "",
          cards: studySetToEdit.cards,
        });
      } else {
        form.reset({
          title: "",
          description: "",
          cards: [{ id: `new-${Date.now()}`, term: "", definition: "" }],
        });
      }
    }
  }, [isOpen, studySetToEdit, form]);

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit(values, studySetToEdit?.id);
    onOpenChange(false);
  };

  const { isSubmitting } = form.formState;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl grid-rows-[auto_1fr_auto] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{studySetToEdit ? 'Lernset bearbeiten' : 'Neues Lernset erstellen'}</DialogTitle>
          <DialogDescription>
            {studySetToEdit ? 'Ändere die Details deines Lernsets.' : 'Erstelle ein neues Lernset mit Begriffen und Definitionen.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 overflow-hidden flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel</FormLabel>
                    <FormControl><Input placeholder="z.B. Biologie - Zellbiologie" {...field} /></FormControl>
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
                    <FormControl><Input placeholder="z.B. Kapitel 1-3 im Lehrbuch" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator />
            <ScrollArea className="flex-1 pr-4 -mr-4">
              <div className="space-y-4 pr-1">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg space-y-3 relative bg-muted/50">
                    <div className="flex justify-between items-center mb-2">
                        <FormLabel className="font-semibold">Karte {index + 1}</FormLabel>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name={`cards.${index}.term`}
                        render={({ field }) => (
                            <FormItem><FormLabel>Begriff</FormLabel><FormControl><Textarea placeholder="z.B. Mitochondrium" {...field} className="bg-background" /></FormControl><FormMessage /></FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name={`cards.${index}.definition`}
                        render={({ field }) => (
                            <FormItem><FormLabel>Definition</FormLabel><FormControl><Textarea placeholder="z.B. Kraftwerk der Zelle" {...field} className="bg-background" /></FormControl><FormMessage /></FormItem>
                        )}
                        />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
             <div className="pt-2">
                <Button type="button" variant="outline" className="w-full" onClick={() => append({ id: `new-${Date.now()}`, term: "", definition: "" })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Karte hinzufügen
                </Button>
            </div>
            <DialogFooter className="pt-4 border-t mt-auto">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {studySetToEdit ? 'Änderungen speichern' : 'Lernset erstellen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
