import { queryOptions } from "@tanstack/react-query";

import { authApi } from "@/features/auth/api/auth";

export const authQueries = {
  user: () =>
    queryOptions({
      queryKey: ["auth", "user"] as const,
      queryFn: () => authApi.getUser(),
      staleTime: 5 * 60 * 1000,
    }),
};
