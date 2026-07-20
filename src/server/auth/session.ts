import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@/types/user";

/** 세션 쿠키에서 검증된 사용자를 얻는다 — 클라이언트가 보낸 신원(body/query)은 신뢰하지 않는다 */
export const getSessionUser = async (supabase: SupabaseClient): Promise<User | null> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return {
    id: user.id,
    name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
    email: user.email,
    profileImage: user.user_metadata?.avatar_url,
  };
};
