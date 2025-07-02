"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Subject, TimetableEntry } from "@/lib/types";
import { Loader2, Trash2 } from "lucide-react";

const formSchema = z.object({
  subjectId: z.string({
    required_error: "Bitte wähle ein Fach aus.",
  }),
  room: z.string().max(20, "Raum darf nicht länger als 20 Zeichen sein.").optional(),
});

type EditTimetableEntryDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  onDelete: () => Promise<void>;
  entryToEdit?: TimetableEntry | null;
  subjects: Subject[];
};

export function EditTimetableEntryDialog({ isOpen, onOpenChange, onSubmit, onDelete, entryToEdit, subjects }: EditTimetableEntryDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

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
  );
}
