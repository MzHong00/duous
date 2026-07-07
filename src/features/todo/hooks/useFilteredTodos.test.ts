import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useFilteredTodos } from "./useFilteredTodos";

import type { Todo } from "@/features/todo/types/todo";

const makeTodo = (id: string, isCompleted: boolean): Todo =>
  ({
    id,
    isCompleted,
  }) as Todo;

const todos: Todo[] = [makeTodo("1", false), makeTodo("2", true), makeTodo("3", false)];

describe("useFilteredTodos", () => {
  it("all이면 전체 목록을 그대로 반환한다", () => {
    const { result } = renderHook(() => useFilteredTodos(todos, "all"));
    expect(result.current).toEqual(todos);
  });

  it("active면 완료되지 않은 항목만 반환한다", () => {
    const { result } = renderHook(() => useFilteredTodos(todos, "active"));
    expect(result.current.map((t) => t.id)).toEqual(["1", "3"]);
  });

  it("completed면 완료된 항목만 반환한다", () => {
    const { result } = renderHook(() => useFilteredTodos(todos, "completed"));
    expect(result.current.map((t) => t.id)).toEqual(["2"]);
  });
});
