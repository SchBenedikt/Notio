"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Lernzettel, Subject } from "@/lib/types";
import { Loader2, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";

const formSchema = z.object({
  title: z.string().min(1, "Titel darf nicht leer sein.").max(100),
  subjectId: z.string().optional(),
  content: z.string().min(1, "Inhalt darf nicht leer sein."),
});

type FormValues = z.infer<typeof formSchema>;

type CreateEditLernzettelPageProps = {
  onBack: () => void;
  onSave: (values: Omit<FormValues, 'id'>, lernzettelId?: string) => Promise<void>;
  lernzettelToEdit?: Lernzettel | null;
  subjects: Subject[];
};

export function CreateEditLernzettelPage({ onBack, onSave, lernzettelToEdit, subjects }: CreateEditLernzettelPageProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subjectId: "",
      content: "",
    },
  });

  useEffect(() => {
    if (lernzettelToEdit) {
      form.reset({
        title: lernzettelToEdit.title,
        subjectId: lernzettelToEdit.subjectId || "",
        content: lernzettelToEdit.content,
      });
    } else {
      form.reset({
        title: "",
        subjectId: "",
        content: "",
      });
    }
  }, [lernzettelToEdit, form]);

  const handleFormSubmit = async (values: FormValues) => {
    await onSave(values, lernzettelToEdit?.id);
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
