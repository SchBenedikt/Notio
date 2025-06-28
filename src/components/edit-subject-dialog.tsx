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
import type { Subject } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Der Name muss mindestens 2 Zeichen lang sein.").max(50),
  category: z.enum(["Hauptfach", "Nebenfach"], {
    required_error: "Du musst eine Kategorie auswählen.",
  }),
  targetGrade: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number({invalid_type_error: "Muss eine Zahl sein"}).min(1, "Note muss 1-6 sein").max(6, "Note muss 1-6 sein").optional()
  ),
});

type EditSubjectFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (subjectId: string, values: z.infer<typeof formSchema>) => void;
  subject: Subject;
};

export function EditSubjectDialog({ isOpen, onOpenChange, onSubmit, subject }: EditSubjectFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isOpen) {
        form.reset({
            name: subject.name,
            category: subject.category,
            targetGrade: subject.targetGrade
        })
    }
  }, [isOpen, subject, form])

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(subject.id, values);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Fach bearbeiten</DialogTitle>
          <DialogDescription>
            Ändere den Namen, die Kategorie oder die Wunschnote des Fachs "{subject.name}".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fachname</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Mathematik" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Kategorie</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Hauptfach" />
                        </FormControl>
                        <FormLabel className="font-normal">Hauptfach</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Nebenfach" />
                        </FormControl>
                        <FormLabel className="font-normal">Nebenfach</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="targetGrade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wunschnote (optional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="z.B. 2,5" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button type="submit">Änderungen speichern</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
