import { supabase } from "@/lib/supabase/client";
import { ApiError } from "@/lib/errors/apiError";

import type { User } from "@/types/user";

const DEFAULT_USER_NAME = "사용자"; // 이름·이메일을 얻지 못했을 때의 표시 이름
const OAUTH_CALLBACK_PATH = "/auth/callback"; // OAuth 리다이렉트 콜백 경로
const GOOGLE_OAUTH_SCOPES = "openid email profile"; // 구글 OAuth 요청 스코프

export const authApi = {
  signInWithGoogle: async (redirectPath?: string): Promise<void> => {
    const callbackUrl = new URL(OAUTH_CALLBACK_PATH, window.location.origin);
    if (redirectPath) callbackUrl.searchParams.set("redirect", redirectPath);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
        scopes: GOOGLE_OAUTH_SCOPES,
      },
    });
    if (error) throw new ApiError("구글 로그인에 실패했습니다.", error);
  },

  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new ApiError("로그아웃에 실패했습니다.", error);
  },

  getSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw new ApiError("세션 조회에 실패했습니다.", error);
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
    if (error) throw new ApiError("프로필 수정에 실패했습니다.", error);
  },
};
