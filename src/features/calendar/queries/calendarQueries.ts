import { queryOptions } from "@tanstack/react-query";

import { calendarApi } from "@/features/calendar/api/calendar";

export const calendarQueries = {
  list: (workspaceId: string) =>
    queryOptions({
      queryKey: ["calendar", "list", workspaceId] as const,
      queryFn: () => calendarApi.list(workspaceId),
      enabled: !!workspaceId,
    }),
};
