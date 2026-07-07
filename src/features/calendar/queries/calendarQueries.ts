import { queryOptions } from "@tanstack/react-query";

import { calendarApi } from "@/features/calendar/api/calendar";

import type { SupabaseClient } from "@supabase/supabase-js";

export const calendarQueries = {
  // client는 서버 prefetch 시에만 주입 — 클라이언트에서는 생략(브라우저 클라이언트 사용)
  list: (workspaceId: string, client?: SupabaseClient) =>
    queryOptions({
      queryKey: ["calendar", "list", workspaceId] as const,
      queryFn: () => calendarApi.list(workspaceId, client),
      enabled: !!workspaceId,
    }),
};
