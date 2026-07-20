import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { ROUTES, PUBLIC_PATH_PREFIXES } from "@/constants/routes";

/** 비로그인 상태로 접근 가능한 경로인지 판별 */
const isPublicPath = (pathname: string): boolean =>
  pathname === "/" || PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

/** 비로그인 API 요청을 401 JSON으로 차단 (bffFetch가 파싱 가능하도록) · 해당 없으면 null */
export const guardApiAuth = (request: NextRequest, isAuthenticated: boolean) => {
  const { pathname } = request.nextUrl;
  if (isAuthenticated || !pathname.startsWith("/api")) return null;
  return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
};

/** 비로그인 페이지 요청을 로그인 페이지로 리다이렉트 (원래 경로는 redirect 쿼리로 보존) · 해당 없으면 null */
export const guardPageAuth = (request: NextRequest, isAuthenticated: boolean) => {
  const { pathname } = request.nextUrl;
  if (isAuthenticated || isPublicPath(pathname)) return null;

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = ROUTES.LOGIN.path;
  loginUrl.search = `?redirect=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(loginUrl);
};
