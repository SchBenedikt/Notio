"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseEnabled } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupName, setSignupName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            router.push('/');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Fehler bei der Anmeldung',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
            const user = userCredential.user;
            
            await updateProfile(user, { displayName: signupName });

            // Create user settings document in Firestore
            await setDoc(doc(db, 'users', user.uid, 'settings', 'main'), {
                selectedGradeLevel: 10,
                mainSubjectWeight: 2,
                minorSubjectWeight: 1,
                theme: 'blue',
                isDarkMode: false,
                role: 'student',
                school: '',
            });
            
            router.push('/');
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Fehler bei der Registrierung',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isFirebaseEnabled) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
                <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg text-center">
                    <h1 className="text-2xl font-bold text-destructive">Firebase Not Configured</h1>
                    <p className="text-muted-foreground mt-2">
                        Login and registration are disabled. Please ensure your Firebase environment variables are correctly set.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
            <div className='flex items-center gap-4 mb-8'>
                <Logo />
                <h1 className="text-4xl font-bold">Noten Meister</h1>
            </div>
            <Tabs defaultValue="login" className="w-full max-w-sm">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Anmelden</TabsTrigger>
                    <TabsTrigger value="register">Registrieren</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                    <Card>
                        <CardHeader>
                            <CardTitle>Anmelden</CardTitle>
                            <CardDescription>
                                Melde dich bei deinem Konto an, um fortzufahren.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input id="login-email" type="email" placeholder="deine@email.de" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Passwort</Label>
                                    <Input id="login-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Anmelden
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="register">
                    <Card>
                        <CardHeader>
                            <CardTitle>Konto erstellen</CardTitle>
                            <CardDescription>
                               Gib deine Daten ein, um ein neues Konto zu erstellen.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-name">Name</Label>
                                    <Input id="signup-name" placeholder="Max Mustermann" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input id="signup-email" type="email" placeholder="deine@email.de" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Passwort</Label>
                                    <Input id="signup-password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                     {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Registrieren
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
