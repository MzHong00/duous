import { NextResponse } from "next/server";

import { createServerSupabase } from "@/server/db/supabase";
import { rowToWorkspace } from "@/features/workspace/utils/workspaceUtils";

import type { NextRequest } from "next/server";
import type { RouteContext } from "@/server/http/routeContext";
import type { WorkspaceRow, MemberRow } from "@/features/workspace/utils/workspaceUtils";

/** GET /api/workspace-invites/[code] — 초대 코드로 워크스페이스 조회 (만료·미존재 시 null) */
export async function GET(_request: NextRequest, context: RouteContext<{ code: string }>) {
  const { code } = await context.params;

  const supabase = await createServerSupabase();
  const { data: invite, error } = await supabase
    .from("workspace_invites")
    .select("workspace_id, expires_at")
    .eq("invite_code", code)
    .single();

  if (error || !invite) return NextResponse.json(null);
  if (new Date(invite.expires_at) < new Date()) return NextResponse.json(null);

  // 워크스페이스와 멤버 목록은 서로 독립이므로 병렬 조회
  const [wsResult, membersResult] = await Promise.all([
    supabase.from("workspaces").select("*").eq("id", invite.workspace_id).single(),
    supabase.from("workspace_members").select("*").eq("workspace_id", invite.workspace_id),
  ]);
  if (wsResult.error || !wsResult.data) return NextResponse.json(null);

  return NextResponse.json(
    rowToWorkspace(wsResult.data as WorkspaceRow, (membersResult.data ?? []) as MemberRow[])
  );
}
