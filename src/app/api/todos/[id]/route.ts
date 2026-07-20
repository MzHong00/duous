import { NextResponse } from "next/server";

import { createServerSupabase } from "@/server/db/supabase";
import { jsonError, noContent } from "@/server/http/response";
import { getSessionUser } from "@/server/auth/session";
import { POSTGREST_ERROR_CODES } from "@/server/db/constants";
import { rowToTodo } from "@/features/todo/utils/todoUtils";

import type { NextRequest } from "next/server";
import type { RouteContext } from "@/server/http/types";
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
  if (!sessionUser) return jsonError("로그인이 필요합니다.", 401);

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
      return jsonError("할 일을 찾을 수 없습니다.", 404, error);
    }
    return jsonError("할 일 수정에 실패했습니다.", 500, error);
  }
  return NextResponse.json(rowToTodo(data as TodoRow));
}

/** DELETE /api/todos/[id] — 할 일 삭제 */
export async function DELETE(_request: NextRequest, context: RouteContext<{ id: string }>) {
  const { id } = await context.params;

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return jsonError("로그인이 필요합니다.", 401);

  // delete는 매칭 행이 없어도 에러를 던지지 않으므로 select로 실제 삭제 여부를 확인한다
  const { data, error } = await supabase.from("todos").delete().eq("id", id).select();
  if (error) return jsonError("할 일 삭제에 실패했습니다.", 500, error);
  if (!data || data.length === 0) return jsonError("할 일을 찾을 수 없습니다.", 404);
  return noContent();
}
