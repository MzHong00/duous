import { supabase } from "@/lib/supabase/client";

import type { User } from "@/types/user";

const DEFAULT_USER_NAME = "사용자"; // 이름·이메일을 얻지 못했을 때의 표시 이름
const OAUTH_CALLBACK_PATH = "/auth/callback"; // OAuth 리다이렉트 콜백 경로
const GOOGLE_OAUTH_SCOPES = "openid email profile"; // 구글 OAuth 요청 스코프

export const authApi = {
  signInWithGoogle: async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${OAUTH_CALLBACK_PATH}`,
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

  getUser: async (): Promise<User | null> => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return {
      id: user.id,
      name: user.user_metadata?.full_name || user.email?.split("@")[0] || DEFAULT_USER_NAME,
      email: user.email,
      profileImage: user.user_metadata?.avatar_url,
    };
  },

  // 이름·프로필 이미지를 Supabase auth user_metadata에 반영해 실제로 영속화한다
  updateProfile: async (updates: { name?: string; profileImage?: string }): Promise<void> => {
    const { error } = await supabase.auth.updateUser({
      data: {
        ...(updates.name !== undefined && { full_name: updates.name }),
        ...(updates.profileImage !== undefined && { avatar_url: updates.profileImage }),
      },
    });
    if (error) throw error;
  },
};
