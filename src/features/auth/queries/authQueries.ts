import { queryOptions } from "@tanstack/react-query";

import { authApi } from "@/features/auth/api/auth";

import type { SupabaseClient } from "@supabase/supabase-js";

const USER_STALE_TIME_MS = 5 * 60 * 1000; // 사용자 정보 stale 기준 시간(ms)

export const authQueries = {
  all: ["auth"] as const,
  // client는 서버 prefetch 시에만 주입 — 클라이언트에서는 생략(브라우저 클라이언트 사용)
  user: (client?: SupabaseClient) =>
    queryOptions({
      queryKey: [...authQueries.all, "user"] as const,
      queryFn: () => authApi.getUser(client),
      staleTime: USER_STALE_TIME_MS,
    }),
};
