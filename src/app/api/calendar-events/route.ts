import { NextResponse } from "next/server";

import { createServerSupabase } from "@/server/db/supabase";
import { jsonError } from "@/server/http/response";
import { getSessionUser } from "@/server/auth/session";
import { rowToEvent } from "@/features/calendar/utils/calendarUtils";

import type { NextRequest } from "next/server";
import type { CalendarEventRow } from "@/features/calendar/utils/calendarUtils";

/** 일정 생성 요청 본문 */
interface CalendarEventCreateRequest {
  workspaceId: string; // 소속 워크스페이스 ID
  title: string; // 제목
  description?: string; // 설명
  startDate: string; // 시작일 (ISO)
  endDate: string; // 종료일 (ISO)
  startTime?: string; // 시작 시각 (HH:mm)
  endTime?: string; // 종료 시각 (HH:mm)
  isAllDay: boolean; // 종일 일정 여부
  color: string; // 표시 색상
}

/** GET /api/calendar-events?workspaceId= — 워크스페이스의 일정 목록 조회 */
export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return jsonError("workspaceId가 필요합니다.", 400);

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return jsonError("로그인이 필요합니다.", 401);

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("start_date", { ascending: true });
  if (error) return jsonError("일정 목록 조회에 실패했습니다.", 500, error);
  return NextResponse.json((data as CalendarEventRow[]).map(rowToEvent));
}

/** POST /api/calendar-events — 일정 생성 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as CalendarEventCreateRequest;
  if (!body.workspaceId || !body.title || !body.startDate || !body.endDate) {
    return jsonError("workspaceId, title, startDate, endDate는 필수입니다.", 400);
  }

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return jsonError("로그인이 필요합니다.", 401);

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      workspace_id: body.workspaceId,
      title: body.title,
      description: body.description,
      start_date: body.startDate,
      end_date: body.endDate,
      start_time: body.startTime,
      end_time: body.endTime,
      is_all_day: body.isAllDay,
      color: body.color,
    })
    .select()
    .single();
  if (error) return jsonError("일정 생성에 실패했습니다.", 500, error);
  return NextResponse.json(rowToEvent(data as CalendarEventRow), { status: 201 });
}
