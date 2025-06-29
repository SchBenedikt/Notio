"use client";

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AddGradeData, AddSubjectData, Subject, Grade, Attachment } from '@/lib/types';
import { Textarea } from './ui/textarea';
import { BookUp, ListPlus, ChevronDown, Award, BookOpen, PenLine, MessageSquare, LayoutDashboard, MessageCircle, BookCopy, ClipboardList, Calendar as CalendarIcon, Calculator, UploadCloud, File as FileIcon, X, Database } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Logo } from './logo';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const addSubjectSchema = z.object({
  name: z.string().min(2, "Der Name muss mindestens 2 Zeichen lang sein.").max(50),
  category: z.enum(["Hauptfach", "Nebenfach"], {
    required_error: "Du musst eine Kategorie auswählen.",
  }),
  targetGrade: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.coerce.number({invalid_type_error: "Muss eine Zahl sein"}).min(1, "Note muss 1-6 sein").max(6, "Note muss 1-6 sein").optional()
  ),
});

const addGradeSchema = z.object({
  subjectId: z.string({ required_error: "Bitte wähle ein Fach aus." }),
  date: z.date({
    required_error: "Ein Datum ist erforderlich.",
  }),
  name: z.string().max(50, "Name darf nicht länger als 50 Zeichen sein.").optional(),
  type: z.enum(["Schulaufgabe", "mündliche Note"], {
    required_error: "Du musst einen Notentyp auswählen.",
  }),
  value: z.coerce.number().min(1, "Note muss 1-6 sein.").max(6, "Note muss 1-6 sein."),
  weight: z.coerce.number().min(0.1, "Gewichtung muss positiv sein.").default(1),
  notes: z.string().max(100, "Notiz darf nicht länger als 100 Zeichen sein.").optional(),
  attachments: z.array(z.object({
    name: z.string(),
    dataUrl: z.string(),
  })).optional(),
});

type SidebarContentProps = {
  subjects: Subject[];
  grades: Grade[];
  overallAverage: string;
  onAddSubject: (values: AddSubjectData) => void;
  onAddGrade: (subjectId: string, values: Omit<AddGradeData, 'subjectId'>) => void;
  mainSubjectsAverage: string;
  minorSubjectsAverage: string;
  writtenGradesCount: number;
  oralGradesCount: number;
  totalSubjectsCount: number;
  totalGradesCount: number;
  currentView: 'subjects' | 'tutor' | 'calculator' | 'data';
  onSetView: (view: 'subjects' | 'tutor' | 'calculator' | 'data') => void;
  onClose?: () => void;
};

