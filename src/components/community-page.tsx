"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import type { Post, Profile, Subject, Grade, Attachment, FileSystemItem } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Loader2, Users, MessageSquare, Repeat, Flag, MoreHorizontal, Pencil, Trash2, Paperclip, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { EditPostDialog } from './edit-post-dialog';
import { PostComments } from './post-comments';
import { PostFileSelectionDialog } from './post-file-selection-dialog';

const PostSkeleton = () => (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                <Skeleton className="h-8 w-16" />
            </div>
        </CardContent>
    </Card>
);

type CommunityPageProps = {
  currentUserProfile: Profile | null;
  onViewProfile: (userId: string) => void;
  onToggleFollow: (targetUserId: string) => void;
  subjects: Subject[];
  grades: Grade[];
  userFiles: FileSystemItem[];
}

export function CommunityPage({ currentUserProfile, onViewProfile, onToggleFollow, subjects, grades, userFiles }: CommunityPageProps) {
  const { user, isFirebaseEnabled } = useAuth();
  const { toast } = useToast();
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostAttachments, setNewPostAttachments] = useState<Attachment[]>([]);
  const [isFileSelectorOpen, setFileSelectorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [visibleComments, setVisibleComments] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseEnabled) {
      setLoading(false);
      return;
    }

    const profilesUnsubscribe = onSnapshot(collection(db, "profiles"),
      (snapshot) => {
        const profilesData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as Profile[];
        setProfiles(profilesData);
      },
      (error) => {
        console.error("Error fetching profiles:", error);
      }
    );

    const postsUnsubscribe = onSnapshot(query(collection(db, 'posts'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
        setPosts(postsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching posts:", error);
        toast({
          variant: "destructive",
          title: "Fehler beim Laden der Beiträge",
          description: `Die Community-Beiträge konnten nicht geladen werden. (${error.code})`,
        });
        setLoading(false);
      }
    );

    return () => {
      profilesUnsubscribe();
      postsUnsubscribe();
    };
  }, [isFirebaseEnabled, toast]);

  const handlePostSubmit = async () => {
    if ((!newPostContent.trim() && newPostAttachments.length === 0) || !user || !user.displayName) {
        toast({ title: "Fehler", description: "Der Beitrag muss Inhalt oder einen Anhang haben.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        authorId: user.uid,
        authorName: user.displayName,
        content: newPostContent,
        attachments: newPostAttachments,
        likes: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
      });
      setNewPostContent('');
      setNewPostAttachments([]);
      toast({ title: "Beitrag veröffentlicht!" });
    } catch (error: any) {
      console.error("Error adding post: ", error);
      toast({ title: "Fehler beim Erstellen des Beitrags", description: `Stelle sicher, dass deine Datenbank-Regeln korrekt sind. (${error.code})`, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    const postRef = doc(db, 'posts', postId);
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      const hasLiked = post.likes.includes(user.uid);
      await updateDoc(postRef, {
        likes: hasLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      console.error("Error liking post: ", error);
      toast({ title: "Fehler beim Liken des Beitrags", variant: "destructive" });
    }
  };
  
  const handleUpdatePost = async (postId: string, newContent: string) => {
      const postRef = doc(db, 'posts', postId);
      try {
        await updateDoc(postRef, { content: newContent });
        toast({ title: 'Beitrag aktualisiert' });
        setEditingPost(null);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Fehler', description: 'Beitrag konnte nicht aktualisiert werden.' });
      }
  };

  const handleDeletePost = async (postId: string) => {
      const postRef = doc(db, 'posts', postId);
      try {
        await deleteDoc(postRef);
        toast({ title: 'Beitrag gelöscht', variant: 'destructive' });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Fehler', description: 'Beitrag konnte nicht gelöscht werden.' });
      }
  };

  const handleReportPost = (postId: string) => {
    console.log(`Reporting post ${postId}`);
    toast({
        title: "Beitrag gemeldet",
        description: "Danke für dein Feedback. Wir werden den Beitrag überprüfen.",
    });
  };

  const toggleComments = (postId: string) => {
    setVisibleComments(prev => prev === postId ? null : prev);
  };

  const removeSelectedAttachment = (indexToRemove: number) => {
    setNewPostAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const hasAnyAttachmentsInApp = useMemo(() => {
    return userFiles.some(f => f.type === 'file');
  }, [userFiles]);

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
            {newPostAttachments.length > 0 && (
                <div className="p-2 border rounded-lg space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Anhänge:</p>
                    {newPostAttachments.map((att, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded-md">
                             <div className="flex items-center gap-2 truncate">
                                <Paperclip className="h-4 w-4" />
                                <span className="truncate">{att.name}</span>
                             </div>
                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeSelectedAttachment(index)}>
                                <X className="h-4 w-4" />
                             </Button>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex justify-between items-center">
                <Button variant="outline" size="icon" onClick={() => setFileSelectorOpen(true)} disabled={!hasAnyAttachmentsInApp || isSubmitting} title="Datei anhängen">
                    <Paperclip className="h-4 w-4" />
                </Button>
                <Button onClick={handlePostSubmit} disabled={isSubmitting || (!newPostContent.trim() && newPostAttachments.length === 0) || !user}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Beitrag veröffentlichen
                </Button>
            </div>
          </div>
           {!user && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
                Du musst angemeldet sein, um Beiträge zu erstellen.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
            <>
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
            </>
        ) : posts.length > 0 ? (
            posts.map(post => {
              const author = profilesMap.get(post.authorId);
              const hasLiked = user ? post.likes.includes(user.uid) : false;
              const isOwnPost = user?.uid === post.authorId;
              const isFollowing = currentUserProfile?.following?.includes(post.authorId) || false;

              return (
                  <Card key={post.id}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>{author?.name?.charAt(0) || '?'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <button onClick={() => onViewProfile(post.authorId)} className="font-semibold hover:underline text-left">
                                      {post.authorName || 'Unbekannter Nutzer'}
                                  </button>
                                  <p className="text-xs text-muted-foreground">
                                  {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: de }) : 'Gerade eben'}
                                  </p>
                                </div>
                            </div>
                            {isOwnPost ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setEditingPost(post)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Bearbeiten
                                        </DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                  <Trash2 className="mr-2 h-4 w-4" />
                                                  Löschen
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Beitrag löschen?</AlertDialogTitle><AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeletePost(post.id)} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button size="sm" variant={isFollowing ? 'outline' : 'default'} onClick={() => onToggleFollow(post.authorId)}>
                                    {isFollowing ? 'Gefolgt' : 'Folgen'}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap text-sm">{post.content}</p>
                        {post.attachments && post.attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {post.attachments.map((att, index) => (
                                    <a
                                        key={index}
                                        href={att.dataUrl}
                                        download={att.name}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 rounded-md bg-muted hover:bg-muted/80 transition-colors text-sm font-medium text-primary"
                                    >
                                        <Paperclip className="h-4 w-4" />
                                        <span>{att.name}</span>
                                    </a>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                            <Button variant="ghost" size="sm" onClick={() => handleLikePost(post.id)} disabled={!user}>
                                <Heart className={`mr-2 h-4 w-4 ${hasLiked ? 'text-red-500 fill-current' : ''}`} />
                                <span>{post.likes.length}</span>
                            </Button>
                             <Button variant="ghost" size="sm" onClick={() => toggleComments(post.id)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span>{post.commentCount || 0}</span>
                            </Button>
                             <Button variant="ghost" size="sm" disabled>
                                <Repeat className="mr-2 h-4 w-4" />
                                <span>0</span>
                            </Button>
                             <Button variant="ghost" size="icon" className="ml-auto" onClick={() => handleReportPost(post.id)}>
                                <Flag className="h-4 w-4" />
                            </Button>
                        </div>
                        {visibleComments === post.id && (
                           <PostComments postId={post.id} profilesMap={profilesMap} />
                        )}
                    </CardContent>
                  </Card>
              )
            })
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <p>Noch keine Beiträge vorhanden.</p>
            <p className="text-sm">Sei der Erste, der etwas postet!</p>
          </div>
        )}
      </div>

      {editingPost && (
        <EditPostDialog
            post={editingPost}
            isOpen={!!editingPost}
            onOpenChange={(isOpen) => !isOpen && setEditingPost(null)}
            onUpdate={handleUpdatePost}
        />
      )}
      <PostFileSelectionDialog
        isOpen={isFileSelectorOpen}
        onOpenChange={setFileSelectorOpen}
        onFilesSelected={(files) => setNewPostAttachments(prev => [...prev, ...files])}
        userFiles={userFiles}
      />
    </div>
  );
}
