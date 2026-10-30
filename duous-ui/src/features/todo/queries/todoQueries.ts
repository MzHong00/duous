import { queryOptions } from "@tanstack/react-query";

import { todosApi } from "@/features/todo/api/todos";

export const todoQueries = {
  list: (workspaceId: string) =>
    queryOptions({
      queryKey: ["todos", "list", workspaceId] as const,
      queryFn: () => todosApi.list(workspaceId),
      enabled: !!workspaceId,
    }),
};
