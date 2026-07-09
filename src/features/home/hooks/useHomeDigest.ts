"use client";
import { useQuery } from "@tanstack/react-query";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { calendarQueries } from "@/features/calendar/queries/calendarQueries";
import { todoQueries } from "@/features/todo/queries/todoQueries";
import { getTodayDateString } from "@/utils/date";

const UPCOMING_EVENT_DISPLAY_COUNT = 3; // 홈 다이제스트에 노출할 다가오는 일정 최대 개수
const TODAY_TODO_DISPLAY_COUNT = 3; // 홈 다이제스트에 노출할 오늘 할 일 최대 개수

/**
 * 홈 다이제스트 카드에 노출할 요약 데이터를 계산하는 훅.
 * 다가오는 일정(오늘 포함 진행·예정, 임박순 상위 N개)과 오늘 할 일(미완료, 상위 N개)을 반환한다.
 */
export const useHomeDigest = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id ?? "";

  const { data: events = [] } = useQuery(calendarQueries.list(workspaceId));
  const { data: todos = [] } = useQuery(todoQueries.list(workspaceId));

  const today = getTodayDateString();

  // 아직 끝나지 않은 일정을 시작일 임박순으로 정렬해 상위 N개만 노출
  const upcomingEvents = events
    .filter((event) => event.endDate.slice(0, 10) >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, UPCOMING_EVENT_DISPLAY_COUNT);

  // 오늘이 기간에 포함된 미완료 할 일 전체 (노출은 상위 N개, 카운트는 전체)
  const todayTodos = todos.filter(
    (todo) =>
      !todo.isCompleted &&
      todo.startDate.slice(0, 10) <= today &&
      todo.endDate.slice(0, 10) >= today
  );

  return {
    upcomingEvents,
    todayTodos: todayTodos.slice(0, TODAY_TODO_DISPLAY_COUNT),
    todayTodoTotal: todayTodos.length, // 오늘 할 일 전체 개수 (더보기 카운트용)
  };
};