export function SidebarContent({ 
  subjects, 
  grades,
  overallAverage, 
  onAddSubject, 
  onAddGrade, 
  mainSubjectsAverage,
  minorSubjectsAverage,
  writtenGradesCount,
  oralGradesCount,
  totalSubjectsCount,
  totalGradesCount,
  currentView,
  onSetView,
  onClose,
}: SidebarContentProps) {
    const [openView, setOpenView] = useState<'subject' | 'grade' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const subjectForm = useForm<z.infer<typeof addSubjectSchema>>({
        resolver: zodResolver(addSubjectSchema),
        defaultValues: { name: "", category: "Nebenfach", targetGrade: undefined },
    });

    const gradeForm = useForm<z.infer<typeof addGradeSchema>>({
        resolver: zodResolver(addGradeSchema),
        defaultValues: { date: new Date(), type: "mündliche Note", name: "", value: undefined, weight: 1, notes: "", attachments: [] },
    });
    
    const gradeAttachments = gradeForm.watch('attachments');


    const handleViewChange = (view: 'subjects' | 'tutor' | 'calculator' | 'data') => {
        onSetView(view);
        if (onClose) onClose();
    }

    const handleSubjectSubmit = (values: z.infer<typeof addSubjectSchema>) => {
        onAddSubject(values);
        subjectForm.reset();
        setOpenView(null);
        if (onClose) onClose();
    };

    const handleGradeSubmit = (values: z.infer<typeof addGradeSchema>) => {
        const { subjectId, ...gradeValues } = values;
        onAddGrade(subjectId, gradeValues);
        gradeForm.reset({ 
            subjectId: undefined,
            date: new Date(), 
            type: "mündliche Note", 
            name: "", 
            value: undefined, 
            weight: 1, 
            notes: "", 
            attachments: [] 
        });
        setOpenView(null);
        if (onClose) onClose();
    };

    const handleTriggerClick = (view: 'subject' | 'grade') => {
      setOpenView(current => current === view ? null : view);
    }
    
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
        const currentAttachments = gradeForm.getValues('attachments') || [];
        gradeForm.setValue('attachments', [...currentAttachments, ...results]);
        });

        if (fileInputRef.current) {
        fileInputRef.current.value = "";
        }
    };

    const removeAttachment = (indexToRemove: number) => {
        const currentAttachments = gradeForm.getValues('attachments') || [];
        gradeForm.setValue('attachments', currentAttachments.filter((_, index) => index !== indexToRemove));
    };


    return (
        <>
            <div className='px-2 flex items-center gap-3'>
              <Logo />
              <h1 className="text-2xl font-bold text-foreground">Noten Meister</h1>
            </div>

            <div className="flex flex-col gap-1 px-2">
                <Button 
                    variant={currentView === 'subjects' ? "secondary" : "ghost"} 
                    className="justify-start w-full"
                    onClick={() => handleViewChange('subjects')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Fächerübersicht
                </Button>
                <Button 
                    variant={currentView === 'calculator' ? "secondary" : "ghost"} 
                    className="justify-start w-full"
                    onClick={() => handleViewChange('calculator')}>
                    <Calculator className="mr-2 h-4 w-4" />
                    Notenrechner
                </Button>
                <Button 
                    variant={currentView === 'tutor' ? "secondary" : "ghost"} 
                    className="justify-start w-full"
                    onClick={() => handleViewChange('tutor')}>
                     <MessageCircle className="mr-2 h-4 w-4" />
                    KI-Tutor
                </Button>
                 <Button 
                    variant={currentView === 'data' ? "secondary" : "ghost"} 
                    className="justify-start w-full"
                    onClick={() => handleViewChange('data')}>
                     <Database className="mr-2 h-4 w-4" />
                    Datenverwaltung
                </Button>
            </div>

            <Separator />
            
            <div className="flex-1 overflow-y-auto space-y-6">
                <Collapsible className="border bg-card rounded-lg shadow-sm">
                    <CollapsibleTrigger className="p-4 w-full flex items-center justify-between hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180">
                        <div className="flex items-baseline gap-3">
                            <span className="text-sm font-medium text-muted-foreground">Gesamtschnitt</span>
                            <span className="text-4xl font-bold text-primary">{overallAverage}</span>
                        </div>
                        <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 pb-4">
                        <Separator className="mb-4" />
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-center">
                            <div>
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <Award className="h-4 w-4" />
                                    <span>Hauptfächer</span>
                                </div>
                                <p className="text-2xl font-bold">{mainSubjectsAverage}</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <BookOpen className="h-4 w-4" />
                                    <span>Nebenfächer</span>
                                </div>
                                <p className="text-2xl font-bold">{minorSubjectsAverage}</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <PenLine className="h-4 w-4" />
                                    <span>Schriftlich</span>
                                </div>
                                <p className="text-2xl font-bold">{writtenGradesCount}</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>Mündlich</span>
                                </div>
                                <p className="text-2xl font-bold">{oralGradesCount}</p>
                            </div>
                             <div>
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <BookCopy className="h-4 w-4" />
                                    <span>Fächer</span>
                                </div>
                                <p className="text-2xl font-bold">{totalSubjectsCount}</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <ClipboardList className="h-4 w-4" />
                                    <span>Noten gesamt</span>
                                </div>
                                <p className="text-2xl font-bold">{totalGradesCount}</p>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
                
                <div className="flex flex-col gap-4">
                <Collapsible open={openView === 'subject'} onOpenChange={(isOpen) => setOpenView(isOpen ? 'subject' : null)} className="border bg-card rounded-lg shadow-sm">
                    <CollapsibleTrigger onClick={() => handleTriggerClick('subject')} className="p-4 font-medium w-full flex items-center justify-between text-base hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180">
                        <div className="flex items-center gap-3">
                            <BookUp className="h-5 w-5 text-muted-foreground" /> 
                            <span>Neues Fach</span>
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
                                <FormField
                                  control={subjectForm.control}
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
                                <Button type="submit" className="w-full">Fach speichern</Button>
                            </form>
                        </Form>
                    </CollapsibleContent>
                </Collapsible>

                <Collapsible open={openView === 'grade'} onOpenChange={(isOpen) => setOpenView(isOpen ? 'grade' : null)} className="border bg-card rounded-lg shadow-sm">
                    <CollapsibleTrigger onClick={() => handleTriggerClick('grade')} className="p-4 font-medium w-full flex items-center justify-between text-base hover:no-underline [&[data-state=open]>svg:last-child]:rotate-180">
                        <div className="flex items-center gap-3">
                            <ListPlus className="h-5 w-5 text-muted-foreground" />
                            <span>Neue Note</span>
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
                                <FormField
                                  control={gradeForm.control}
                                  name="date"
                                  render={({ field }) => (
                                    <FormItem>
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
                                <FormField control={gradeForm.control} name="type" render={({ field }) => (
                                    <FormItem><FormLabel>Notentyp</FormLabel><FormControl>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex pt-2"><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="Schulaufgabe" /></FormControl><FormLabel className="font-normal">Schulaufgabe</FormLabel></FormItem><FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="mündliche Note" /></FormControl><FormLabel className="font-normal">Mündliche Note</FormLabel></FormItem></RadioGroup>
                                    </FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={gradeForm.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>Bezeichnung (optional)</FormLabel><FormControl><Input placeholder="z.B. Vokabeltest" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={gradeForm.control} name="value" render={({ field }) => (
                                    <FormItem><FormLabel>Note (1-6)</FormLabel><FormControl><Input type="number" step="1" placeholder="z.B. 2" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={gradeForm.control} name="weight" render={({ field }) => (
                                    <FormItem><FormLabel>Gewichtung</FormLabel><FormControl><Input type="number" step="0.5" placeholder="z.B. 1" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={gradeForm.control} name="notes" render={({ field }) => (
                                    <FormItem><FormLabel>Notiz (optional)</FormLabel><FormControl><Textarea placeholder="Thema der Ex..." className="resize-none" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                                )} />
                                
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
                                        {gradeAttachments?.map((attachment, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-md border p-2 bg-muted/50 text-xs">
                                            <div className="flex items-center gap-2 truncate">
                                            <FileIcon className="h-4 w-4 text-muted-foreground" />
                                            <span className="truncate">{attachment.name}</span>
                                            </div>
                                            <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5"
                                            onClick={() => removeAttachment(index)}
                                            >
                                            <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <Button type="submit" className="w-full">Note speichern</Button>
                            </form>
                        </Form>
                    </CollapsibleContent>
                </Collapsible>
                </div>
            </div>
        </>
    );
}
