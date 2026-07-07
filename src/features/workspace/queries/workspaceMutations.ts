import { useMutation, useQueryClient } from "@tanstack/react-query";

import { workspacesApi } from "@/features/workspace/api/workspaces";
import type { User } from "@/types/user";
import type { RoomType } from "@/features/workspace/types/workspace";
import { workspaceQueries } from "./workspaceQueries";

export const useCreateWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      type,
      startDate,
      user,
    }: {
      name: string;
      type: RoomType;
      startDate?: string;
      user: { id: string; name: string; email?: string; profileImage?: string };
    }) => workspacesApi.create(name, type, startDate, user),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workspaceQueries.mine().queryKey }),
  });
};

export const useJoinWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, user }: { workspaceId: string; user: User }) =>
      workspacesApi.join(workspaceId, user),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workspaceQueries.mine().queryKey }),
  });
};

export const useUpdateWorkspaceNameMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, name }: { workspaceId: string; name: string }) =>
      workspacesApi.updateName(workspaceId, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workspaceQueries.mine().queryKey }),
  });
};

export const useUpdateWorkspaceStartDateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, startDate }: { workspaceId: string; startDate: string }) =>
      workspacesApi.updateStartDate(workspaceId, startDate),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workspaceQueries.mine().queryKey }),
  });
};

export const useUpdateWorkspaceMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      workspaceId,
      userId,
      updates,
    }: {
      workspaceId: string;
      userId: string;
      updates: { display_name?: string; avatar_url?: string };
    }) => workspacesApi.updateMember(workspaceId, userId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workspaceQueries.mine().queryKey }),
  });
};

export const useUpdateWorkspaceBackgroundMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, imageUrl }: { workspaceId: string; imageUrl: string }) =>
      workspacesApi.updateBackground(workspaceId, imageUrl),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workspaceQueries.mine().queryKey }),
  });
};

export const useCreateInviteCodeMutation = () =>
  useMutation({
    mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
      workspacesApi.createInviteCode(workspaceId, userId),
  });

export const useLeaveWorkspaceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
      workspacesApi.leave(workspaceId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workspaceQueries.mine().queryKey }),
  });
};
