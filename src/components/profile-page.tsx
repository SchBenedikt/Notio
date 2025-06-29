"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reauthenticateWithCredential, EmailAuthProvider, updateProfile, updateEmail, updatePassword, deleteUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDocs, collection, query, writeBatch } from "firebase/firestore";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, User, KeyRound, Mail, Trash2 } from "lucide-react";

// Schemas for forms
const profileFormSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein.").max(50, "Name darf nicht länger als 50 Zeichen sein."),
});

const emailFormSchema = z.object({
  newEmail: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  password: z.string().min(1, "Passwort ist erforderlich."),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Aktuelles Passwort ist erforderlich."),
  newPassword: z.string().min(6, "Neues Passwort muss mindestens 6 Zeichen lang sein."),
});

export function ProfilePage() {
  const { user, isFirebaseEnabled } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [deletePassword, setDeletePassword] = useState("");

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: user?.displayName || "" },
  });

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { newEmail: "", password: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const handleProfileUpdate = async (values: z.infer<typeof profileFormSchema>) => {
    if (!user) return;
    setLoading(p => ({ ...p, profile: true }));
    try {
      await updateProfile(user, { displayName: values.name });
      toast({ title: "Erfolg", description: "Dein Name wurde aktualisiert." });
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
      toast({ title: "E-Mail aktualisiert", description: `Eine Bestätigungs-E-Mail wurde an ${values.newEmail} gesendet.` });
      emailForm.reset();
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

        // Delete Firestore data
        const batch = writeBatch(db);
        const gradesQuery = query(collection(db, 'users', user.uid, 'grades'));
        const gradesSnap = await getDocs(gradesQuery);
        gradesSnap.forEach(doc => batch.delete(doc.ref));

        const subjectsQuery = query(collection(db, 'users', user.uid, 'subjects'));
        const subjectsSnap = await getDocs(subjectsQuery);
        subjectsSnap.forEach(doc => batch.delete(doc.ref));

        const settingsDocRef = doc(db, 'users', user.uid, 'settings', 'main');
        batch.delete(settingsDocRef);
        
        await batch.commit();
        
        // Delete user
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


  if (!isFirebaseEnabled) {
    return (
        <div className="text-center py-20 flex flex-col items-center justify-center min-h-[60vh] bg-background/50 rounded-lg border border-dashed">
            <h2 className="text-2xl font-semibold">Profilverwaltung nicht verfügbar</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
                Die Profilverwaltung ist nur im angemeldeten Zustand verfügbar. Bitte konfiguriere Firebase, um diese Funktion zu nutzen.
            </p>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
         <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full border-8 border-primary/5">
                <User className="h-8 w-8 text-primary" />
            </div>
        </div>
        <h1 className="text-3xl font-bold">Dein Profil</h1>
        <p className="text-muted-foreground mt-2">
          Verwalte deine Kontoinformationen und Sicherheitseinstellungen.
        </p>
      </div>
      
      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Profilinformationen</CardTitle>
          <CardDescription>Aktualisiere deinen öffentlichen Namen.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
              <FormField control={profileForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Anzeigename</FormLabel>
                  <FormControl>
                    <Input placeholder="Dein Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={loading.profile}>
                {loading.profile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Namen speichern
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Sicherheit</CardTitle>
          <CardDescription>Ändere deine E-Mail-Adresse oder dein Passwort.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Change Email */}
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(handleEmailUpdate)} className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> E-Mail-Adresse ändern</h4>
                <FormField control={emailForm.control} name="newEmail" render={({ field }) => (
                    <FormItem><FormLabel>Neue E-Mail</FormLabel><FormControl><Input type="email" placeholder="neue@email.de" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={emailForm.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Aktuelles Passwort</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={loading.email} variant="secondary">
                  {loading.email && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  E-Mail ändern
                </Button>
            </form>
          </Form>
          {/* Change Password */}
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
      </Card>

      {/* Danger Zone */}
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
                            Diese Aktion kann nicht rückgängig gemacht werden. Dein Konto und alle deine Daten (Fächer, Noten, Anhänge) werden dauerhaft gelöscht. Bitte gib dein Passwort ein, um zu bestätigen.
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
  );
}
