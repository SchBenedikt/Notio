
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reauthenticateWithCredential, EmailAuthProvider, updateProfile, updateEmail, updatePassword, deleteUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDocs, collection, query, writeBatch, setDoc, onSnapshot } from "firebase/firestore";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, User, KeyRound, Mail, Trash2, Pencil, Info, Briefcase, School as SchoolIcon } from "lucide-react";
import { Textarea } from "./ui/textarea";
import type { Profile, School } from "@/lib/types";
import { Skeleton } from "./ui/skeleton";
import { FollowListDialog } from "./follow-list-dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { SchoolSelector } from "./school-selector";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein.").max(50, "Name darf nicht länger als 50 Zeichen sein."),
  bio: z.string().max(160, "Biografie darf nicht länger als 160 Zeichen sein.").optional(),
});

const emailFormSchema = z.object({
  newEmail: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  password: z.string().min(1, "Passwort ist erforderlich."),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Aktuelles Passwort ist erforderlich."),
  newPassword: z.string().min(6, "Neues Passwort muss mindestens 6 Zeichen lang sein."),
});

type ProfilePageProps = {
  profile: Profile | null;
  onUserNameChange: (name: string) => void;
  onToggleFollow: (targetUserId: string) => void;
  userRole: string;
  onUserRoleChange: (role: 'student' | 'teacher') => void;
  userSchoolId: string;
  onUserSchoolIdChange: (schoolId: string) => void;
  allSchools: School[];
  onAddSchool: (name: string, address: string) => Promise<string>;
};


