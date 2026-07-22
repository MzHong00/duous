import { NextResponse } from "next/server";

import { createServerSupabase, getSessionUser } from "@/server/common/utils/supabaseClient";
import { rowToStory } from "@/features/stories/utils/storyUtils";

import type { NextRequest } from "next/server";
import type { StoryRow } from "@/features/stories/utils/storyUtils";
import type { Story } from "@/features/stories/types/story";

/** 스토리 생성 요청 본문 (userId는 세션에서 확정하므로 무시된다) */
type StoryCreateRequest = Omit<Story, "id">;

/** GET /api/stories?workspaceId= — 워크스페이스의 스토리 목록 조회 */
export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return NextResponse.json({ message: "workspaceId가 필요합니다." }, { status: 400 });

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("date", { ascending: false });
  if (error) {
    console.error("[api] 스토리 목록 조회 실패", error);
    return NextResponse.json({ message: "스토리 목록 조회에 실패했습니다." }, { status: 500 });
  }
  return NextResponse.json((data as StoryRow[]).map(rowToStory));
}

/** POST /api/stories — 스토리 생성 (작성자는 세션 사용자로 확정) */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as StoryCreateRequest;
  if (!body.workspaceId || !body.title || !body.date) {
    return NextResponse.json({ message: "workspaceId, title, date는 필수입니다." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const { data, error } = await supabase
    .from("stories")
    .insert({
      workspace_id: body.workspaceId,
      user_id: sessionUser.id,
      title: body.title,
      description: body.description,
      date: body.date,
      thumbnail_url: body.thumbnailUrl,
      path: body.path,
      path_color: body.pathColor,
    })
    .select()
    .single();
  if (error) {
    console.error("[api] 스토리 생성 실패", error);
    return NextResponse.json({ message: "스토리 생성에 실패했습니다." }, { status: 500 });
  }
  return NextResponse.json(rowToStory(data as StoryRow), { status: 201 });
}
