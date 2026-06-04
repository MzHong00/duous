import { supabase } from "@/shared/lib/supabase";
import type { User } from "@/shared/types/user";

export const authApi = {
  signInWithGoogle: async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "openid email profile",
      },
    });
    if (error) throw error;
  },

  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  getUser: async (): Promise<User | null> => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return {
      id: user.id,
      name: user.user_metadata?.full_name || user.email?.split("@")[0] || "사용자",
      email: user.email,
      profileImage: user.user_metadata?.avatar_url,
    };
  },
};
