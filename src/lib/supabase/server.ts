import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

import { ENV } from "@/constants/config";

/** 서버 컴포넌트/Route Handler용 Supabase 클라이언트 (요청 쿠키 기반, 매 요청 새로 생성) */
export const createServerSupabase = async (): Promise<SupabaseClient> => {
  const cookieStore = await cookies();

  return createServerClient(ENV.SUPABASE_URL, ENV.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component에서는 쿠키 쓰기가 불가 — 세션 갱신은 middleware가 담당한다
        }
      },
    },
  });
};
