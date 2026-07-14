import { describe, expect, it } from "vitest";

import { rowToTodo } from "@/features/todo/utils/todoUtils";

import type { TodoRow } from "@/features/todo/utils/todoUtils";

describe("rowToTodo", () => {
  it("Supabase row를 Todo 타입으로 변환한다", () => {
    const row: TodoRow = {
      id: "todo-1",
      workspace_id: "ws-1",
      title: "장보기",
      description: "우유 사기",
      is_completed: false,
      assignee_id: "user-1",
      start_date: "2026-07-01",
      end_date: "2026-07-02",
      color: "#ff0000",
      created_at: "2026-06-30T00:00:00.000Z",
    };

    expect(rowToTodo(row)).toEqual({
      id: "todo-1",
      workspaceId: "ws-1",
      title: "장보기",
      description: "우유 사기",
      isCompleted: false,
      assigneeId: "user-1",
      startDate: "2026-07-01",
      endDate: "2026-07-02",
      color: "#ff0000",
      createdAt: "2026-06-30T00:00:00.000Z",
    });
  });

  it("옵셔널 필드가 없으면 undefined로 매핑된다", () => {
    const row: TodoRow = {
      id: "todo-2",
      workspace_id: "ws-1",
      title: "청소",
      is_completed: true,
      start_date: "2026-07-01",
      end_date: "2026-07-01",
      created_at: "2026-06-30T00:00:00.000Z",
    };

    const todo = rowToTodo(row);

    expect(todo.description).toBeUndefined();
    expect(todo.assigneeId).toBeUndefined();
    expect(todo.color).toBeUndefined();
    expect(todo.isCompleted).toBe(true);
  });
});
