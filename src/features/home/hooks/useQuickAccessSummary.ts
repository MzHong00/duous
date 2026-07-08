"use client";
import { useQuery } from "@tanstack/react-query";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { calendarQueries } from "@/features/calendar/queries/calendarQueries";
import { todoQueries } from "@/features/todo/queries/todoQueries";
import { getTodayDateString, isThisMonth } from "@/utils/date";

/**
 * 홈 퀵 액션 카드(캘린더·할 일)에 노출할 실데이터 요약 카운트를 계산하는 훅.
 * 채팅은 안읽음 개수를 집계할 스키마가 아직 없어 요약값을 제공하지 않는다.
 */
export const useQuickAccessSummary = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id ?? "";

  const { data: events = [] } = useQuery(calendarQueries.list(workspaceId));
  const { data: todos = [] } = useQuery(todoQueries.list(workspaceId));

  const today = getTodayDateString();

  const monthlyEventCount = events.filter((event) => isThisMonth(event.startDate)).length; // 이번 달 일정 수
  // 오늘 진행 중인(오늘이 기간에 포함된) 미완료 할 일 수
  const todayTodoCount = todos.filter(
    (todo) =>
      !todo.isCompleted &&
      todo.startDate.slice(0, 10) <= today &&
      todo.endDate.slice(0, 10) >= today
  ).length;

  return { monthlyEventCount, todayTodoCount };
};
