import { useMutation, useQueryClient } from "@tanstack/react-query";

import { workspacesApi } from "@/features/workspace/api/workspaces";
import type { User } from "@/shared/types/user";
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
      type: "couple" | "group";
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

export const useSendInviteMutation = () =>
  useMutation({
    mutationFn: ({
      workspaceId,
      workspaceName,
      inviteeEmail,
      userId,
    }: {
      workspaceId: string;
      workspaceName: string;
      inviteeEmail: string;
      userId: string;
    }) => workspacesApi.sendInvite(workspaceId, workspaceName, inviteeEmail, userId),
  });

export const useAcceptInviteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      inviteId,
      workspaceId,
      user,
    }: {
      inviteId: string;
      workspaceId: string;
      user: User;
    }) => workspacesApi.acceptInvite(inviteId, workspaceId, user),
    onSuccess: (_, { user }) => {
      queryClient.invalidateQueries({ queryKey: workspaceQueries.mine().queryKey });
      if (user.email) {
        queryClient.invalidateQueries({ queryKey: workspaceQueries.invites(user.email).queryKey });
      }
    },
  });
};

export const useDeclineInviteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ inviteId }: { inviteId: string; email: string }) =>
      workspacesApi.declineInvite(inviteId),
    onSuccess: (_, { email }) =>
      queryClient.invalidateQueries({ queryKey: workspaceQueries.invites(email).queryKey }),
  });
};