export function ProfilePage({ 
  profile, 
  onUserNameChange, 
  onToggleFollow, 
  userRole, 
  onUserRoleChange, 
  userSchoolId, 
  onUserSchoolIdChange,
  allSchools,
  onAddSchool
}: ProfilePageProps) {
  const { user, isFirebaseEnabled } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [deletePassword, setDeletePassword] = useState("");
  const [dialogState, setDialogState] = useState<{isOpen: boolean, title: string, userIds: string[]}>({isOpen: false, title: '', userIds: []});
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: "", bio: "" },
  });

  useEffect(() => {
    if (user && profile) {
        profileForm.reset({
            name: profile.name,
            bio: profile.bio || ""
        });
    } else if (user) {
        profileForm.reset({
            name: user.displayName || "",
            bio: ""
        });
    }
  }, [user, profile, profileForm]);

  useEffect(() => {
    if (!isFirebaseEnabled) return;
    const q = collection(db, 'profiles');
    const unsub = onSnapshot(q, (snapshot) => {
        const profilesData = snapshot.docs.map(doc => ({...doc.data(), uid: doc.id } as Profile));
        setAllProfiles(profilesData);
    });
    return () => unsub();
  }, [isFirebaseEnabled]);

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { newEmail: "", password: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    if(profile) {
      profileForm.reset({ name: profile.name, bio: profile.bio || "" });
    }
    emailForm.reset();
    passwordForm.reset();
  }

  const handleProfileUpdate = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;
    setLoading(p => ({ ...p, profile: true }));
    try {
      if (user.displayName !== values.name) {
        await updateProfile(user, { displayName: values.name });
        onUserNameChange(values.name);
      }
      
      const profileRef = doc(db, 'profiles', user.uid);
      const updatedProfileData = {
          name: values.name,
          bio: values.bio,
      };
      const sanitizedProfileData = JSON.parse(JSON.stringify(updatedProfileData));
      await setDoc(profileRef, sanitizedProfileData, { merge: true });

      toast({ title: "Erfolg", description: "Dein Profil wurde aktualisiert." });
      setIsEditing(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    } finally {
      setLoading(p => ({ ...p, profile: false }));
    }
  };

  const handleEmailUpdate = async (values: z.infer<typeof emailFormSchema>) => {
    if (!user || !user.email) return;
    setLoading(p => ({ ...p, email: true }));
    try {
      const credential = EmailAuthProvider.credential(user.email, values.password);
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, values.newEmail);
      
      const profileRef = doc(db, 'profiles', user.uid);
      await setDoc(profileRef, { email: values.newEmail }, { merge: true });

      toast({ title: "E-Mail aktualisiert", description: `Eine Bestätigungs-E-Mail wurde an ${values.newEmail} gesendet.` });
      emailForm.reset();
      setIsEditing(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Fehler", description: "Falsches Passwort oder die E-Mail wird bereits verwendet." });
    } finally {
      setLoading(p => ({ ...p, email: false }));
    }
  };

  const handlePasswordUpdate = async (values: z.infer<typeof passwordFormSchema>) => {
    if (!user || !user.email) return;
    setLoading(p => ({ ...p, password: true }));
    try {
      const credential = EmailAuthProvider.credential(user.email, values.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, values.newPassword);
      toast({ title: "Erfolg", description: "Dein Passwort wurde erfolgreich geändert." });
      passwordForm.reset();
      setIsEditing(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Fehler beim Ändern des Passworts", description: "Dein aktuelles Passwort war nicht korrekt." });
    } finally {
      setLoading(p => ({ ...p, password: false }));
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !user.email) return;
    setLoading(p => ({ ...p, delete: true }));
    try {
        const credential = EmailAuthProvider.credential(user.email, deletePassword);
        await reauthenticateWithCredential(user, credential);

        const batch = writeBatch(db);
        
        const gradesQuery = query(collection(db, 'users', user.uid, 'grades'));
        const gradesSnap = await getDocs(gradesQuery);
        gradesSnap.forEach(doc => batch.delete(doc.ref));

        const subjectsQuery = query(collection(db, 'users', user.uid, 'subjects'));
        const subjectsSnap = await getDocs(subjectsQuery);
        subjectsSnap.forEach(doc => batch.delete(doc.ref));

        const settingsDocRef = doc(db, 'users', user.uid, 'settings', 'main');
        batch.delete(settingsDocRef);
        
        const profileDocRef = doc(db, 'profiles', user.uid);
        batch.delete(profileDocRef);

        await batch.commit();
        
        await deleteUser(user);
        toast({ title: "Konto gelöscht", description: "Dein Konto und alle zugehörigen Daten wurden gelöscht." });
        router.push("/login");

    } catch (error: any) {
        toast({ variant: "destructive", title: "Fehler beim Löschen des Kontos", description: "Dein Passwort war nicht korrekt." });
    } finally {
        setLoading(p => ({ ...p, delete: false }));
        setDeletePassword("");
    }
  };

  const handleShowFollowList = (listType: 'followers' | 'following') => {
    if (!profile) return;
    setDialogState({
        isOpen: true,
        title: listType === 'followers' ? 'Follower' : 'Ich folge',
        userIds: listType === 'followers' ? (profile.followers || []) : (profile.following || []),
    });
  }
  
  const selectedSchool = allSchools.find(s => s.id === userSchoolId);

  const profilesForDialog = useMemo(() => {
    if (!dialogState.userIds.length) return [];
    return allProfiles.filter(p => dialogState.userIds.includes(p.uid));
  }, [allProfiles, dialogState.userIds]);


  if (!isFirebaseEnabled || !user) {
    return (
        <div className="text-center py-20 flex flex-col items-center justify-center min-h-[60vh] bg-background/50 rounded-lg border border-dashed">
            <h2 className="text-2xl font-semibold">Profilverwaltung nicht verfügbar</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
                Die Profilverwaltung ist nur im angemeldeten Zustand verfügbar.
            </p>
        </div>
    );
  }

  if (loading.page) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-pulse">
        <div className="text-center space-y-4">
         <div className="flex justify-center mb-4">
            <Skeleton className="h-20 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-1/2 mx-auto" />
        <Skeleton className="h-6 w-3/4 mx-auto" />
      </div>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /><Skeleton className="h-4 w-1/2" /></CardHeader>
        <CardContent className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
        <Card className="border-destructive"><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-10 w-48" /></CardContent></Card>
      </div>
    )
  }

  return (
    <>
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
         <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full border-8 border-primary/5">
                <User className="h-8 w-8 text-primary" />
            </div>
        </div>
        <h1 className="text-3xl font-bold">Dein Profil</h1>
        <p className="text-muted-foreground mt-2">
          Verwalte deine öffentlichen Profildaten und Sicherheitseinstellungen.
        </p>
      </div>

      {isEditing ? (
        <Card>
            <CardHeader>
                <CardTitle>Profil bearbeiten</CardTitle>
                <CardDescription>Ändere hier deine persönlichen Daten und Sicherheitseinstellungen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-medium flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Öffentliches Profil</h4>
                        <FormField control={profileForm.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Anzeigename</FormLabel><FormControl><Input placeholder="Dein Name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={profileForm.control} name="bio" render={({ field }) => (
                            <FormItem><FormLabel>Biografie (optional)</FormLabel><FormControl><Textarea placeholder="Erzähle etwas über dich..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" disabled={loading.profile}>
                            {loading.profile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Profil speichern
                        </Button>
                    </form>
                </Form>
                
                <div className="space-y-4 p-4 border rounded-lg">
                   <h4 className="font-medium flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /> Persönliche Daten</h4>
                   <div className="space-y-2">
                        <Label>Rolle</Label>
                        <RadioGroup
                            value={userRole}
                            onValueChange={(value) => onUserRoleChange(value as any)}
                            className="flex space-x-4 pt-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="student" id="role-student" />
                                <Label htmlFor="role-student" className="font-normal">Schüler</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="teacher" id="role-teacher" />
                                <Label htmlFor="role-teacher" className="font-normal">Lehrer</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label>Schule</Label>
                        <SchoolSelector
                            schools={allSchools}
                            value={userSchoolId}
                            onChange={onUserSchoolIdChange}
                            onAddSchool={onAddSchool}
                        />
                    </div>
                     <p className="text-xs text-muted-foreground">Änderungen an Rolle und Schule werden sofort gespeichert.</p>
                </div>

                <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(handleEmailUpdate)} className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-medium flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> E-Mail-Adresse ändern</h4>
                        <FormField control={emailForm.control} name="newEmail" render={({ field }) => (
                            <FormItem><FormLabel>Neue E-Mail</FormLabel><FormControl><Input type="email" placeholder="neue@email.de" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={emailForm.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Aktuelles Passwort zur Bestätigung</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" disabled={loading.email} variant="secondary">
                        {loading.email && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        E-Mail ändern
                        </Button>
                    </form>
                </Form>

                <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-4 p-4 border rounded-lg">
                        <h4 className="font-medium flex items-center gap-2"><KeyRound className="h-4 w-4 text-muted-foreground" /> Passwort ändern</h4>
                        <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                            <FormItem><FormLabel>Aktuelles Passwort</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                            <FormItem><FormLabel>Neues Passwort</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" disabled={loading.password} variant="secondary">
                        {loading.password && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Passwort ändern
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="justify-end">
                <Button variant="ghost" onClick={handleCancelEdit}>Abbrechen</Button>
            </CardFooter>
        </Card>
      ) : (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Profilübersicht</CardTitle>
                    <CardDescription>Deine persönlichen Daten und Sicherheitseinstellungen.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Bearbeiten
                </Button>
            </CardHeader>
            <CardContent className="space-y-2">
                 <div className="flex items-start gap-4 p-3 border rounded-md">
                    <User className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Anzeigename</p>
                        <p className="font-medium">{profile?.name || user.displayName || "Nicht festgelegt"}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-3 border rounded-md">
                    <Info className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Biografie</p>
                        <p className="font-medium text-sm italic text-muted-foreground whitespace-pre-wrap">{profile?.bio || "Keine Biografie festgelegt."}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3 border rounded-md">
                    <button onClick={() => handleShowFollowList('followers')} className="flex-1 space-y-1 text-left">
                        <p className="text-xs text-muted-foreground">Follower</p>
                        <p className="font-medium text-lg">{profile?.followers?.length || 0}</p>
                    </button>
                    <button onClick={() => handleShowFollowList('following')} className="flex-1 space-y-1 text-left">
                        <p className="text-xs text-muted-foreground">Ich folge</p>
                        <p className="font-medium text-lg">{profile?.following?.length || 0}</p>
                    </button>
                </div>
                <div className="flex items-start gap-4 p-3 border rounded-md">
                    <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground">E-Mail-Adresse</p>
                        <p className="font-medium">{user.email}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-3 border rounded-md">
                    <KeyRound className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Passwort</p>
                        <p className="font-medium text-muted-foreground italic">Zum Ändern bitte auf "Bearbeiten" klicken.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-3 border rounded-md">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Rolle</p>
                        <p className="font-medium">{userRole === 'student' ? 'Schüler' : 'Lehrer'}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-3 border rounded-md">
                    <SchoolIcon className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Schule</p>
                        <p className="font-medium">{selectedSchool?.name || "Nicht festgelegt"}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Gefahrenzone</CardTitle>
          <CardDescription>Diese Aktionen können nicht rückgängig gemacht werden.</CardDescription>
        </CardHeader>
        <CardContent>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Konto dauerhaft löschen
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bist du dir absolut sicher?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Diese Aktion kann nicht rückgängig gemacht werden. Dein Konto und alle deine Daten (Fächer, Noten, Anhänge, Profil) werden dauerhaft gelöscht. Bitte gib dein Passwort ein, um zu bestätigen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2">
                        <Label htmlFor="delete-password">Passwort</Label>
                        <Input id="delete-password" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={loading.delete || !deletePassword}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                             {loading.delete && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Konto löschen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </CardContent>
      </Card>
    </div>
    <FollowListDialog 
        isOpen={dialogState.isOpen}
        onOpenChange={(isOpen) => setDialogState(prev => ({...prev, isOpen}))}
        title={dialogState.title}
        profiles={profilesForDialog}
        currentUserId={user?.uid || null}
        onToggleFollow={onToggleFollow}
        followingList={profile?.following || []}
    />
    </>
  );
}
