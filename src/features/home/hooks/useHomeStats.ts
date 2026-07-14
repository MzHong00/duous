"use client";
import { useQuery } from "@tanstack/react-query";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { storyQueries } from "@/features/stories/queries/storyQueries";

/** 홈 대시보드에 노출할 최근 스토리(최대 3개)를 계산하는 훅 */
export const useHomeStats = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id ?? "";

  const { data: stories = [], isLoading } = useQuery(storyQueries.list(workspaceId));

  const recentStories = stories.slice(0, 3); // 최신 스토리 최대 3개

  return { recentStories, isLoading };
};
