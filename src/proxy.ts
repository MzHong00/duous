import { type NextRequest } from "next/server";

import { updateSession } from "@/server/auth/middleware";
import { guardApiAuth, guardPageAuth } from "@/server/auth/guards";

/** 세션 쿠키 갱신 후 guard를 순서대로 적용 — 차단되면 해당 응답, 모두 통과하면 세션 갱신 응답 */
export async function proxy(request: NextRequest) {
  const { response, isAuthenticated } = await updateSession(request);

  return (
    guardApiAuth(request, isAuthenticated) ?? guardPageAuth(request, isAuthenticated) ?? response
  );
}

export const config = {
  // 정적 리소스·이미지·파비콘 제외 전체 경로에 적용
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
