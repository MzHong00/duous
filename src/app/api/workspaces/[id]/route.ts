import { createServerSupabase } from "@/server/db/supabase";
import { jsonError, noContent } from "@/server/http/response";
import { getSessionUser } from "@/server/auth/session";

import type { NextRequest } from "next/server";
import type { RouteContext } from "@/server/http/routeContext";
import type { ThemeColor } from "@/features/workspace/types/workspace";

/** 워크스페이스 수정 요청 본문 (변경할 필드만 전달) */
interface WorkspaceUpdateRequest {
  name?: string; // 워크스페이스 이름
  startDate?: string; // 시작일 (ISO)
  themeColor?: ThemeColor; // 테마 색상
}

/** PATCH /api/workspaces/[id] — 워크스페이스 이름/시작일/테마 색상 수정 */
export async function PATCH(request: NextRequest, context: RouteContext<{ id: string }>) {
  const { id } = await context.params;
  const body = (await request.json()) as WorkspaceUpdateRequest;

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return jsonError("로그인이 필요합니다.", 401);

  const { error } = await supabase
    .from("workspaces")
    .update({
      name: body.name,
      start_date: body.startDate,
      theme_color: body.themeColor,
    })
    .eq("id", id);
  if (error) return jsonError("워크스페이스 수정에 실패했습니다.", 500, error);
  return noContent();
}
