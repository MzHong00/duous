import { Suspense } from "react";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { cookies } from "next/headers";

import { COOKIE_KEYS } from "@/constants/config";
import { getQueryClient } from "@/lib/getQueryClient";
import { createServerSupabase } from "@/lib/supabase/server";
import { calendarQueries } from "@/features/calendar/queries/calendarQueries";
import { todoQueries } from "@/features/todo/queries/todoQueries";
import { CalendarView } from "@/features/calendar/components/CalendarView";

export default async function Page() {
  const queryClient = getQueryClient();
  const workspaceId = (await cookies()).get(COOKIE_KEYS.WORKSPACE_ID)?.value ?? "";

  // 첫 페인트에 데이터가 실리도록 서버에서 prefetch → 클라이언트 useQuery가 이어받음
  if (workspaceId) {
    const supabase = await createServerSupabase();
    await Promise.all([
      queryClient.prefetchQuery(calendarQueries.list(workspaceId, supabase)),
      queryClient.prefetchQuery(todoQueries.list(workspaceId, supabase)),
    ]);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <CalendarView />
      </Suspense>
    </HydrationBoundary>
  );
}
