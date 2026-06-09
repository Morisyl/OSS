"use client";

import '../styles/globals.css';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useUIStore } from '../store/useUIStore';
import { TopBar } from '../components/layout/TopBar';
import { Sidebar } from '../components/layout/Sidebar';
import { Spinner } from '../components/common/Spinner';

export default function RootLayout({ children }) {
  const { session, isInitialized } = useAuth();
  const { darkMode } = useUIStore();
  const pathname = usePathname();
  const router = useRouter();

  // Route guarding logic
  useEffect(() => {
    if (!isInitialized) return;

    const isAuthRoute = pathname === '/login' || pathname === '/';

    if (!session && !isAuthRoute) {
      router.push('/login');
    } else if (session && isAuthRoute) {
      router.push('/home');
    }
  }, [session, isInitialized, pathname, router]);

  // Determine if we show the app shell (TopBar/Sidebar)
  const isPublicRoute = pathname === '/login' || pathname === '/';
  const showShell = session && !isPublicRoute;

  return (
    <html lang="en" className={darkMode ? 'dark' : ''}>
      <body className="bg-white dark:bg-black text-black dark:text-white font-sans min-h-screen flex flex-col antialiased transition-colors duration-300">
        
        {/* Auth Guard Loading State to prevent UI flashing */}
        {!isInitialized ? (
          <div className="flex-1 flex items-center justify-center h-screen">
            <Spinner className="w-10 h-10" color="text-black dark:text-white" />
          </div>
        ) : (
          <>
            {showShell && <TopBar />}
            <div className="flex flex-1 overflow-hidden">
              {showShell && <Sidebar />}
              <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                {children}
              </main>
            </div>
          </>
        )}

      </body>
    </html>
  );
}