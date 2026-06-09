import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  session: null,
  username: null,
  isInitialized: false, // Prevents UI flicker on initial load

  setAuth: (session) => {
    let displayUsername = null;
    
    // Strip the internal domain for display purposes
    if (session?.user?.email) {
      displayUsername = session.user.email.replace('@oss.local', '');
    }

    set({ 
      session, 
      username: displayUsername, 
      isInitialized: true 
    });
  },

  clearAuth: () => set({ 
    session: null, 
    username: null, 
    isInitialized: true 
  })
}));