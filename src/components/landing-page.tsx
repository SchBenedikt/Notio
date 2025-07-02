"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BrainCircuit, NotebookText, Users, Check, Quote, BarChart3 } from 'lucide-react';
import { Logo } from './logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const features = [
  {
    icon: NotebookText,
    title: "Noten im Griff",
    description: "Erfasse mühelos alle Noten. Notio berechnet deine Durchschnitte automatisch und zeigt dir, wo du stehst.",
  },
  {
    icon: BrainCircuit,
    title: "Dein KI-Lernpartner",
    description: "Stell unserem KI-Tutor Fragen oder erhalte personalisierte Lerntipps. Dein persönlicher Lehrer, rund um die Uhr.",
  },
  {
    icon: Users,
    title: "Gemeinsam stärker",
    description: "Tausche dich in der Community aus. Stelle Fragen, teile Erfolge und finde Lernpartner.",
  }
];

const howItWorksSteps = [
    {
        icon: Check,
        title: "1. Anmelden & Einrichten",
        description: "Erstelle in wenigen Sekunden dein Konto und gib deine Fächer und Klassenstufe an.",
    },
    {
        icon: NotebookText,
        title: "2. Noten erfassen",
        description: "Trage deine Noten ein. Notio berechnet sofort deine Durchschnitte und zeigt dir deinen Fortschritt.",
    },
    {
        icon: BarChart3,
        title: "3. Analysieren & Verbessern",
        description: "Nutze den KI-Coach und die Statistiken, um deine Lernstrategie zu optimieren und deine Ziele zu erreichen.",
    }
];

const testimonials = [
    {
        quote: "Notio hat meine Art zu lernen revolutioniert. Der KI-Coach gibt mir Tipps, die wirklich helfen, und ich habe meinen Notenschnitt um eine ganze Note verbessert!",
        name: "Anna S.",
        title: "11. Klasse, Gymnasium",
    },
    {
        quote: "Endlich eine App, die alles kann, was ich brauche. Notenverwaltung, Lernsets und eine Community. Ich bin begeistert!",
        name: "Max M.",
        title: "Student, Universität",
    },
    {
        quote: "Ich hatte immer Probleme, den Überblick über meine Noten zu behalten. Mit Notio ist das super einfach und motivierend.",
        name: "Laura K.",
        title: "9. Klasse, Realschule",
    }
];

const faqs = [
    {
        question: "Ist Notio kostenlos?",
        answer: "Ja, die grundlegenden Funktionen von Notio, einschließlich Notenverwaltung, Community-Zugang und KI-Lern-Coach, sind kostenlos. Wir planen, in Zukunft optionale Premium-Funktionen anzubieten."
    },
    {
        question: "Sind meine Daten sicher?",
        answer: "Absolut. Deine Daten werden sicher in der Firebase-Cloud gespeichert und wir geben sie niemals an Dritte weiter. Du hast die volle Kontrolle über deine Informationen."
    },
    {
        question: "Für welche Schulformen ist Notio geeignet?",
        answer: "Notio ist für alle Schüler und Studenten konzipiert, von der Mittelstufe über das Gymnasium bis hin zur Universität. Die Funktionen sind flexibel und passen sich deinen Bedürfnissen an."
    }
];


export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Logo />
            <h1 className="text-xl font-bold">Notio</h1>
          </Link>
          <nav>
            <Button asChild>
              <Link href="/login">Anmelden & Starten</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent animate-fade-in-down">
            Dein Weg zu besseren Noten.
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
            Notio ist dein KI-Coach, deine Community und dein Motivator – alles in einer App. Organisiere dein Studium, erreiche deine Ziele.
          </p>
          <div className="flex justify-center items-center gap-4 animate-fade-in-down" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" asChild>
              <Link href="/login">
                Kostenlos loslegen <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
        
        {/* Visual Showcase Section */}
        <section className="bg-muted/50 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative rounded-lg shadow-2xl overflow-hidden border">
                     <Image
                        src="https://placehold.co/1200x800.png"
                        alt="Notio Dashboard Ansicht"
                        width={1200}
                        height={800}
                        className="w-full h-auto"
                        data-ai-hint="dashboard analytics"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
           <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold animate-fade-in-down">Alles, was du für deinen Erfolg brauchst</h2>
            <p className="text-muted-foreground mt-4 text-lg animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
              Entdecke die intelligenten Werkzeuge, die dir helfen, besser zu lernen.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="flex flex-col text-center items-center p-8 animate-fade-in-down" 
                style={{ animationDelay: `${0.4 + index * 0.2}s` }}
              >
                <div className="p-4 bg-primary/10 text-primary rounded-full mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <CardTitle className="mb-2 text-xl">{feature.title}</CardTitle>
                <CardContent className="text-muted-foreground p-0">
                  <p>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it Works Section */}
        <section className="bg-muted/50 py-24 md:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold">In 3 Schritten zum Erfolg</h2>
                    <p className="text-muted-foreground mt-4 text-lg">
                        Der Einstieg in Notio ist kinderleicht und dauert nur wenige Minuten.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                   {howItWorksSteps.map((step, index) => (
                       <div key={index} className="flex flex-col items-center">
                           <div className="p-4 bg-primary/10 text-primary rounded-full mb-4 border-8 border-background">
                               <step.icon className="h-8 w-8" />
                           </div>
                           <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                           <p className="text-muted-foreground">{step.description}</p>
                       </div>
                   ))}
                </div>
            </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-24 md:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold">Was unsere Nutzer sagen</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index}>
                           <CardContent className="p-6">
                                <Quote className="h-6 w-6 text-muted-foreground mb-4"/>
                                <p className="text-muted-foreground mb-6">{testimonial.quote}</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold">{testimonial.name.charAt(0)}</div>
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                                    </div>
                                </div>
                           </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-muted/50 py-24 md:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">Häufig gestellte Fragen</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-lg">{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
        
        {/* Final CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-down">Bereit, deine Noten zu transformieren?</h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8 animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
            Erstelle noch heute dein kostenloses Konto und entdecke eine neue Art zu lernen.
          </p>
          <Button size="lg" asChild className="animate-fade-in-down" style={{ animationDelay: '0.4s' }}>
            <Link href="/login">
              Jetzt kostenlos bei Notio anmelden <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Notio. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
}
