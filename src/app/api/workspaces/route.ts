import { NextResponse } from "next/server";

import { createServerSupabase } from "@/server/db/supabase";
import { jsonError } from "@/server/http/response";
import { getSessionUser } from "@/server/auth/session";
import { rowToWorkspace } from "@/features/workspace/utils/workspaceUtils";

import type { NextRequest } from "next/server";
import type { RoomType } from "@/features/workspace/types/workspace";
import type { WorkspaceRow, MemberRow } from "@/features/workspace/utils/workspaceUtils";

/** 워크스페이스 생성 요청 본문 (생성자는 세션에서 확정) */
interface WorkspaceCreateRequest {
  name: string; // 워크스페이스 이름
  type: RoomType; // 방 유형
  startDate?: string; // 시작일 (ISO)
}

/** GET /api/workspaces — 내가 속한 워크스페이스 목록 (멤버 포함) */
export async function GET() {
  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return jsonError("로그인이 필요합니다.", 401);

  const { data: memberRows, error: memberError } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", sessionUser.id);
  if (memberError) return jsonError("워크스페이스 목록 조회에 실패했습니다.", 500, memberError);
  if (!memberRows?.length) return NextResponse.json([]);

  const workspaceIds = memberRows.map((r) => r.workspace_id);

  // 워크스페이스와 멤버 목록은 서로 독립이므로 병렬 조회
  const [wsResult, membersResult] = await Promise.all([
    supabase.from("workspaces").select("*").in("id", workspaceIds),
    supabase.from("workspace_members").select("*").in("workspace_id", workspaceIds),
  ]);
  if (wsResult.error) {
    return jsonError("워크스페이스 목록 조회에 실패했습니다.", 500, wsResult.error);
  }
  if (membersResult.error) {
    return jsonError("워크스페이스 목록 조회에 실패했습니다.", 500, membersResult.error);
  }

  const workspaces = (wsResult.data as WorkspaceRow[]).map((ws) => {
    const members = (membersResult.data as (MemberRow & { workspace_id: string })[]).filter(
      (m) => m.workspace_id === ws.id
    );
    return rowToWorkspace(ws, members);
  });
  return NextResponse.json(workspaces);
}

/** POST /api/workspaces — 워크스페이스 생성 + 생성자(세션 사용자) 멤버 추가 */
export async function POST(request: NextRequest) {
  const { name, type, startDate } = (await request.json()) as WorkspaceCreateRequest;
  if (!name || !type) return jsonError("name, type은 필수입니다.", 400);

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return jsonError("로그인이 필요합니다.", 401);

  const { data: ws, error: wsError } = await supabase
    .from("workspaces")
    .insert({
      name,
      type,
      start_date: startDate || null,
      created_by: sessionUser.id,
    })
    .select()
    .single();
  if (wsError) return jsonError("워크스페이스 생성에 실패했습니다.", 500, wsError);

  const { error: memberError } = await supabase.from("workspace_members").insert({
    workspace_id: ws.id,
    user_id: sessionUser.id,
    display_name: sessionUser.name,
    email: sessionUser.email,
    avatar_url: sessionUser.profileImage,
  });
  if (memberError) return jsonError("워크스페이스 생성에 실패했습니다.", 500, memberError);

  const workspace = rowToWorkspace(ws as WorkspaceRow, [
    {
      user_id: sessionUser.id,
      display_name: sessionUser.name,
      email: sessionUser.email,
      avatar_url: sessionUser.profileImage,
    },
  ]);
  return NextResponse.json({ workspace }, { status: 201 });
}
