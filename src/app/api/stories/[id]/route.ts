import { NextResponse } from "next/server";

import { createServerSupabase, getSessionUser } from "@/server/common/utils/supabaseClient";
import { POSTGREST_ERROR_CODES } from "@/server/common/constants/codes";
import { rowToStory } from "@/features/stories/utils/storyUtils";

import type { NextRequest } from "next/server";
import type { RouteContext } from "@/server/common/types/routeContext";
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
  if (!sessionUser) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

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
  if (error) {
    // 존재하지 않는 id를 수정하려 하면 PostgREST가 PGRST116을 던지므로 404로 구분한다
    if (error.code === POSTGREST_ERROR_CODES.NOT_FOUND) {
      console.error("[api] 스토리 조회 실패", error);
      return NextResponse.json({ message: "스토리를 찾을 수 없습니다." }, { status: 404 });
    }
    console.error("[api] 스토리 수정 실패", error);
    return NextResponse.json({ message: "스토리 수정에 실패했습니다." }, { status: 500 });
  }
  return NextResponse.json(rowToStory(data as StoryRow));
}

/** DELETE /api/stories/[id] — 스토리 삭제 */
export async function DELETE(_request: NextRequest, context: RouteContext<{ id: string }>) {
  const { id } = await context.params;

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  // delete는 매칭 행이 없어도 에러를 던지지 않으므로 select로 실제 삭제 여부를 확인한다
  const { data, error } = await supabase.from("stories").delete().eq("id", id).select();
  if (error) {
    console.error("[api] 스토리 삭제 실패", error);
    return NextResponse.json({ message: "스토리 삭제에 실패했습니다." }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ message: "스토리를 찾을 수 없습니다." }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
