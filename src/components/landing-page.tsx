"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BrainCircuit, NotebookText, Users } from 'lucide-react';
import { Logo } from './logo';

const features = [
  {
    icon: NotebookText,
    title: "Noten im Griff",
    description: "Erfasse mühelos alle Noten. Gradido berechnet deine Durchschnitte automatisch und zeigt dir, wo du stehst.",
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
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent animate-fade-in-down">
            Dein Weg zu besseren Noten.
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
            Gradido ist dein KI-Coach, deine Community und dein Motivator – alles in einer App. Organisiere dein Studium, erreiche deine Ziele.
          </p>
          <div className="flex justify-center items-center gap-4 animate-fade-in-down" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" asChild>
              <Link href="/login">
                Kostenlos loslegen <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Animated Feature Cards */}
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
        
        {/* Final CTA */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-down">Bereit, deine Noten zu transformieren?</h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8 animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
            Erstelle noch heute dein kostenloses Konto und entdecke eine neue Art zu lernen.
          </p>
          <Button size="lg" asChild className="animate-fade-in-down" style={{ animationDelay: '0.4s' }}>
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
