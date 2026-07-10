import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";
import { ROUTES } from "@/constants/routes";

// 비로그인 상태로 접근 가능한 경로 접두사
const PUBLIC_PATH_PREFIXES = [ROUTES.LOGIN.path, "/auth/callback", "/workspace/join"];

/** 세션 쿠키 갱신 + 비로그인 사용자의 보호 라우트 접근 차단 */
export async function proxy(request: NextRequest) {
  const { response, isAuthenticated } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isPublicPath =
    pathname === "/" || PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ROUTES.LOGIN.path;
    loginUrl.search = `?redirect=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // 정적 리소스·이미지·파비콘 제외 전체 경로에 적용
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
