import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { onAuthStateChange, getSession, signOut as authSignOut } from '../lib/auth';

export const useAuth = () => {
  const { session, username, isInitialized, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    // 1. Check existing session on mount
    const initSession = async () => {
      try {
        const currentSession = await getSession();
        if (currentSession) {
          setAuth(currentSession);
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error("Session initialization failed:", error);
        clearAuth();
      }
    };

    initSession();

    // 2. Listen for real-time auth events (login/logout elsewhere)
    const subscription = onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setAuth(newSession);
      } else if (event === 'SIGNED_OUT') {
        clearAuth();
      }
    });

    // 3. Cleanup listener on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [setAuth, clearAuth]);

  // Wrapper for signOut that also clears the store immediately
  const signOut = async () => {
    try {
      await authSignOut();
      clearAuth();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return { session, username, isInitialized, signOut };
};