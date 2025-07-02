"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc, query, where } from 'firebase/firestore';
import type { Profile, Post } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Trash2, Loader2, Users, MessageSquare } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const { toast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const profilesPromise = getDocs(collection(db, 'profiles'));
            const postsPromise = getDocs(collection(db, 'posts'));

            const [profilesSnapshot, postsSnapshot] = await Promise.all([profilesPromise, postsPromise]);
            
            setProfiles(profilesSnapshot.docs.map(d => ({ uid: d.id, ...d.data() } as Profile)));
            setPosts(postsSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Post)));

        } catch (error) {
            console.error("Error fetching admin data:", error);
            toast({ variant: 'destructive', title: 'Fehler', description: 'Admin-Daten konnten nicht geladen werden.' });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deleteUserAndData = async (userId: string) => {
        toast({ title: "Löschvorgang gestartet...", description: "Dies kann einen Moment dauern." });
        try {
            const batch = writeBatch(db);

            // Delete subcollections under /users/{userId}
            const collectionsToDelete = ['subjects', 'grades', 'studySets', 'files', 'settings'];
            for (const coll of collectionsToDelete) {
                if (coll === 'settings') {
                    const settingsDocRef = doc(db, 'users', userId, 'settings', 'main');
                    batch.delete(settingsDocRef);
                } else {
                    const snapshot = await getDocs(collection(db, 'users', userId, coll));
                    snapshot.forEach(doc => batch.delete(doc.ref));
                }
            }
            
            const postsQuery = query(collection(db, 'posts'), where('authorId', '==', userId));
            const postsSnap = await getDocs(postsQuery);
            for (const postDoc of postsSnap.docs) {
                const commentsSnap = await getDocs(collection(db, 'posts', postDoc.id, 'comments'));
                commentsSnap.forEach(commentDoc => batch.delete(commentDoc.ref));
                batch.delete(postDoc.ref);
            }

            batch.delete(doc(db, 'profiles', userId));
            
            await batch.commit();

            toast({ title: "Nutzer gelöscht", description: `Nutzer ${userId} und alle zugehörigen Daten wurden entfernt.` });
            fetchData();
        } catch (error) {
             console.error("Error deleting user:", error);
             toast({ variant: 'destructive', title: 'Fehler beim Löschen', description: `${error}` });
        }
    };

    const deletePostAndComments = async (postId: string) => {
        try {
            const batch = writeBatch(db);
            const commentsSnap = await getDocs(collection(db, 'posts', postId, 'comments'));
            commentsSnap.forEach(commentDoc => batch.delete(commentDoc.ref));
            
            batch.delete(doc(db, 'posts', postId));
            await batch.commit();
            toast({ title: "Beitrag gelöscht", description: `Der Beitrag wurde entfernt.` });
            fetchData();
        } catch (error) {
            console.error("Error deleting post:", error);
            toast({ variant: 'destructive', title: 'Fehler beim Löschen des Beitrags' });
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Verwaltung der Anwendungsdaten.</p>
            
            <Tabs defaultValue="users" className="mt-6">
                <TabsList>
                    <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Nutzer ({profiles.length})</TabsTrigger>
                    <TabsTrigger value="posts"><MessageSquare className="mr-2 h-4 w-4" />Beiträge ({posts.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nutzerverwaltung</CardTitle>
                            <CardDescription>Alle registrierten Nutzer der Anwendung.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[60vh]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>User ID</TableHead>
                                            <TableHead className="text-right">Aktion</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {profiles.map(p => (
                                            <TableRow key={p.uid}>
                                                <TableCell>{p.name}</TableCell>
                                                <TableCell>{p.email}</TableCell>
                                                <TableCell className="font-mono text-xs">{p.uid}</TableCell>
                                                <TableCell className="text-right">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Nutzer wirklich löschen?</AlertDialogTitle>
                                                                <AlertDialogDescription>Diese Aktion ist endgültig und löscht den Nutzer sowie ALLE seine Daten (Noten, Fächer, Beiträge, etc.).</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteUserAndData(p.uid)} className="bg-destructive hover:bg-destructive/90">Endgültig löschen</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="posts">
                     <Card>
                        <CardHeader>
                            <CardTitle>Beitragsverwaltung</CardTitle>
                            <CardDescription>Alle Beiträge aus dem Community-Feed.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ScrollArea className="h-[60vh]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Autor</TableHead>
                                            <TableHead>Inhalt</TableHead>
                                            <TableHead>Datum</TableHead>
                                            <TableHead className="text-right">Aktion</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {posts.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell>{p.authorName} ({p.authorId ? p.authorId.substring(0,5) : 'N/A'}...)</TableCell>
                                                <TableCell className="max-w-md truncate">{p.content}</TableCell>
                                                <TableCell>{p.createdAt?.toDate().toLocaleDateString('de-DE')}</TableCell>
                                                <TableCell className="text-right">
                                                   <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Beitrag wirklich löschen?</AlertDialogTitle>
                                                                <AlertDialogDescription>Diese Aktion ist endgültig und löscht den Beitrag sowie alle Kommentare dazu.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deletePostAndComments(p.id)} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
