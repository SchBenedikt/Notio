"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BrainCircuit, NotebookText, Users, Star } from 'lucide-react';
import Image from 'next/image';
import { Logo } from './logo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const testimonials = [
  {
    name: 'Lena M.',
    role: '11. Klasse',
    quote: 'Gradido hat meinen Schulstress halbiert. Ich weiß endlich genau, wo ich stehe und was ich tun muss, um meine Ziele zu erreichen. Der KI-Coach ist ein Game-Changer!',
    avatar: 'LM'
  },
  {
    name: 'Tom K.',
    role: 'Student',
    quote: 'Ich hätte nie gedacht, dass eine App so motivierend sein kann. Die Community-Funktion ist super, um sich mit anderen auszutauschen und gegenseitig zu helfen.',
    avatar: 'TK'
  },
  {
    name: 'Frau Schmidt',
    role: 'Lehrerin',
    quote: 'Als Lehrerin sehe ich, wie Schüler oft den Überblick verlieren. Gradido gibt ihnen die Werkzeuge an die Hand, um Verantwortung für ihr eigenes Lernen zu übernehmen. Sehr empfehlenswert.',
    avatar: 'FS'
  }
];

const faqs = [
  {
    question: "Was ist Gradido?",
    answer: "Gradido ist eine All-in-One-App für Schüler und Studenten. Sie kombiniert Notenverwaltung, einen KI-gestützten Lern-Coach und eine Community, um dir zu helfen, deine akademischen Ziele zu erreichen und den Lernprozess zu vereinfachen."
  },
  {
    question: "Ist Gradido kostenlos?",
    answer: "Ja, die Kernfunktionen von Gradido, einschließlich Notenverwaltung und Community-Zugang, sind kostenlos. Zukünftige Premium-Features könnten kostenpflichtig werden."
  },
  {
    question: "Für welche Klassenstufen ist Gradido geeignet?",
    answer: "Gradido ist für Schüler ab der 5. Klasse bis hin zu Studenten an Hochschulen und Universitäten konzipiert. Das flexible Notensystem passt sich an verschiedene Anforderungen an."
  },
  {
    question: "Wie sicher sind meine Daten?",
    answer: "Deine Daten sind uns heilig. Alle Daten werden sicher in der Firebase Cloud gespeichert und deine persönlichen Informationen werden niemals ohne deine Zustimmung geteilt. Die Community-Beiträge sind nur für andere angemeldete Nutzer sichtbar."
  }
]

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Logo />
            <h1 className="text-xl font-bold">Gradido</h1>
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
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            Dein Weg zu besseren Noten beginnt hier.
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
            Gradido ist mehr als nur ein Noten-Tracker. Es ist dein persönlicher KI-Coach, deine Lerngemeinschaft und dein Motivator – alles in einer App.
          </p>
          <div className="flex justify-center items-center gap-4">
            <Button size="lg" asChild>
              <Link href="/login">
                Kostenlos loslegen <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
             <Button size="lg" variant="outline" asChild>
              <Link href="#features">
                Mehr erfahren
              </Link>
            </Button>
          </div>
        </section>

        {/* Feature Image */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-24 md:mb-32">
          <div className="relative aspect-video max-w-5xl mx-auto overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10">
            <Image
              src="https://placehold.co/1200x675.png"
              alt="Gradido App-Vorschau"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority
              data-ai-hint="dashboard app screenshot"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
          </div>
        </section>

        {/* Detailed Features Section */}
        <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 bg-muted/50 rounded-2xl">
           <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Alles, was du für deinen Erfolg brauchst</h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Entdecke die intelligenten Werkzeuge, die dir helfen, organisiert zu bleiben und besser zu lernen.
            </p>
          </div>
          <div className="space-y-24">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                  <NotebookText className="h-5 w-5" />
                  <span className="font-semibold">Noten im Griff</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Mühelose Organisation, maximale Übersicht</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  Erfasse alle deine Noten, von der Klausur bis zur mündlichen Beteiligung. Gradido berechnet automatisch deine Durchschnitte und zeigt dir auf einen Blick, wo du stehst. Vergiss unübersichtliche Zettelwirtschaft – habe alles digital und griffbereit.
                </p>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-center gap-3"><Star className="h-5 w-5 text-yellow-500" /><span>Automatische Schnittberechnung</span></li>
                  <li className="flex items-center gap-3"><Star className="h-5 w-5 text-yellow-500" /><span>Visuelle Notenverteilung & Trends</span></li>
                  <li className="flex items-center gap-3"><Star className="h-5 w-5 text-yellow-500" /><span>Anhänge für jede Note</span></li>
                </ul>
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl border bg-card shadow-lg">
                 <Image src="https://placehold.co/600x600.png" alt="Notenübersicht in Gradido" fill className="object-cover" data-ai-hint="app grades list" />
              </div>
            </div>
            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
               <div className="relative aspect-square overflow-hidden rounded-2xl border bg-card shadow-lg md:order-last">
                 <Image src="https://placehold.co/600x600.png" alt="KI-Coach in Gradido" fill className="object-cover" data-ai-hint="ai chat tutor" />
              </div>
              <div>
                <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                  <BrainCircuit className="h-5 w-5" />
                  <span className="font-semibold">Dein KI-Lernpartner</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Intelligente Unterstützung, wann immer du sie brauchst</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  Stell unserem KI-Tutor Fragen zu deinen Hausaufgaben, lass dir komplexe Themen erklären oder erhalte personalisierte Lerntipps basierend auf deinen Noten. Dein persönlicher Lehrer, der rund um die Uhr verfügbar ist.
                </p>
                 <ul className="space-y-3 text-lg">
                  <li className="flex items-center gap-3"><Star className="h-5 w-5 text-yellow-500" /><span>Personalisierte Lerntipps</span></li>
                  <li className="flex items-center gap-3"><Star className="h-5 w-5 text-yellow-500" /><span>Hausaufgabenhilfe per Chat</span></li>
                  <li className="flex items-center gap-3"><Star className="h-5 w-5 text-yellow-500" /><span>Analyse von Dokumenten & Bildern</span></li>
                </ul>
              </div>
            </div>
            {/* Feature 3 */}
             <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">Gemeinsam stärker</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Vernetze dich und lerne von anderen</h3>
                <p className="text-muted-foreground text-lg mb-6">
                  Du bist nicht allein! Tausche dich in der Community mit anderen Schülern und Studenten aus. Stelle Fragen, teile deine Erfolge und finde Lernpartner. Gemeinsam macht das Lernen mehr Spaß und ist effektiver.
                </p>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-center gap-3"><Star className="h-5 w-5 text-yellow-500" /><span>Öffentlicher Feed für Austausch</span></li>
                  <li className="flex items-center gap-3"><Star className="h-5 w-5 text-yellow-500" /><span>Folge interessanten Nutzern</span></li>
                  <li className="flex items-center gap-3"><Star className="h-5 w-5 text-yellow-500" /><span>Teile Erfolge und Auszeichnungen</span></li>
                </ul>
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl border bg-card shadow-lg">
                 <Image src="https://placehold.co/600x600.png" alt="Community-Feed in Gradido" fill className="object-cover" data-ai-hint="community forum" />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Das sagen unsere Nutzer</h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Tausende von Schülern und Studenten verbessern bereits ihre Noten mit Gradido.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="flex flex-col">
                <CardContent className="pt-6 flex-1">
                  <p className="text-muted-foreground">"{testimonial.quote}"</p>
                </CardContent>
                <CardHeader className="flex-row items-center gap-4 pt-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold">{testimonial.avatar}</div>
                  <div>
                    <CardTitle>{testimonial.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
         <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 bg-muted/50 rounded-2xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">Häufig gestellte Fragen</h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Noch Fragen? Hier findest du die Antworten.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Bereit, deine Noten zu transformieren?</h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
            Erstelle noch heute dein kostenloses Konto und entdecke eine neue Art zu lernen.
          </p>
          <Button size="lg" asChild>
            <Link href="/login">
              Jetzt kostenlos bei Gradido anmelden <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Gradido. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
}
