import { useMemo } from "react";

import type { Todo } from "@/features/todo/types/todo";

// 할 일 목록 필터 타입. 페이지에서 URL 쿼리스트링으로 관리한다.
export type Filter = "all" | "active" | "completed";

/** 필터 값에 따라 표시할 할 일 목록을 메모이즈해 반환한다 */
export const useFilteredTodos = (todos: Todo[], filter: Filter): Todo[] =>
  useMemo(() => {
    if (filter === "active") return todos.filter((todo) => !todo.isCompleted);
    if (filter === "completed") return todos.filter((todo) => todo.isCompleted);
    return todos;
  }, [todos, filter]);
