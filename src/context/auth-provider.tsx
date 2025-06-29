"use client";

import { createContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseEnabled } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseEnabled) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // If firebase is not enabled, we are not loading and have no user.
      setLoading(false);
    }
  }, []);

  if (loading) {
      return (
        <div className="flex flex-col min-h-screen bg-muted/40">
          <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-sm border-b">
             <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6 lg:px-8">
                 <Skeleton className="h-8 w-32" />
                 <div className="flex items-center gap-2">
                     <Skeleton className="h-10 w-24" />
                     <Skeleton className="h-10 w-10 rounded-full" />
                 </div>
             </div>
          </header>
          <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
              <Skeleton className="h-full w-full rounded-lg" />
          </main>
        </div>
      )
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
