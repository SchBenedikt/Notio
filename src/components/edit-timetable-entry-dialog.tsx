"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AddSubjectData, Subject, TimetableEntry } from "@/lib/types";
import { Loader2, Trash2, Plus } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const formSchema = z.object({
  subjectId: z.string({
    required_error: "Bitte wähle ein Fach aus.",
  }),
  room: z.string().max(20, "Raum darf nicht länger als 20 Zeichen sein.").optional(),
});

const addSubjectFormSchema = z.object({
  name: z.string().min(2, "Der Name muss mindestens 2 Zeichen lang sein.").max(50),
  category: z.enum(["Hauptfach", "Nebenfach"], {
    required_error: "Du musst eine Kategorie auswählen.",
  }),
  targetGrade: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number({invalid_type_error: "Muss eine Zahl sein"}).min(1, "Note muss 1-6 sein").max(6, "Note muss 1-6 sein").optional()
  ),
});

type EditTimetableEntryDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  onDelete: () => Promise<void>;
  onAddSubject: (values: AddSubjectData) => Promise<string>;
  entryToEdit?: TimetableEntry | null;
  subjects: Subject[];
};

function AddSubjectInlineDialog({ onAddSubject, onClose, onSubjectAdded }: { onAddSubject: (values: AddSubjectData) => Promise<string>, onClose: () => void, onSubjectAdded: (id: string) => void }) {
  const form = useForm<z.infer<typeof addSubjectFormSchema>>({
    resolver: zodResolver(addSubjectFormSchema),
    defaultValues: {
      name: "",
      category: "Nebenfach",
    },
  });

  const { isSubmitting } = form.formState;

  const handleFormSubmit = async (values: z.infer<typeof addSubjectFormSchema>) => {
    const newId = await onAddSubject(values);
    onSubjectAdded(newId);
    onClose();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Neues Fach erstellen</DialogTitle>
        <DialogDescription>
          Erstelle ein neues Fach, das sofort im Stundenplan verwendet werden kann.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
           <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fachname</FormLabel>
                  <FormControl><Input placeholder="z.B. Sport" {...field} /></FormControl>
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
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                      <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Hauptfach" /></FormControl><FormLabel className="font-normal">Hauptfach</FormLabel></FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="Nebenfach" /></FormControl><FormLabel className="font-normal">Nebenfach</FormLabel></FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Abbrechen</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fach erstellen
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}


export function EditTimetableEntryDialog({ isOpen, onOpenChange, onSubmit, onDelete, onAddSubject, entryToEdit, subjects }: EditTimetableEntryDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      form.reset({
        subjectId: entryToEdit?.subjectId || "",
        room: entryToEdit?.room || "",
      });
    }
  }, [isOpen, entryToEdit, form]);

  const { isSubmitting } = form.formState;

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values);
    onOpenChange(false);
  };
  
  const handleDelete = async () => {
    await onDelete();
    onOpenChange(false);
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{entryToEdit ? 'Stunde bearbeiten' : 'Neue Stunde hinzufügen'}</DialogTitle>
          <DialogDescription>Wähle ein Fach und optional einen Raum für diese Stunde.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fach</FormLabel>
                   <div className="flex items-center gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="flex-1">
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
                     <Button type="button" variant="outline" onClick={() => setIsAddSubjectOpen(true)} className="shrink-0">
                      <Plus className="mr-2 h-4 w-4" /> Neu
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="room"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raum (optional)</FormLabel>
                  <FormControl><Input placeholder="z.B. R101" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="sm:justify-between">
              {entryToEdit ? (
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Löschen
                </Button>
              ) : <div></div>}
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Abbrechen</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Speichern
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
        <AddSubjectInlineDialog 
            onClose={() => setIsAddSubjectOpen(false)}
            onAddSubject={onAddSubject}
            onSubjectAdded={(newId) => form.setValue('subjectId', newId)}
        />
    </Dialog>
    </>
  );
}
