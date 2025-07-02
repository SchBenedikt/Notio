"use client";

import { useState } from 'react';
import AdminDashboard from '@/components/admin-dashboard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ADMIN_PASSWORD = "SchaechnerServer";

export default function AdminPage() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { toast } = useToast();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            toast({ title: "Admin-Login erfolgreich." });
        } else {
            toast({
                variant: 'destructive',
                title: 'Falsches Passwort',
                description: 'Der Zugang zum Admin-Bereich wurde verweigert.',
            });
            setPassword('');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                           <KeyRound className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>Admin-Bereich</CardTitle>
                        <CardDescription>Bitte gib das Passwort ein, um fortzufahren.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Passwort"
                            />
                            <Button type="submit" className="w-full">
                                Anmelden
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <AdminDashboard />;
}
