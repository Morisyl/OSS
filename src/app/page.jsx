"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function RootPage() {
  const { session, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until Supabase finishes checking the local session
    if (!isInitialized) return;

    // Instantly route the user to the correct destination
    if (session) {
      router.push('/home');
    } else {
      router.push('/login');
    }
  }, [session, isInitialized, router]);

  // Render nothing here. The Spinner in your layout.jsx handles the visual loading state.
  return null;
}