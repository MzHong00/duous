import { queryOptions } from "@tanstack/react-query";

import { workspacesApi } from "@/features/workspace/api/workspaces";

const WORKSPACE_LIST_STALE_TIME_MS = 30 * 1000; // 내 워크스페이스 목록 stale 기준 시간(ms)

export const workspaceQueries = {
  mine: () =>
    queryOptions({
      queryKey: ["workspaces", "mine"] as const,
      queryFn: () => workspacesApi.listMine(),
      staleTime: WORKSPACE_LIST_STALE_TIME_MS,
    }),

  byInviteCode: (code: string) =>
    queryOptions({
      queryKey: ["workspaces", "invite-code", code] as const,
      queryFn: () => workspacesApi.getByInviteCode(code),
      enabled: !!code,
    }),
};
