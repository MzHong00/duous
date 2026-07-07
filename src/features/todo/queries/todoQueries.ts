import { queryOptions } from "@tanstack/react-query";

import { todosApi } from "@/features/todo/api/todos";

import type { SupabaseClient } from "@supabase/supabase-js";

export const todoQueries = {
  // client는 서버 prefetch 시에만 주입 — 클라이언트에서는 생략(브라우저 클라이언트 사용)
  list: (workspaceId: string, client?: SupabaseClient) =>
    queryOptions({
      queryKey: ["todos", "list", workspaceId] as const,
      queryFn: () => todosApi.list(workspaceId, client),
      enabled: !!workspaceId,
    }),
};
