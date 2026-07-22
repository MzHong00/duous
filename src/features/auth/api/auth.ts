import { supabase } from "@/lib/supabase/client";
import { ROUTES } from "@/constants/routes";

const GOOGLE_OAUTH_SCOPES = "openid email profile"; // 구글 OAuth 요청 스코프

export const authApi = {
  signInWithGoogle: async (redirectPath?: string): Promise<void> => {
    const callbackUrl = new URL(ROUTES.AUTH.CALLBACK.path, window.location.origin);
    if (redirectPath) callbackUrl.searchParams.set("redirect", redirectPath);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
        scopes: GOOGLE_OAUTH_SCOPES,
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
};
