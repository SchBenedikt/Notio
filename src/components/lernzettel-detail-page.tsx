"use client";

import { useState, useMemo } from 'react';
import type { Lernzettel, StudySet } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, BrainCircuit, Loader2, Link as LinkIcon, Notebook } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type LernzettelDetailPageProps = {
  lernzettel: Lernzettel;
  onBack: () => void;
  onEdit: (lernzettel: Lernzettel) => void;
  onNavigateToNote: (noteId: string) => void;
  allStudySets: StudySet[];
  onViewStudySet: (setId: string) => void;
  onCreateStudySetFromAI: (note: Lernzettel) => Promise<void>;
};

export function LernzettelDetailPage({ lernzettel, onBack, onEdit, onNavigateToNote, allStudySets, onViewStudySet, onCreateStudySetFromAI }: LernzettelDetailPageProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
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
    setIsGenerating(true);
    await onCreateStudySetFromAI(lernzettel);
    setIsGenerating(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zu allen Lernzetteln
        </Button>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => onEdit(lernzettel)}>
                <Pencil className="mr-2 h-4 w-4" />
                Bearbeiten
            </Button>
            <Button onClick={handleGenerateSet} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                Lernset mit KI erstellen
            </Button>
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a 
                    {...props} 
                    onClick={(e) => handleLinkClick(e, props.href)}
                    className="text-primary hover:underline"
                    target={props.href && props.href.startsWith('/lernzettel/') ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                  />
                ),
              }}
            >
              {lernzettel.content}
            </ReactMarkdown>
          </article>
        </CardContent>
      </Card>

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
    </div>
  );
}
