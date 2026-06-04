import { queryOptions } from "@tanstack/react-query";

import { workspacesApi } from "@/features/workspace/api/workspaces";

export const workspaceQueries = {
  mine: () =>
    queryOptions({
      queryKey: ["workspaces", "mine"] as const,
      queryFn: () => workspacesApi.listMine(),
    }),

  invites: (email: string) =>
    queryOptions({
      queryKey: ["workspaces", "invites", email] as const,
      queryFn: () => workspacesApi.getPendingInvites(email),
      enabled: !!email,
    }),

  byInviteCode: (code: string) =>
    queryOptions({
      queryKey: ["workspaces", "invite-code", code] as const,
      queryFn: () => workspacesApi.getByInviteCode(code),
      enabled: !!code,
    }),
};
