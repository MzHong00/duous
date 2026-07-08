import { useMemo } from "react";

import type { Todo } from "@/features/todo/types/todo";

// 할 일 목록 필터 타입. 페이지에서 URL 쿼리스트링으로 관리한다.
export type Filter = "all" | "active" | "completed";

/** 마감일(endDate) 오름차순 정렬. 마감이 임박한 항목일수록 먼저 노출한다 */
const byEndDateAsc = (a: Todo, b: Todo) => (a.endDate ?? "").localeCompare(b.endDate ?? "");
/** 마감일(endDate) 내림차순 정렬. 완료 항목은 최근에 끝낸 것을 먼저 노출한다 */
const byEndDateDesc = (a: Todo, b: Todo) => (b.endDate ?? "").localeCompare(a.endDate ?? "");

/**
 * 필터 값에 따라 표시할 할 일 목록을 정렬·메모이즈해 반환한다.
 * 미완료 항목은 마감 임박순으로, 완료 항목은 최근 완료순으로 정렬해
 * 사용자가 가장 먼저 처리해야 할 일을 상단에서 바로 파악할 수 있게 한다.
 */
export const useFilteredTodos = (todos: Todo[], filter: Filter): Todo[] =>
  useMemo(() => {
    const active = todos.filter((todo) => !todo.isCompleted).sort(byEndDateAsc);
    const completed = todos.filter((todo) => todo.isCompleted).sort(byEndDateDesc);

    if (filter === "active") return active;
    if (filter === "completed") return completed;
    return [...active, ...completed];
  }, [todos, filter]);
