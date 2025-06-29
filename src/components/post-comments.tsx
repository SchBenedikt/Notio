"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, runTransaction, updateDoc } from 'firebase/firestore';
import type { Comment, Profile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { EditCommentDialog } from './edit-comment-dialog';

type PostCommentsProps = {
    postId: string;
    profilesMap: Map<string, Profile>;
};

const CommentSkeleton = () => (
    <div className="flex items-start gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    </div>
);

export function PostComments({ postId, profilesMap }: PostCommentsProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingComment, setEditingComment] = useState<Comment | null>(null);

    useEffect(() => {
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
            setComments(commentsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching comments: ", error);
            toast({ variant: 'destructive', title: 'Fehler', description: 'Kommentare konnten nicht geladen werden.' });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [postId, toast]);

    const handleCommentSubmit = async () => {
        if (!newComment.trim() || !user || !user.displayName) return;
        setIsSubmitting(true);
        
        try {
            await runTransaction(db, async (transaction) => {
                const postRef = doc(db, 'posts', postId);
                const postDoc = await transaction.get(postRef);
                if (!postDoc.exists()) throw "Beitrag nicht gefunden!";
                
                const newCommentCount = (postDoc.data().commentCount || 0) + 1;
                transaction.update(postRef, { commentCount: newCommentCount });
                
                const newCommentRef = doc(collection(db, 'posts', postId, 'comments'));
                transaction.set(newCommentRef, {
                    authorId: user.uid,
                    authorName: user.displayName,
                    content: newComment,
                    createdAt: serverTimestamp(),
                });
            });
            setNewComment('');
        } catch (error: any) {
            console.error("Error submitting comment:", error);
            toast({ variant: 'destructive', title: 'Fehler', description: `Dein Kommentar konnte nicht gesendet werden.` });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleUpdateComment = async (commentId: string, newContent: string) => {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      try {
        await updateDoc(commentRef, { content: newContent });
        toast({ title: 'Kommentar aktualisiert' });
        setEditingComment(null);
      } catch (error) {
        toast({ variant: 'destructive', title: 'Fehler', description: 'Kommentar konnte nicht aktualisiert werden.' });
      }
    };
    
    const handleDeleteComment = async (commentId: string) => {
        try {
             await runTransaction(db, async (transaction) => {
                const postRef = doc(db, 'posts', postId);
                const commentRef = doc(db, 'posts', postId, 'comments', commentId);

                const postDoc = await transaction.get(postRef);
                if (!postDoc.exists()) throw "Beitrag nicht gefunden!";
                
                const newCommentCount = (postDoc.data().commentCount || 1) - 1;
                transaction.update(postRef, { commentCount: Math.max(0, newCommentCount) });

                transaction.delete(commentRef);
            });
            toast({ title: 'Kommentar gelöscht', variant: 'destructive' });
        } catch (error) {
             toast({ variant: 'destructive', title: 'Fehler', description: 'Kommentar konnte nicht gelöscht werden.' });
        }
    };


    return (
        <>
        <div className="space-y-4 pt-4 border-t mt-4">
            <h4 className="font-semibold text-sm">Kommentare ({comments.length})</h4>
            <div className="space-y-4">
                {loading ? (
                    <>
                        <CommentSkeleton />
                        <CommentSkeleton />
                    </>
                ) : comments.length > 0 ? (
                    comments.map(comment => {
                        const commenterProfile = profilesMap.get(comment.authorId);
                        const isOwnComment = user?.uid === comment.authorId;
                        return (
                            <div key={comment.id} className="flex items-start gap-3 group">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{commenterProfile?.name?.charAt(0) || '?'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-muted p-3 rounded-lg">
                                    <div className="flex items-baseline justify-between">
                                        <div className="flex items-baseline gap-2">
                                            <p className="font-semibold text-sm">{comment.authorName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true, locale: de }) : 'Gerade eben'}
                                            </p>
                                        </div>
                                         {isOwnComment && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditingComment(comment)}>
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
                                                            <AlertDialogHeader><AlertDialogTitle>Kommentar löschen?</AlertDialogTitle><AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteComment(comment.id)} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Noch keine Kommentare.</p>
                )}
            </div>
            
            <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback>{user?.displayName?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <Textarea 
                        placeholder="Schreibe einen Kommentar..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={!user || isSubmitting}
                        rows={2}
                    />
                    <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={handleCommentSubmit}
                        disabled={!user || isSubmitting || !newComment.trim()}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Senden
                    </Button>
                </div>
            </div>
        </div>
        {editingComment && (
            <EditCommentDialog
                comment={editingComment}
                isOpen={!!editingComment}
                onOpenChange={(isOpen) => !isOpen && setEditingComment(null)}
                onUpdate={handleUpdateComment}
            />
        )}
        </>
    )
}
