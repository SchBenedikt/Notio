"use client";

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
import type { AddGradeData } from "@/lib/types";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
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
  onSubmit: (values: AddGradeData) => void;
  subjectName: string;
};

const defaultFormValues = {
  type: "mündliche Note" as const,
  name: "",
  value: undefined,
  weight: 1,
  notes: "",
}

export function AddGradeDialog({ isOpen, onOpenChange, onSubmit, subjectName }: AddGradeFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    form.reset(defaultFormValues);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if(!open) form.reset(defaultFormValues);
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neue Note für {subjectName}</DialogTitle>
          <DialogDescription>
            Gib die Details für die neue Note ein.
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
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (1-6)</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" placeholder="z.B. 2" {...field} />
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
                    <Input type="number" step="0.5" placeholder="z.B. 1 oder 2" {...field} />
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
              <Button type="submit">Note speichern</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
