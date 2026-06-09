import { supabase } from './supabase';

const INTERNAL_DOMAIN = '@oss.local';

export const signIn = async (username, password) => {
  // Clean input and append dummy domain silently
  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
  const dummyEmail = `${cleanUsername}${INTERNAL_DOMAIN}`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: dummyEmail,
    password: password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return subscription;
};