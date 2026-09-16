"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface Profile {
  id: string;
  email: string | null;
  role: "user" | "admin";
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = isSupabaseConfigured() ? createClient() : null;

  const fetchProfile = useCallback(
    async (userId: string) => {
      if (!supabase) return;

      const { data: rpcData, error: rpcError } = await supabase
        .rpc("get_my_profile")
        .maybeSingle();

      if (rpcData) {
        setProfile(rpcData as Profile);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role")
        .eq("id", userId)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
      } else {
        setProfile(null);
        if (rpcError || error) {
          console.error("Profile fetch failed:", rpcError ?? error);
        }
      }
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const init = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      }
      setLoading(false);
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        await fetchProfile(nextUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: profile?.role === "admin",
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
