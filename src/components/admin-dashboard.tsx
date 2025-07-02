"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc, query, where, deleteDoc } from 'firebase/firestore';
import type { Profile, Post, Grade, FileSystemItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Trash2, Loader2, Users, MessageSquare, ArrowLeft, File as FileIcon, GraduationCap } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const { toast } = useToast();
    
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [userGrades, setUserGrades] = useState<Grade[]>([]);
    const [userFiles, setUserFiles] = useState<FileSystemItem[]>([]);
    const [userPosts, setUserPosts] = useState<Post[]>([]);
    const [isDetailLoading, setDetailLoading] = useState(false);

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

    const handleSelectUser = async (profile: Profile) => {
        setSelectedProfile(profile);
        setDetailLoading(true);
        try {
            const gradesPromise = getDocs(collection(db, 'users', profile.uid, 'grades'));
            const filesPromise = getDocs(collection(db, 'users', profile.uid, 'files'));
            const postsPromise = getDocs(query(collection(db, 'posts'), where('authorId', '==', profile.uid)));

            const [gradesSnap, filesSnap, postsSnap] = await Promise.all([gradesPromise, filesPromise, postsPromise]);

            setUserGrades(gradesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Grade)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setUserFiles(filesSnap.docs.map(d => ({ id: d.id, ...d.data() } as FileSystemItem)));
            setUserPosts(postsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
        } catch (error) {
            console.error("Error fetching user details:", error);
            toast({ variant: 'destructive', title: 'Fehler', description: 'Benutzerdetails konnten nicht geladen werden.' });
        }
        setDetailLoading(false);
    };

    const handleBackToUsers = () => {
        setSelectedProfile(null);
        setUserGrades([]);
        setUserFiles([]);
        setUserPosts([]);
    };

    const deleteUserAndData = async (userId: string) => {
        toast({ title: "Löschvorgang gestartet...", description: "Dies kann einen Moment dauern." });
        try {
            const batch = writeBatch(db);

            // Delete subcollections under /users/{userId}
            const collectionsToDelete = ['subjects', 'grades', 'studySets', 'files', 'settings'];
            for (const coll of collectionsToDelete) {
                const subcollectionRef = collection(db, 'users', userId, coll);
                const snapshot = await getDocs(subcollectionRef);
                snapshot.forEach(doc => batch.delete(doc.ref));
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
            handleBackToUsers();
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
            fetchData(); // Refresh all posts list
            if (selectedProfile) {
                setUserPosts(prev => prev.filter(p => p.id !== postId));
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            toast({ variant: 'destructive', title: 'Fehler beim Löschen des Beitrags' });
        }
    };
    
    const deleteGrade = async (userId: string, gradeId: string) => {
        try {
            await deleteDoc(doc(db, 'users', userId, 'grades', gradeId));
            toast({ title: 'Note gelöscht' });
            setUserGrades(prev => prev.filter(g => g.id !== gradeId));
        } catch (error) {
            console.error("Error deleting grade:", error);
            toast({ variant: 'destructive', title: 'Fehler beim Löschen der Note' });
        }
    }

    const deleteFile = async (userId: string, fileId: string) => {
        try {
            await deleteDoc(doc(db, 'users', userId, 'files', fileId));
            toast({ title: 'Datei gelöscht' });
            setUserFiles(prev => prev.filter(f => f.id !== fileId));
        } catch (error) {
            console.error("Error deleting file:", error);
            toast({ variant: 'destructive', title: 'Fehler beim Löschen der Datei' });
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    const renderDeleteButton = (onDelete: () => void, title: string, description: string) => (
         <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">Löschen</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Verwaltung der Anwendungsdaten.</p>
            
            <Tabs defaultValue="users" className="mt-6">
                <TabsList>
                    <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Nutzer ({profiles.length})</TabsTrigger>
                    <TabsTrigger value="posts"><MessageSquare className="mr-2 h-4 w-4" />Alle Beiträge ({posts.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="users">
                    {selectedProfile ? (
                        <Card>
                            <CardHeader>
                                <Button variant="ghost" onClick={handleBackToUsers} className="mb-4 self-start pl-0"><ArrowLeft className="mr-2 h-4 w-4" />Zurück zur Nutzerübersicht</Button>
                                <CardTitle>Details für: {selectedProfile.name}</CardTitle>
                                <CardDescription>{selectedProfile.email} ({selectedProfile.uid})</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isDetailLoading ? (
                                    <div className="flex items-center justify-center p-10">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <Tabs defaultValue="grades" className="mt-4">
                                        <TabsList>
                                            <TabsTrigger value="grades"><GraduationCap className="mr-2 h-4 w-4" />Noten ({userGrades.length})</TabsTrigger>
                                            <TabsTrigger value="files"><FileIcon className="mr-2 h-4 w-4" />Dateien ({userFiles.length})</TabsTrigger>
                                            <TabsTrigger value="posts"><MessageSquare className="mr-2 h-4 w-4" />Beiträge ({userPosts.length})</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="grades" className="mt-4">
                                            <ScrollArea className="h-[40vh] border rounded-md">
                                                <Table>
                                                    <TableHeader><TableRow><TableHead>Note</TableHead><TableHead>Bezeichnung</TableHead><TableHead>Datum</TableHead><TableHead className="text-right">Aktion</TableHead></TableRow></TableHeader>
                                                    <TableBody>
                                                        {userGrades.map(g => <TableRow key={g.id}><TableCell>{g.value || 'geplant'}</TableCell><TableCell>{g.name || g.type}</TableCell><TableCell>{new Date(g.date).toLocaleDateString('de-DE')}</TableCell><TableCell className="text-right">{renderDeleteButton(() => deleteGrade(selectedProfile.uid, g.id), "Note löschen?", "Diese Aktion kann nicht rückgängig gemacht werden.")}</TableCell></TableRow>)}
                                                    </TableBody>
                                                </Table>
                                            </ScrollArea>
                                        </TabsContent>
                                        <TabsContent value="files" className="mt-4">
                                             <ScrollArea className="h-[40vh] border rounded-md">
                                                <Table>
                                                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Typ</TableHead><TableHead>Größe</TableHead><TableHead className="text-right">Aktion</TableHead></TableRow></TableHeader>
                                                    <TableBody>
                                                        {userFiles.map(f => <TableRow key={f.id}><TableCell>{f.name}</TableCell><TableCell>{f.type}</TableCell><TableCell>{formatBytes(f.size ?? 0)}</TableCell><TableCell className="text-right">{renderDeleteButton(() => deleteFile(selectedProfile.uid, f.id), "Datei löschen?", "Diese Aktion kann nicht rückgängig gemacht werden.")}</TableCell></TableRow>)}
                                                    </TableBody>
                                                </Table>
                                            </ScrollArea>
                                        </TabsContent>
                                        <TabsContent value="posts" className="mt-4">
                                             <ScrollArea className="h-[40vh] border rounded-md">
                                                <Table>
                                                    <TableHeader><TableRow><TableHead>Inhalt</TableHead><TableHead>Datum</TableHead><TableHead className="text-right">Aktion</TableHead></TableRow></TableHeader>
                                                    <TableBody>
                                                        {userPosts.map(p => <TableRow key={p.id}><TableCell className="max-w-md truncate">{p.content}</TableCell><TableCell>{p.createdAt?.toDate().toLocaleDateString('de-DE')}</TableCell><TableCell className="text-right">{renderDeleteButton(() => deletePostAndComments(p.id), "Beitrag löschen?", "Löscht den Beitrag und alle Kommentare.")}</TableCell></TableRow>)}
                                                    </TableBody>
                                                </Table>
                                            </ScrollArea>
                                        </TabsContent>
                                    </Tabs>
                                )}
                            </CardContent>
                            <CardFooter>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="h-4 w-4 mr-2" /> Gesamten Nutzer löschen</Button></AlertDialogTrigger>
                                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Nutzer wirklich löschen?</AlertDialogTitle><AlertDialogDescription>Diese Aktion ist endgültig und löscht den Nutzer sowie ALLE seine Daten (Noten, Fächer, Beiträge, etc.).</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Abbrechen</AlertDialogCancel><AlertDialogAction onClick={() => deleteUserAndData(selectedProfile.uid)} className="bg-destructive hover:bg-destructive/90">Endgültig löschen</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    ) : (
                         <Card>
                            <CardHeader><CardTitle>Nutzerverwaltung</CardTitle><CardDescription>Alle registrierten Nutzer der Anwendung. Klicke auf einen Nutzer, um Details zu sehen.</CardDescription></CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[60vh]">
                                    <Table>
                                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>User ID</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {profiles.map(p => (
                                                <TableRow key={p.uid} onClick={() => handleSelectUser(p)} className="cursor-pointer">
                                                    <TableCell>{p.name}</TableCell>
                                                    <TableCell>{p.email}</TableCell>
                                                    <TableCell className="font-mono text-xs">{p.uid}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="posts">
                     <Card>
                        <CardHeader><CardTitle>Alle Beiträge</CardTitle><CardDescription>Alle Beiträge aus dem Community-Feed.</CardDescription></CardHeader>
                        <CardContent>
                             <ScrollArea className="h-[60vh]">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Autor</TableHead><TableHead>Inhalt</TableHead><TableHead>Datum</TableHead><TableHead className="text-right">Aktion</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {posts.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell>{p.authorName} ({p.authorId ? p.authorId.substring(0,5) : 'N/A'}...)</TableCell>
                                                <TableCell className="max-w-md truncate">{p.content}</TableCell>
                                                <TableCell>{p.createdAt?.toDate().toLocaleDateString('de-DE')}</TableCell>
                                                <TableCell className="text-right">{renderDeleteButton(() => deletePostAndComments(p.id), "Beitrag wirklich löschen?", "Diese Aktion ist endgültig und löscht den Beitrag sowie alle Kommentare dazu.")}</TableCell>
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
