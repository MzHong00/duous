import { NextResponse } from "next/server";

import { createServerSupabase } from "@/server/db/supabase";
import { jsonError } from "@/server/http/response";
import { getSessionUser } from "@/server/auth/session";
import { rowToWorkspace } from "@/features/workspace/utils/workspaceUtils";

import type { NextRequest } from "next/server";
import type { RouteContext } from "@/server/http/routeContext";
import type { WorkspaceRow, MemberRow } from "@/features/workspace/utils/workspaceUtils";

const UNIQUE_VIOLATION_CODE = "23505"; // Postgres unique constraint 위반 에러 코드

/** POST /api/workspaces/[id]/join — 워크스페이스 참여 (참여자는 세션 사용자로 확정) */
export async function POST(_request: NextRequest, context: RouteContext<{ id: string }>) {
  const { id: workspaceId } = await context.params;

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return jsonError("로그인이 필요합니다.", 401);

  // 이미 멤버인 경우는 unique 제약 위반(23505)으로 걸러지므로 사전 조회 없이 바로 insert한다
  const { error } = await supabase.from("workspace_members").insert({
    workspace_id: workspaceId,
    user_id: sessionUser.id,
    display_name: sessionUser.name,
    email: sessionUser.email,
    avatar_url: sessionUser.profileImage,
  });
  if (error && error.code !== UNIQUE_VIOLATION_CODE) {
    return jsonError("워크스페이스 참여에 실패했습니다.", 500, error);
  }

  // 워크스페이스와 멤버 목록은 서로 독립이므로 병렬 조회
  const [wsResult, membersResult] = await Promise.all([
    supabase.from("workspaces").select("*").eq("id", workspaceId).single(),
    supabase.from("workspace_members").select("*").eq("workspace_id", workspaceId),
  ]);
  if (wsResult.error) return jsonError("워크스페이스 참여에 실패했습니다.", 500, wsResult.error);

  return NextResponse.json(
    rowToWorkspace(wsResult.data as WorkspaceRow, (membersResult.data ?? []) as MemberRow[])
  );
}
