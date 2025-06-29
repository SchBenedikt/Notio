"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import type { StudySet, Subject } from "@/lib/types";
import { PlusCircle, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const cardSchema = z.object({
  id: z.string(),
  term: z.string().min(1, "Begriff darf nicht leer sein."),
  definition: z.string().min(1, "Definition darf nicht leer sein."),
});

const formSchema = z.object({
  title: z.string().min(1, "Titel darf nicht leer sein.").max(100),
  description: z.string().max(500).optional(),
  subjectId: z.string().optional(),
  cards: z.array(cardSchema).min(1, "Es muss mindestens eine Karteikarte vorhanden sein."),
});

type FormValues = z.infer<typeof formSchema>;

type CreateEditStudySetPageProps = {
  onBack: () => void;
  onSave: (values: Omit<StudySet, 'id' | 'gradeLevel'>, setId?: string) => Promise<void>;
  studySetToEdit?: StudySet | null;
  subjects: Subject[];
};

export function CreateEditStudySetPage({ onBack, onSave, studySetToEdit, subjects }: CreateEditStudySetPageProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      subjectId: undefined,
      cards: [{ id: `new-${Date.now()}`, term: "", definition: "" }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cards",
  });

  useEffect(() => {
    if (studySetToEdit) {
      form.reset({
        title: studySetToEdit.title,
        description: studySetToEdit.description || "",
        subjectId: studySetToEdit.subjectId || undefined,
        cards: studySetToEdit.cards,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        subjectId: undefined,
        cards: [{ id: `new-${Date.now()}`, term: "", definition: "" }],
      });
    }
  }, [studySetToEdit, form]);

  const handleFormSubmit = async (values: FormValues) => {
    await onSave(values, studySetToEdit?.id);
  };

  const { isSubmitting } = form.formState;
  
  const pageTitle = studySetToEdit ? 'Lernset bearbeiten' : 'Neues Lernset erstellen';
  const pageDescription = studySetToEdit ? 'Ändere die Details deines Lernsets.' : 'Erstelle ein neues Lernset mit Begriffen und Definitionen.';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <div>
            <Button variant="ghost" onClick={onBack} disabled={isSubmitting}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zu allen Lernsets
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
                        <Separator />
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-3 relative bg-muted/50">
                                <div className="flex justify-between items-center mb-2">
                                    <FormLabel className="font-semibold">Karte {index + 1}</FormLabel>
                                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => remove(index)} disabled={fields.length <= 1}>
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
                        <div>
                            <Button type="button" variant="outline" className="w-full" onClick={() => append({ id: `new-${Date.now()}`, term: "", definition: "" })}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Karte hinzufügen
                            </Button>
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="ghost" onClick={onBack} disabled={isSubmitting}>Abbrechen</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {studySetToEdit ? 'Änderungen speichern' : 'Lernset erstellen'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
