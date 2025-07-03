
"use client";

import { useState, useMemo } from 'react';
import type { Lernzettel, StudySet } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, BrainCircuit, Loader2, Link as LinkIcon, Notebook, Sparkles, Trash2, Star } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { cn } from '@/lib/utils';

type LernzettelDetailPageProps = {
  lernzettel: Lernzettel;
  onBack: () => void;
  onEdit: (lernzettel: Lernzettel) => void;
  onDelete: (id: string) => Promise<void>;
  onNavigateToNote: (noteId: string) => void;
  allStudySets: StudySet[];
  onViewStudySet: (setId: string) => void;
  onCreateStudySetFromAI: (note: Lernzettel) => Promise<void>;
  onCreateSummary: (note: Lernzettel) => Promise<void>;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
};

const YouTubeEmbed = ({ href }: { href?: string }) => {
    if (!href) return null;
    const videoIdRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = href.match(videoIdRegex);
    const videoId = match ? match[1] : null;

    if (!videoId) return <a href={href} target="_blank" rel="noopener noreferrer">{href}</a>;

    return (
        <div className="my-4 aspect-video w-full overflow-hidden rounded-lg border">
            <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export function LernzettelDetailPage({ lernzettel, onBack, onEdit, onDelete, onNavigateToNote, allStudySets, onViewStudySet, onCreateStudySetFromAI, onCreateSummary, onToggleFavorite }: LernzettelDetailPageProps) {
  const [isGeneratingSet, setIsGeneratingSet] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string | undefined) => {
    if (href && href.startsWith('/lernzettel/')) {
        e.preventDefault();
        const noteId = href.split('/').pop();
        if (noteId) {
            onNavigateToNote(noteId);
        }
    }
  };

  const linkedStudySets = useMemo(() => {
    if (!lernzettel.studySetIds || lernzettel.studySetIds.length === 0) return [];
    return allStudySets.filter(set => lernzettel.studySetIds!.includes(set.id));
  }, [lernzettel.studySetIds, allStudySets]);

  const handleGenerateSet = async () => {
    setIsGeneratingSet(true);
    await onCreateStudySetFromAI(lernzettel);
    setIsGeneratingSet(false);
  }
  
  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    await onCreateSummary(lernzettel);
    setIsSummarizing(false);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zu allen Lernzetteln
          </Button>
          <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="icon" title="Favorisieren" onClick={() => onToggleFavorite(lernzettel.id, !!lernzettel.isFavorite)}>
                  <Star className={cn("h-4 w-4", lernzettel.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
              </Button>
              <Button variant="outline" onClick={() => onEdit(lernzettel)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Bearbeiten
              </Button>
              <Button onClick={handleGenerateSet} disabled={isGeneratingSet}>
                  {isGeneratingSet ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                  Lernset mit KI erstellen
              </Button>
               <Button onClick={handleGenerateSummary} disabled={isSummarizing || !!lernzettel.summary}>
                  {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {lernzettel.summary ? 'Zusammenfassung generiert' : 'KI-Zusammenfassung'}
              </Button>
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" title="Löschen">
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Lernzettel wirklich löschen?</AlertDialogTitle><AlertDialogDescription>Diese Aktion ist endgültig und kann nicht rückgängig gemacht werden.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(lernzettel.id)} className="bg-destructive hover:bg-destructive/90">Endgültig löschen</AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </div>
        </div>
        
         {linkedStudySets.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <LinkIcon className="h-4 w-4" />
                        Verknüpfte Lernsets
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {linkedStudySets.map(set => (
                        <Button key={set.id} variant="secondary" size="sm" onClick={() => onViewStudySet(set.id)}>
                            <BrainCircuit className="mr-2 h-4 w-4" />
                            {set.title}
                        </Button>
                    ))}
                </CardContent>
            </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <article className="prose prose-sm dark:prose-invert max-w-none">
              <h1>{lernzettel.title}</h1>
              
              {lernzettel.summary && (
                <div className="mb-8 p-4 rounded-lg border bg-muted/50 not-prose">
                   <h2 className="!mt-0 text-lg font-semibold flex items-center gap-2 prose dark:prose-invert">
                      <Sparkles className="h-5 w-5 text-primary" />
                      KI-Zusammenfassung
                  </h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {lernzettel.summary}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => {
                      const href = props.href;
                      if (href && (href.includes('youtube.com') || href.includes('youtu.be'))) {
                          return <YouTubeEmbed href={href} />;
                      }
                      if (href && href.startsWith('/lernzettel/')) {
                           return <button onClick={(e) => handleLinkClick(e as any, href)} className="text-primary hover:underline p-0 m-0 font-normal text-left bg-transparent">{props.children}</button>;
                      }
                      return <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />;
                  },
                }}
              >
                {lernzettel.content}
              </ReactMarkdown>
            </article>
          </CardContent>
        </Card>
      </div>
      <style jsx global>{`
        .prose h1 {
          font-size: 2.25rem;
          margin-bottom: 1rem;
        }
        .prose h2 {
          font-size: 1.875rem;
          margin-top: 2rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid hsl(var(--border));
          padding-bottom: 0.5rem;
        }
        .prose h3 {
            font-size: 1.5rem;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
        }
        .prose p, .prose ul, .prose ol {
          line-height: 1.7;
        }
        .prose a {
            color: hsl(var(--primary));
            text-decoration: none;
        }
        .prose a:hover {
            text-decoration: underline;
        }
        .prose blockquote {
            border-left-color: hsl(var(--primary));
            background-color: hsl(var(--muted));
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
        }
        .prose code {
            background-color: hsl(var(--muted));
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            font-size: 0.9em;
        }
        .prose pre {
            background-color: hsl(var(--muted));
            padding: 1rem;
            border-radius: 0.5rem;
        }
      `}</style>
    </>
  );
}
