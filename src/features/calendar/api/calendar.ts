import { supabase } from "@/lib/supabase/client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CalendarEvent, CreateEventData } from "@/features/calendar/types/calendar";

interface CalendarEventRow {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  is_all_day: boolean;
  color: string;
  created_at: string;
}

const rowToEvent = (row: CalendarEventRow): CalendarEvent => ({
  id: row.id,
  workspaceId: row.workspace_id,
  title: row.title,
  description: row.description,
  startDate: row.start_date,
  endDate: row.end_date,
  startTime: row.start_time,
  endTime: row.end_time,
  isAllDay: row.is_all_day,
  color: row.color,
  createdAt: row.created_at,
});

export const calendarApi = {
  // client 미지정 시 브라우저 클라이언트 사용 — 서버 prefetch에서는 서버 클라이언트 주입
  list: async (
    workspaceId: string,
    client: SupabaseClient = supabase
  ): Promise<CalendarEvent[]> => {
    const { data, error } = await client
      .from("calendar_events")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("start_date", { ascending: true });
    if (error) throw error;
    return (data as CalendarEventRow[]).map(rowToEvent);
  },

  create: async (eventData: CreateEventData): Promise<CalendarEvent> => {
    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        workspace_id: eventData.workspaceId,
        title: eventData.title,
        description: eventData.description,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        is_all_day: eventData.isAllDay,
        color: eventData.color,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToEvent(data as CalendarEventRow);
  },

  update: async (
    id: string,
    updates: Partial<Omit<CalendarEvent, "id" | "workspaceId" | "createdAt">>
  ): Promise<CalendarEvent> => {
    const { data, error } = await supabase
      .from("calendar_events")
      .update({
        title: updates.title,
        description: updates.description,
        start_date: updates.startDate,
        end_date: updates.endDate,
        start_time: updates.startTime,
        end_time: updates.endTime,
        is_all_day: updates.isAllDay,
        color: updates.color,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return rowToEvent(data as CalendarEventRow);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("calendar_events").delete().eq("id", id);
    if (error) throw error;
  },
};
