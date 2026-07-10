import { queryOptions } from "@tanstack/react-query";

import { storiesApi } from "@/features/stories/api/stories";

export const storyQueries = {
  list: (workspaceId: string) =>
    queryOptions({
      queryKey: ["stories", "list", workspaceId] as const,
      queryFn: () => storiesApi.list(workspaceId),
      enabled: !!workspaceId,
    }),
};
