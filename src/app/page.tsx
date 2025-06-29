"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import Dashboard from '@/components/dashboard';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // You can return a loading spinner here if you want
    // For now, returning null to avoid flashing the dashboard
    return null;
  }

  return (
    <main>
      <Dashboard />
    </main>
  );
}
