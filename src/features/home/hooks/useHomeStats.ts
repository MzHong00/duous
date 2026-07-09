"use client";
import { useQuery } from "@tanstack/react-query";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { storyQueries } from "@/features/stories/queries/storyQueries";
import { todoQueries } from "@/features/todo/queries/todoQueries";
import { isThisMonth } from "@/utils/date";

import type { Story } from "@/features/stories/types/story";

/**
 * 홈 대시보드 통계 카드에 노출할 이번 달 활동 요약과 최근 스토리를 계산하는 훅.
 * 이번 달 등록된 스토리 수 · 진행 중인 할 일 수 · 가장 최근 스토리를 반환한다.
 */
export const useHomeStats = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id ?? "";

  const { data: stories = [] } = useQuery(storyQueries.list(workspaceId));
  const { data: todos = [] } = useQuery(todoQueries.list(workspaceId));

  const monthlyStoryCount = stories.filter((story) => isThisMonth(story.date)).length;
  const activeTodoCount = todos.filter((todo) => !todo.isCompleted).length;
  const recentStories = stories.slice(0, 3); // 최신 스토리 최대 3개

  return { monthlyStoryCount, activeTodoCount, recentStories };
};
