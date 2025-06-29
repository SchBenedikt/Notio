"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.8 0 129.8 110.3 20 244 20c68.3 0 128.8 27.2 172.4 71.4l-64.5 64.5C323.5 125.7 286.4 104 244 104c-82.3 0-149.3 67-149.3 149.8s67 149.8 149.3 149.8c94.2 0 127.3-64.8 132.8-97.8H244v-75h244.1c2.1 12.8 3.9 26.1 3.9 40z"></path>
    </svg>
);

const Divider = () => (
    <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Oder</span>
        </div>
    </div>
);

export default function LoginPage() {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupName, setSignupName] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const { isFirebaseEnabled, firebaseError } = useAuth();

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
    
    const handleGoogleSignIn = async () => {
        if (!isFirebaseEnabled) return;
        setGoogleLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const settingsRef = doc(db, 'users', user.uid, 'settings', 'main');
            const settingsSnap = await getDoc(settingsRef);

            if (!settingsSnap.exists()) {
                await setDoc(settingsRef, {
                    selectedGradeLevel: 10,
                    mainSubjectWeight: 2,
                    minorSubjectWeight: 1,
                    theme: 'blue',
                    isDarkMode: false,
                    role: 'student',
                    school: '',
                });
            }
            router.push('/');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Fehler bei der Google-Anmeldung',
                description: error.message,
            });
        } finally {
            setGoogleLoading(false);
        }
    };

    if (!isFirebaseEnabled) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
                 <div className='flex items-center gap-4 mb-8'>
                    <Logo />
                    <h1 className="text-4xl font-bold">Noten Meister</h1>
                </div>
                <div className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg text-center">
                    <h1 className="text-2xl font-bold">Demo Modus</h1>
                    <p className="text-muted-foreground mt-2">
                        {firebaseError 
                          ? `Firebase Fehler: ${firebaseError}`
                          : "Firebase ist nicht konfiguriert. Die App läuft im Offline-Demo-Modus."
                        }
                    </p>
                    <Button onClick={() => router.push('/')} className="mt-6">
                        Weiter zum Dashboard
                    </Button>
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
                                <Button type="submit" className="w-full" disabled={loading || googleLoading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Anmelden
                                </Button>
                            </form>
                            <Divider />
                            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading || googleLoading}>
                                {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                                Mit Google anmelden
                            </Button>
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
                                <Button type="submit" className="w-full" disabled={loading || googleLoading}>
                                     {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Registrieren
                                </Button>
                            </form>
                            <Divider />
                            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading || googleLoading}>
                                {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                                Mit Google registrieren
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
