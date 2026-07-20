import "server-only";

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ENV } from "@/constants/config";

/** 요청 쿠키의 세션 토큰을 갱신하고, 갱신된 쿠키가 실린 응답과 로그인 여부를 반환 */
export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({ request });

  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_PUBLISHABLE_KEY) {
    return { response, isAuthenticated: false };
  }

  const supabase = createServerClient(ENV.SUPABASE_URL, ENV.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // getClaims는 JWT 서명을 로컬 검증(비대칭 키)해 Auth 서버 왕복 없이 로그인 여부 판별
  const { data } = await supabase.auth.getClaims();

  return { response, isAuthenticated: !!data?.claims };
};
