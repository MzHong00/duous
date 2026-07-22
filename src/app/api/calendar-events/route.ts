import { NextResponse } from "next/server";

import { createServerSupabase, getSessionUser } from "@/server/common/utils/supabaseClient";
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
  if (!workspaceId) return NextResponse.json({ message: "workspaceId가 필요합니다." }, { status: 400 });

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("start_date", { ascending: true });
  if (error) {
    console.error("[api] 일정 목록 조회 실패", error);
    return NextResponse.json({ message: "일정 목록 조회에 실패했습니다." }, { status: 500 });
  }
  return NextResponse.json((data as CalendarEventRow[]).map(rowToEvent));
}

/** POST /api/calendar-events — 일정 생성 */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as CalendarEventCreateRequest;
  if (!body.workspaceId || !body.title || !body.startDate || !body.endDate) {
    return NextResponse.json(
      { message: "workspaceId, title, startDate, endDate는 필수입니다." },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabase();
  const sessionUser = await getSessionUser(supabase);
  if (!sessionUser) return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });

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
  if (error) {
    console.error("[api] 일정 생성 실패", error);
    return NextResponse.json({ message: "일정 생성에 실패했습니다." }, { status: 500 });
  }
  return NextResponse.json(rowToEvent(data as CalendarEventRow), { status: 201 });
}
