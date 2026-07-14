import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { todosApi } from "@/features/todo/api/todos";
import { useTodoToggle } from "./useTodoToggle";

import type { ReactNode } from "react";
import type { Todo } from "@/features/todo/types/todo";

vi.mock("@/features/todo/api/todos", () => ({
  todosApi: { toggle: vi.fn() },
}));

vi.mock("@/stores/useToastStore", () => ({
  toastActions: { showToast: vi.fn() },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

const TODOS: Todo[] = [
  {
    id: "todo-1",
    workspaceId: "workspace-1",
    title: "첫 번째 할 일",
    isCompleted: false,
    startDate: "2026-07-01",
    endDate: "2026-07-01",
    createdAt: "2026-07-01",
  },
  {
    id: "todo-2",
    workspaceId: "workspace-1",
    title: "두 번째 할 일",
    isCompleted: false,
    startDate: "2026-07-01",
    endDate: "2026-07-01",
    createdAt: "2026-07-01",
  },
];

describe("useTodoToggle", () => {
  afterEach(() => {
    vi.mocked(todosApi.toggle).mockReset();
  });

  it("토글 진행 중인 항목만 pendingToggleIds에 포함한다", async () => {
    let resolveToggle: (() => void) | undefined;
    vi.mocked(todosApi.toggle).mockReturnValueOnce(
      new Promise<Todo>((resolve) => {
        resolveToggle = () => resolve(TODOS[0]);
      })
    );

    const { result } = renderHook(() => useTodoToggle("workspace-1", TODOS), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.toggleTodo("todo-1");
    });

    expect(result.current.pendingToggleIds.has("todo-1")).toBe(true);
    expect(result.current.pendingToggleIds.has("todo-2")).toBe(false);

    resolveToggle?.();
    await waitFor(() => expect(result.current.pendingToggleIds.has("todo-1")).toBe(false));
  });

  it("이미 처리 중인 항목에 대한 중복 클릭은 무시한다", async () => {
    vi.mocked(todosApi.toggle).mockReturnValueOnce(new Promise<Todo>(() => {}));

    const { result } = renderHook(() => useTodoToggle("workspace-1", TODOS), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.toggleTodo("todo-1");
    });
    act(() => {
      result.current.toggleTodo("todo-1");
    });

    await waitFor(() => expect(todosApi.toggle).toHaveBeenCalledTimes(1));
  });

  it("처리 중이 아닌 다른 항목은 즉시 토글할 수 있다", async () => {
    vi.mocked(todosApi.toggle).mockReturnValue(new Promise<Todo>(() => {}));

    const { result } = renderHook(() => useTodoToggle("workspace-1", TODOS), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.toggleTodo("todo-1");
    });
    act(() => {
      result.current.toggleTodo("todo-2");
    });

    await waitFor(() => expect(todosApi.toggle).toHaveBeenCalledTimes(2));
    expect(result.current.pendingToggleIds.has("todo-1")).toBe(true);
    expect(result.current.pendingToggleIds.has("todo-2")).toBe(true);
  });
});
