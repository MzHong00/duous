import { NextResponse } from "next/server";

import { createServerSupabase, getSessionUser } from "@/server/common/utils/supabaseClient";
import { POSTGREST_ERROR_CODES } from "@/server/common/constants/codes";
import { rowToTodo } from "@/features/todo/utils/todoUtils";

import type { NextRequest } from "next/server";
import type { RouteContext } from "@/server/common/types/routeContext";
import type { TodoRow } from "@/features/todo/utils/todoUtils";

/** 할 일 수정 요청 본문 (변경할 필드만 전달) */
interface TodoUpdateRequest {
  title?: string; // 제목
  description?: string; // 설명
  isCompleted?: boolean; // 완료 여부
  assigneeId?: string; // 담당자 ID
  startDate?: string; // 시작일 (ISO)
  endDate?: string; // 종료일 (ISO)
  color?: string; // 표시 색상
}

/** PATCH /api/todos/[id] — 할 일 수정(토글 포함) */
export async function PATCH(request: NextRequest, context: RouteContext<{ id: string }>) {
  const { id } = await context.params;
  const body = (await request.json()) as TodoUpdateRequest;

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const { data, error } = await supabase
    .from("todos")
    .update({
      title: body.title,
      description: body.description,
      is_completed: body.isCompleted,
      assignee_id: body.assigneeId,
      start_date: body.startDate,
      end_date: body.endDate,
      color: body.color,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) {
    // 존재하지 않는 id를 수정하려 하면 PostgREST가 PGRST116을 던지므로 404로 구분한다
    if (error.code === POSTGREST_ERROR_CODES.NOT_FOUND) {
      console.error("[api] 할 일 조회 실패", error);
      return NextResponse.json({ message: "할 일을 찾을 수 없습니다." }, { status: 404 });
    }
    console.error("[api] 할 일 수정 실패", error);
    return NextResponse.json({ message: "할 일 수정에 실패했습니다." }, { status: 500 });
  }
  return NextResponse.json(rowToTodo(data as TodoRow));
}

/** DELETE /api/todos/[id] — 할 일 삭제 */
export async function DELETE(_request: NextRequest, context: RouteContext<{ id: string }>) {
  const { id } = await context.params;

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  // delete는 매칭 행이 없어도 에러를 던지지 않으므로 select로 실제 삭제 여부를 확인한다
  const { data, error } = await supabase.from("todos").delete().eq("id", id).select();
  if (error) {
    console.error("[api] 할 일 삭제 실패", error);
    return NextResponse.json({ message: "할 일 삭제에 실패했습니다." }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ message: "할 일을 찾을 수 없습니다." }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
