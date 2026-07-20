import { NextResponse } from "next/server";

import { createServerSupabase } from "@/server/db/supabase";
import { jsonError, noContent } from "@/server/http/response";
import { getSessionUser } from "@/server/auth/session";
import { rowToStory } from "@/features/stories/utils/storyUtils";

import type { NextRequest } from "next/server";
import type { RouteContext } from "@/server/http/routeContext";
import type { StoryRow } from "@/features/stories/utils/storyUtils";
import type { Story } from "@/features/stories/types/story";

/** 스토리 수정 요청 본문 (변경할 필드만 전달) */
type StoryUpdateRequest = Partial<
  Pick<Story, "title" | "description" | "date" | "thumbnailUrl" | "path" | "pathColor">
>;

/** PATCH /api/stories/[id] — 스토리 수정 */
export async function PATCH(request: NextRequest, context: RouteContext<{ id: string }>) {
  const { id } = await context.params;
  const body = (await request.json()) as StoryUpdateRequest;

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return jsonError("로그인이 필요합니다.", 401);

  const { data, error } = await supabase
    .from("stories")
    .update({
      title: body.title,
      description: body.description,
      date: body.date,
      thumbnail_url: body.thumbnailUrl,
      path: body.path,
      path_color: body.pathColor,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) return jsonError("스토리 수정에 실패했습니다.", 500, error);
  return NextResponse.json(rowToStory(data as StoryRow));
}

/** DELETE /api/stories/[id] — 스토리 삭제 */
export async function DELETE(_request: NextRequest, context: RouteContext<{ id: string }>) {
  const { id } = await context.params;

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return jsonError("로그인이 필요합니다.", 401);

  const { error } = await supabase.from("stories").delete().eq("id", id);
  if (error) return jsonError("스토리 삭제에 실패했습니다.", 500, error);
  return noContent();
}
