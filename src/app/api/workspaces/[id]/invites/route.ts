import { NextResponse } from "next/server";

import { createServerSupabase } from "@/server/db/supabase";
import { jsonError } from "@/server/http/response";
import { getSessionUser } from "@/server/auth/session";

import type { NextRequest } from "next/server";
import type { RouteContext } from "@/server/http/types";

const INVITE_CODE_LENGTH = 8; // 초대 코드 길이
const INVITE_CODE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 초대 코드 유효 기간 (7일)

/** 초대 코드 생성 응답 */
interface InviteCodeCreateResponse {
  code: string; // 발급된 초대 코드
}

/** POST /api/workspaces/[id]/invites — 초대 코드 생성 (발급자는 세션 사용자로 확정) */
export async function POST(_request: NextRequest, context: RouteContext<{ id: string }>) {
  const { id: workspaceId } = await context.params;

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return jsonError("로그인이 필요합니다.", 401);

  const code = crypto.randomUUID().replace(/-/g, "").slice(0, INVITE_CODE_LENGTH);
  const expiresAt = new Date(Date.now() + INVITE_CODE_TTL_MS).toISOString();

  const { error } = await supabase.from("workspace_invites").insert({
    workspace_id: workspaceId,
    invite_code: code,
    created_by: sessionUser.id,
    expires_at: expiresAt,
  });
  if (error) return jsonError("초대 코드 생성에 실패했습니다.", 500, error);
  return NextResponse.json({ code } satisfies InviteCodeCreateResponse, { status: 201 });
}
