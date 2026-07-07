import { useMutation, useQueryClient } from "@tanstack/react-query";

import { storiesApi } from "@/features/stories/api/stories";
import { storyQueries } from "@/features/stories/queries/storyQueries";

import type { Story } from "@/features/stories/types/story";

export const useCreateStoryMutation = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (story: Omit<Story, "id">) => storiesApi.create(story),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: storyQueries.list(workspaceId).queryKey }),
  });
};

export const useUpdateStoryMutation = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<Story, "title" | "description" | "thumbnailUrl" | "path" | "pathColor">>;
    }) => storiesApi.update(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: storyQueries.list(workspaceId).queryKey }),
  });
};

export const useDeleteStoryMutation = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => storiesApi.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: storyQueries.list(workspaceId).queryKey }),
  });
};
