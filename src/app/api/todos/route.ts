import { NextResponse } from "next/server";

import { createServerSupabase } from "@/server/db/supabase";
import { jsonError } from "@/server/http/response";
import { getSessionUser } from "@/server/auth/session";
import { rowToTodo } from "@/features/todo/utils/todoUtils";

import type { NextRequest } from "next/server";
import type { TodoRow } from "@/features/todo/utils/todoUtils";

/** 할 일 생성 요청 본문 */
interface TodoCreateRequest {
  workspaceId: string; // 소속 워크스페이스 ID
  title: string; // 제목
  description?: string; // 설명
  isCompleted: boolean; // 완료 여부
  assigneeId?: string; // 담당자 ID
  startDate: string; // 시작일 (ISO)
  endDate: string; // 종료일 (ISO)
  color?: string; // 표시 색상
}

/** GET /api/todos?workspaceId= — 워크스페이스의 할 일 목록 조회 */
export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return jsonError("workspaceId가 필요합니다.", 400);

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return jsonError("로그인이 필요합니다.", 401);

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (error) return jsonError("할 일 목록 조회에 실패했습니다.", 500, error);
  return NextResponse.json((data as TodoRow[]).map(rowToTodo));
}

/** POST /api/todos — 할 일 생성 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as TodoCreateRequest;
  if (!body.workspaceId || !body.title || !body.startDate || !body.endDate) {
    return jsonError("workspaceId, title, startDate, endDate는 필수입니다.", 400);
  }

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return jsonError("로그인이 필요합니다.", 401);

  const { data, error } = await supabase
    .from("todos")
    .insert({
      workspace_id: body.workspaceId,
      title: body.title,
      description: body.description,
      is_completed: body.isCompleted,
      assignee_id: body.assigneeId,
      start_date: body.startDate,
      end_date: body.endDate,
      color: body.color,
    })
    .select()
    .single();
  if (error) return jsonError("할 일 생성에 실패했습니다.", 500, error);
  return NextResponse.json(rowToTodo(data as TodoRow), { status: 201 });
}
