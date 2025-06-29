"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Post, Profile } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Loader2, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

type CommunityPageProps = {
  posts: Post[];
  profiles: Profile[];
  onAddPost: (content: string) => Promise<void>;
  onLikePost: (postId: string) => Promise<void>;
};

export function CommunityPage({ posts, profiles, onAddPost, onLikePost }: CommunityPageProps) {
  const { user } = useAuth();
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostSubmit = async () => {
    if (!newPostContent.trim()) return;
    setIsSubmitting(true);
    await onAddPost(newPostContent);
    setNewPostContent('');
    setIsSubmitting(false);
  };

  const profilesMap = new Map(profiles.map(p => [p.uid, p]));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full border-8 border-primary/5">
                <Users className="h-8 w-8 text-primary" />
            </div>
        </div>
        <h1 className="text-3xl font-bold">Community-Feed</h1>
        <p className="text-muted-foreground mt-2">
          Tausche dich mit anderen aus, stelle Fragen und teile deine Erfolge.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Neuen Beitrag erstellen</h2>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-2">
            <Textarea 
              placeholder="Was möchtest du teilen?" 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              maxLength={1000}
              disabled={!user || isSubmitting}
            />
            <Button onClick={handlePostSubmit} disabled={isSubmitting || !newPostContent.trim() || !user}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Beitrag veröffentlichen
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {posts.map(post => {
          const author = profilesMap.get(post.authorId);
          const hasLiked = user ? post.likes.includes(user.uid) : false;

          return (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                     <AvatarFallback>{author?.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{post.authorName || 'Unbekannter Nutzer'}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: de }) : 'Gerade eben'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{post.content}</p>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <Button variant="ghost" size="sm" onClick={() => onLikePost(post.id)} disabled={!user}>
                    <Heart className={`mr-2 h-4 w-4 ${hasLiked ? 'text-red-500 fill-current' : ''}`} />
                    <span>{post.likes.length}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {posts.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            <p>Noch keine Beiträge vorhanden.</p>
            <p className="text-sm">Sei der Erste, der etwas postet!</p>
          </div>
        )}
      </div>
    </div>
  );
}
