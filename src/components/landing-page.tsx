"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCheck, BrainCircuit, Users, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Logo } from './logo';
import { Badge } from '@/components/ui/badge';

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <h1 className="text-xl font-bold">Noten Meister</h1>
        </div>
        <nav>
          <Button asChild>
            <Link href="/login">Anmelden & Registrieren</Link>
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
          <Badge variant="outline" className="mb-4">Die All-in-One-Lösung für deinen Schulerfolg</Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
            Organisiere. Lerne. Erobere.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
            Verwalte deine Noten, erhalte KI-gestützte Lerntipps und vernetze dich mit anderen Schülern. Noten Meister ist dein persönlicher Begleiter für bessere Noten und weniger Stress.
          </p>
          <Button size="lg" asChild>
            <Link href="/login">
              Jetzt kostenlos starten <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>

        {/* Feature Image */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative aspect-video overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10">
                 <Image
                    src="https://placehold.co/1200x675.png"
                    alt="App-Vorschau"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover opacity-75"
                    data-ai-hint="dashboard screenshot"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
            </div>
        </section>


        {/* Features Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Alles, was du für die Schule brauchst</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              Von der einfachen Notenverwaltung bis hin zum intelligenten Lern-Coach.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <BookCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4">Notenverwaltung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Erfasse alle deine Noten, berechne deinen Schnitt und behalte den Überblick über deine Leistungen in jedem Fach.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                 <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <BrainCircuit className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4">KI-Coach & Tutor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                    Erhalte personalisierte Tipps, stelle Fragen zu deinen Hausaufgaben oder lass dir komplexe Themen von deinem KI-Tutor erklären.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                 <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="mt-4">Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tausche dich mit anderen Schülern aus, stelle Fragen und teile deine Erfolge in unserem Community-Feed.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t">
        <div className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Noten Meister. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
}
