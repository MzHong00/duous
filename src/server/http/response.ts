import "server-only";

import { NextResponse } from "next/server";

/** 에러 응답 생성 — 원인(cause)은 서버 로그에만 남기고 클라이언트에는 message만 내려준다 */
export const jsonError = (message: string, status = 500, cause?: unknown): NextResponse => {
  if (cause) console.error(`[api] ${message}`, cause);
  return NextResponse.json({ message }, { status });
};

/** 본문 없는 성공 응답 (bffFetch의 204 특수 처리와 짝을 이룬다) */
export const noContent = (): NextResponse => new NextResponse(null, { status: 204 });
