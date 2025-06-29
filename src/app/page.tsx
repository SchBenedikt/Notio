"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Dashboard from '@/components/dashboard';

export default function Home() {
  const { user, loading, isFirebaseEnabled } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if firebase is enabled and the user is not logged in.
    if (isFirebaseEnabled && !loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router, isFirebaseEnabled]);

  // In demo mode (isFirebaseEnabled is false), user will be null but we still show the dashboard.
  // When loading, we show nothing to prevent a flash of content.
  if (loading) {
    return null;
  }
  
  // If firebase is enabled and there's no user yet, we show nothing until the redirect happens.
  if (isFirebaseEnabled && !user) {
    return null;
  }

  return (
    <main>
      <Dashboard />
    </main>
  );
}
