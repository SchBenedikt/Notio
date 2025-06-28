"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AddGradeData, AddSubjectData, Subject } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { BookUp, ListPlus, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

const addSubjectSchema = z.object({
  name: z.string().min(2, "Der Name muss mindestens 2 Zeichen lang sein.").max(50),
  category: z.enum(["Hauptfach", "Nebenfach"], {
    required_error: "Du musst eine Kategorie auswählen.",
  }),
});

const addGradeSchema = z.object({
  subjectId: z.string({ required_error: "Bitte wähle ein Fach aus." }),
  type: z.enum(["Schulaufgabe", "mündliche Note"], {
    required_error: "Du musst einen Notentyp auswählen.",
  }),
  value: z.coerce.number().min(1, "Note muss 1-6 sein.").max(6, "Note muss 1-6 sein."),
  weight: z.coerce.number().min(0.1, "Gewichtung muss positiv sein.").default(1),
  notes: z.string().max(100, "Notiz darf nicht länger als 100 Zeichen sein.").optional(),
});

type AppSidebarProps = {
  subjects: Subject[];
  overallAverage: string;
  onAddSubject: (values: AddSubjectData) => void;
  onAddGrade: (subjectId: string, values: Omit<AddGradeData, 'subjectId'>) => void;
};

export function AppSidebar({ subjects, overallAverage, onAddSubject, onAddGrade }: AppSidebarProps) {
    const [openView, setOpenView] = useState<'subject' | 'grade' | null>(null);

    const subjectForm = useForm<z.infer<typeof addSubjectSchema>>({
        resolver: zodResolver(addSubjectSchema),
        defaultValues: { name: "", category: "Nebenfach" },
    });

    const gradeForm = useForm<z.infer<typeof addGradeSchema>>({
        resolver: zodResolver(addGradeSchema),
        defaultValues: { type: "mündliche Note", value: undefined, weight: 1, notes: "" },
    });

    const handleSubjectSubmit = (values: z.infer<typeof addSubjectSchema>) => {
        onAddSubject(values);
        subjectForm.reset();
        setOpenView(null);
    };

    const handleGradeSubmit = (values: z.infer<typeof addGradeSchema>) => {
        const { subjectId, ...gradeValues } = values;
        onAddGrade(subjectId, gradeValues);
        gradeForm.reset({ type: "mündliche Note", value: undefined, weight: 1, notes: "" });
        setOpenView(null);
    };

    const handleTriggerClick = (view: 'subject' | 'grade') => {
      setOpenView(current => current === view ? null : view);
    }

    return (
        <aside className="hidden lg:flex flex-col gap-6 w-80 bg-background border-r fixed top-0 left-0 h-screen p-6">
            <div className='px-2'>
              <h1 className="text-2xl font-bold text-foreground">Noten Meister</h1>
            </div>
            
            <div className="bg-card border rounded-lg shadow-sm p-4">
                <p className="text-sm font-medium text-muted-foreground">Gesamtschnitt</p>
                <p className="text-4xl font-bold text-primary">{overallAverage}</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <Collapsible open={openView === 'subject'} onOpenChange={(isOpen) => setOpenView(isOpen ? 'subject' : null)} className="border bg-card rounded-lg shadow-sm">
                  <CollapsibleTrigger onClick={() => handleTriggerClick('subject')} className="p-4 font-medium w-full flex items-center justify-between text-base hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180">
                      <div className="flex items-center gap-3">
                          <BookUp className="h-5 w-5 text-muted-foreground" /> 
                          <span>Neues Fach erstellen</span>
                      </div>
                      <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                      <Separator className="mb-4" />
                      <Form {...subjectForm}>
                          <form onSubmit={subjectForm.handleSubmit(handleSubjectSubmit)} className="space-y-4">
                              <FormField control={subjectForm.control} name="name" render={({ field }) => (
                                  <FormItem><FormLabel>Fachname</FormLabel><FormControl><Input placeholder="z.B. Mathematik" {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={subjectForm.control} name="category" render={({ field }) => (
                                  <FormItem><FormLabel>Kategorie</FormLabel><FormControl>
                                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Hauptfach" /></FormControl><FormLabel className="font-normal">Hauptfach</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Nebenfach" /></FormControl><FormLabel className="font-normal">Nebenfach</FormLabel></FormItem></RadioGroup>
                                  </FormControl><FormMessage /></FormItem>
                              )} />
                              <Button type="submit" className="w-full">Fach speichern</Button>
                          </form>
                      </Form>
                  </CollapsibleContent>
              </Collapsible>

              <Collapsible open={openView === 'grade'} onOpenChange={(isOpen) => setOpenView(isOpen ? 'grade' : null)} className="border bg-card rounded-lg shadow-sm">
                  <CollapsibleTrigger onClick={() => handleTriggerClick('grade')} className="p-4 font-medium w-full flex items-center justify-between text-base hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180">
                      <div className="flex items-center gap-3">
                          <ListPlus className="h-5 w-5 text-muted-foreground" />
                          <span>Neue Note hinzufügen</span>
                      </div>
                      <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                       <Separator className="mb-4" />
                       <Form {...gradeForm}>
                          <form onSubmit={gradeForm.handleSubmit(handleGradeSubmit)} className="space-y-4">
                              <FormField control={gradeForm.control} name="subjectId" render={({ field }) => (
                                  <FormItem><FormLabel>Fach</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Fach auswählen" /></SelectTrigger></FormControl><SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                              )} />
                              <FormField control={gradeForm.control} name="value" render={({ field }) => (
                                  <FormItem><FormLabel>Note (1-6)</FormLabel><FormControl><Input type="number" step="1" placeholder="z.B. 2" {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={gradeForm.control} name="weight" render={({ field }) => (
                                  <FormItem><FormLabel>Gewichtung</FormLabel><FormControl><Input type="number" step="0.5" placeholder="z.B. 1" {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={gradeForm.control} name="notes" render={({ field }) => (
                                  <FormItem><FormLabel>Notiz (optional)</FormLabel><FormControl><Textarea placeholder="Thema der Ex..." className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={gradeForm.control} name="type" render={({ field }) => (
                                  <FormItem><FormLabel>Notentyp</FormLabel><FormControl>
                                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Schulaufgabe" /></FormControl><FormLabel className="font-normal">Schulaufgabe</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="mündliche Note" /></FormControl><FormLabel className="font-normal">Mündliche Note</FormLabel></FormItem></RadioGroup>
                                  </FormControl><FormMessage /></FormItem>
                              )} />
                              <Button type="submit" className="w-full">Note speichern</Button>
                          </form>
                      </Form>
                  </CollapsibleContent>
              </Collapsible>
            </div>
        </aside>
    );
}
