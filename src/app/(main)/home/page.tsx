import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { cookies } from "next/headers";

import { COOKIE_KEYS } from "@/constants/config";
import { getQueryClient } from "@/lib/getQueryClient";
import { createServerSupabase } from "@/lib/supabase/server";
import { authQueries } from "@/features/auth/queries/authQueries";
import { calendarQueries } from "@/features/calendar/queries/calendarQueries";
import { todoQueries } from "@/features/todo/queries/todoQueries";
import { HomeView } from "@/features/home/components/HomeView";
import { PAGE_TITLES } from "@/constants/seo";

export const metadata: Metadata = { title: PAGE_TITLES.HOME };

export default async function Page() {
  const queryClient = getQueryClient();
  const supabase = await createServerSupabase();
  const workspaceId = (await cookies()).get(COOKIE_KEYS.WORKSPACE_ID)?.value ?? "";

  // 첫 페인트에 데이터가 실리도록 서버에서 prefetch → 클라이언트 useQuery가 이어받음
  await Promise.all([
    queryClient.prefetchQuery(authQueries.user(supabase)),
    ...(workspaceId
      ? [
          queryClient.prefetchQuery(calendarQueries.list(workspaceId, supabase)),
          queryClient.prefetchQuery(todoQueries.list(workspaceId, supabase)),
        ]
      : []),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeView />
    </HydrationBoundary>
  );
}
