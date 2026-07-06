"use client";
import { useQuery } from "@tanstack/react-query";

import { useWorkspaceStore } from "@/features/workspace/stores/useWorkspaceStore";
import { workspaceQueries } from "@/features/workspace/queries/workspaceQueries";

/**
 * 서버의 워크스페이스 목록(mine)과 클라이언트의 currentWorkspaceId를 결합해
 * 현재 워크스페이스를 파생한다. 저장된 ID가 목록에 없으면 첫 워크스페이스로 폴백한다.
 */
export const useCurrentWorkspace = () => {
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const { data: workspaces, isPending, isError } = useQuery(workspaceQueries.mine());

  const list = workspaces ?? [];
  const currentWorkspace = list.find((ws) => ws.id === currentWorkspaceId) ?? list[0] ?? null;

  return { currentWorkspace, workspaces: list, isPending, isError };
};
