import { queryOptions } from "@tanstack/react-query";

import { chatApi } from "@/features/chat/api/chat";

export const chatQueries = {
  all: ["chat"] as const,

  list: (workspaceId: string, userId: string) =>
    queryOptions({
      queryKey: [...chatQueries.all, "messages", workspaceId, userId] as const,
      queryFn: () => chatApi.list(workspaceId, userId),
      enabled: !!workspaceId && !!userId,
    }),
};
