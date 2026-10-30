import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useFilteredTodos } from "./useFilteredTodos";

import type { Todo } from "@/features/todo/types/todo";

const makeTodo = (id: string, isCompleted: boolean, endDate: string): Todo =>
  ({
    id,
    isCompleted,
    endDate,
  }) as Todo;

const todos: Todo[] = [
  makeTodo("1", false, "2026-07-10"),
  makeTodo("2", true, "2026-07-05"),
  makeTodo("3", false, "2026-07-08"),
  makeTodo("4", true, "2026-07-09"),
];

describe("useFilteredTodos", () => {
  it("all이면 미완료(마감 임박순) 다음 완료(최근 완료순) 항목을 반환한다", () => {
    const { result } = renderHook(() => useFilteredTodos(todos, "all"));
    expect(result.current.map((t) => t.id)).toEqual(["3", "1", "4", "2"]);
  });

  it("active면 완료되지 않은 항목만 마감 임박순으로 반환한다", () => {
    const { result } = renderHook(() => useFilteredTodos(todos, "active"));
    expect(result.current.map((t) => t.id)).toEqual(["3", "1"]);
  });

  it("completed면 완료된 항목만 최근 완료순으로 반환한다", () => {
    const { result } = renderHook(() => useFilteredTodos(todos, "completed"));
    expect(result.current.map((t) => t.id)).toEqual(["4", "2"]);
  });
});
