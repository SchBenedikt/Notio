"use client";

import type { Lernzettel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Pencil } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type LernzettelDetailPageProps = {
  lernzettel: Lernzettel;
  onBack: () => void;
  onEdit: (lernzettel: Lernzettel) => void;
  onNavigateToNote: (noteId: string) => void;
};

export function LernzettelDetailPage({ lernzettel, onBack, onEdit, onNavigateToNote }: LernzettelDetailPageProps) {
  
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string | undefined) => {
    if (href && href.startsWith('/lernzettel/')) {
        e.preventDefault();
        const noteId = href.split('/').pop();
        if (noteId) {
            onNavigateToNote(noteId);
        }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zu allen Lernzetteln
        </Button>
        <Button variant="outline" onClick={() => onEdit(lernzettel)}>
          <Pencil className="mr-2 h-4 w-4" />
          Bearbeiten
        </Button>
      </div>

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
