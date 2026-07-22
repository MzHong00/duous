import { NextResponse } from "next/server";

import { createServerSupabase, getSessionUser } from "@/server/common/utils/supabaseClient";

import type { NextRequest } from "next/server";
import type { RouteContext } from "@/server/common/types/routeContext";

/** 멤버 프로필 수정 요청 본문 */
interface MemberUpdateRequest {
  displayName?: string; // 표시 이름
  avatarUrl?: string; // 프로필 이미지 URL
}

/** PATCH /api/workspaces/[id]/members/[userId] — 멤버 프로필 수정 (본인만 가능) */
export async function PATCH(
  request: NextRequest,
  context: RouteContext<{ id: string; userId: string }>
) {
  const { id: workspaceId, userId } = await context.params;
  const body = (await request.json()) as MemberUpdateRequest;

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  if (sessionUser.id !== userId) return NextResponse.json({ message: "본인 프로필만 수정할 수 있습니다." }, { status: 403 });

  // update는 매칭 행이 없어도 에러를 던지지 않으므로 select로 실제 수정 여부를 확인한다
  const { data, error } = await supabase
    .from("workspace_members")
    .update({ display_name: body.displayName, avatar_url: body.avatarUrl })
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .select();
  if (error) {
    console.error("[api] 멤버 프로필 수정 실패", error);
    return NextResponse.json({ message: "멤버 프로필 수정에 실패했습니다." }, { status: 500 });
  }
  if (!data || data.length === 0) return NextResponse.json({ message: "멤버를 찾을 수 없습니다." }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}

/** DELETE /api/workspaces/[id]/members/[userId] — 워크스페이스 나가기 (본인만 가능) */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext<{ id: string; userId: string }>
) {
  const { id: workspaceId, userId } = await context.params;

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  if (sessionUser.id !== userId) return NextResponse.json({ message: "본인만 나갈 수 있습니다." }, { status: 403 });

  // delete는 매칭 행이 없어도 에러를 던지지 않으므로 select로 실제 삭제 여부를 확인한다
  const { data, error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .select();
  if (error) {
    console.error("[api] 워크스페이스 나가기 실패", error);
    return NextResponse.json({ message: "워크스페이스 나가기에 실패했습니다." }, { status: 500 });
  }
  if (!data || data.length === 0) return NextResponse.json({ message: "멤버를 찾을 수 없습니다." }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
