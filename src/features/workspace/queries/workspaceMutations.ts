import { useMutation, useQueryClient } from "@tanstack/react-query";

import { workspacesApi } from "@/features/workspace/api/workspaces";
import { workspaceQueries } from "@/features/workspace/queries/workspaceQueries";

import type { User } from "@/types/user";
import type { RoomType, ThemeColor } from "@/features/workspace/types/workspace";

/** 성공 시 내 워크스페이스 목록(mine) 쿼리를 무효화하는 공통 뮤테이션 헬퍼 */
const useInvalidateMineMutation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workspaceQueries.mine().queryKey }),
  });
};

export const useCreateWorkspaceMutation = () =>
  useInvalidateMineMutation(
    ({
      name,
      type,
      startDate,
      user,
    }: {
      name: string;
      type: RoomType;
      startDate?: string;
      user: User;
    }) => workspacesApi.create(name, type, startDate, user)
  );

export const useJoinWorkspaceMutation = () =>
  useInvalidateMineMutation(({ workspaceId, user }: { workspaceId: string; user: User }) =>
    workspacesApi.join(workspaceId, user)
  );

export const useUpdateWorkspaceNameMutation = () =>
  useInvalidateMineMutation(({ workspaceId, name }: { workspaceId: string; name: string }) =>
    workspacesApi.updateName(workspaceId, name)
  );

export const useUpdateWorkspaceStartDateMutation = () =>
  useInvalidateMineMutation(
    ({ workspaceId, startDate }: { workspaceId: string; startDate: string }) =>
      workspacesApi.updateStartDate(workspaceId, startDate)
  );

export const useUpdateWorkspaceThemeMutation = () =>
  useInvalidateMineMutation(
    ({ workspaceId, themeColor }: { workspaceId: string; themeColor: ThemeColor }) =>
      workspacesApi.updateThemeColor(workspaceId, themeColor)
  );

export const useUpdateWorkspaceMemberMutation = () =>
  useInvalidateMineMutation(
    ({
      workspaceId,
      userId,
      updates,
    }: {
      workspaceId: string;
      userId: string;
      updates: { display_name?: string; avatar_url?: string };
    }) => workspacesApi.updateMember(workspaceId, userId, updates)
  );

export const useUpdateWorkspaceBackgroundMutation = () =>
  useInvalidateMineMutation(
    ({ workspaceId, imageUrl }: { workspaceId: string; imageUrl: string }) =>
      workspacesApi.updateBackground(workspaceId, imageUrl)
  );

export const useCreateInviteCodeMutation = () =>
  useMutation({
    mutationFn: ({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
      workspacesApi.createInviteCode(workspaceId, userId),
  });

export const useLeaveWorkspaceMutation = () =>
  useInvalidateMineMutation(({ workspaceId, userId }: { workspaceId: string; userId: string }) =>
    workspacesApi.leave(workspaceId, userId)
  );
