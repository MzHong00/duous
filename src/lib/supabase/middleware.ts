import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ENV } from "@/constants/config";

/** 요청 쿠키의 세션 토큰을 갱신하고, 갱신된 쿠키가 실린 응답과 유저를 반환 */
export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({ request });

  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_PUBLISHABLE_KEY) {
    return { response, user: null };
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
};
