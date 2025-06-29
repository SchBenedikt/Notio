"use client";

import { useEffect, useRef } from "react";
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
import type { AddGradeData, Grade, Attachment } from "@/lib/types";
import { Textarea } from "./ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar as CalendarIcon, UploadCloud, File as FileIcon, X } from "lucide-react";
import { Calendar } from "./ui/calendar";


const formSchema = z.object({
  date: z.date({
    required_error: "Ein Datum ist erforderlich.",
  }),
  type: z.enum(["Schulaufgabe", "mündliche Note"], {
    required_error: "Du musst einen Notentyp auswählen.",
  }),
  name: z.string().max(50, "Name darf nicht länger als 50 Zeichen sein.").optional(),
  value: z.preprocess(
    (val) => (val === "" || val == null ? undefined : Number(val)),
    z.number({ invalid_type_error: "Muss eine Zahl sein" }).min(1, "Note muss 1-6 sein").max(6, "Note muss 1-6 sein").optional()
  ),
  weight: z.coerce.number().min(0.1, "Gewichtung muss positiv sein.").default(1),
  notes: z.string().max(100, "Notiz darf nicht länger als 100 Zeichen sein.").optional(),
  attachments: z.array(z.object({
    name: z.string(),
    dataUrl: z.string(),
  })).optional(),
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
  attachments: [],
}

export function AddGradeDialog({ isOpen, onOpenChange, onSubmit, subjectName, gradeToEdit }: AddGradeFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (gradeToEdit) {
        form.reset({
          ...gradeToEdit,
          date: new Date(gradeToEdit.date),
          value: gradeToEdit.value ?? undefined,
          attachments: gradeToEdit.attachments || [],
        });
      } else {
        form.reset(defaultFormValues);
      }
    }
  }, [isOpen, gradeToEdit, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const filePromises = Array.from(files).map(file => {
      return new Promise<Attachment>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({ name: file.name, dataUrl: e.target?.result as string });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(results => {
      const currentAttachments = form.getValues('attachments') || [];
      form.setValue('attachments', [...currentAttachments, ...results]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    const currentAttachments = form.getValues('attachments') || [];
    form.setValue('attachments', currentAttachments.filter((_, index) => index !== indexToRemove));
  };
  
  const attachments = form.watch('attachments');

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values, gradeToEdit?.id);
    onOpenChange(false);
  };
  
  const title = gradeToEdit ? 'Note bearbeiten' : 'Neue Note / Planung';
  const description = gradeToEdit 
      ? 'Ändere die Details der Note.' 
      : 'Füge eine neue Note hinzu. Lass das Notenfeld leer, um einen Termin zu planen.';
  const buttonText = gradeToEdit ? 'Änderungen speichern' : 'Speichern';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
                  <FormLabel>Note (optional, 1-6)</FormLabel>
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

            <div className="space-y-2">
              <FormLabel>Anhänge (optional)</FormLabel>
              <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                <UploadCloud className="mr-2 h-4 w-4" />
                Dateien auswählen
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={handleFileChange}
              />
              <div className="space-y-2">
                {attachments?.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md border p-2 bg-muted/50">
                    <div className="flex items-center gap-2 truncate">
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{attachment.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button type="submit">{buttonText}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
