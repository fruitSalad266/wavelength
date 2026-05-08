import React, { createContext, useContext, useState, useEffect } from 'react';
import { Image } from 'expo-image';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, banner_url, interests, major, class_year, location, age_range, extras, settings')
      .eq('id', userId)
      .single();
    setProfile(data);
    if (data) {
      const urls = [data.avatar_url, data.banner_url].filter(Boolean);
      if (urls.length > 0) Image.prefetch(urls);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
      }
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshProfile = () => {
    if (session?.user) return fetchProfile(session.user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const needsOnboarding = session && profile && !profile.settings?.onboarding_complete;

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      profile,
      loading,
      needsOnboarding,
      passwordRecovery,
      clearPasswordRecovery: () => setPasswordRecovery(false),
      refreshProfile,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
