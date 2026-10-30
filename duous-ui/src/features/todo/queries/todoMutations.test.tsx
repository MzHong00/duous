import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { todosApi } from "@/features/todo/api/todos";
import { toastActions } from "@/stores/useToastStore";
import { useToggleTodoMutation } from "./todoMutations";

import type { ReactNode } from "react";

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

describe("useToggleTodoMutation", () => {
  it("토글 실패 시 에러 토스트를 표시한다", async () => {
    vi.mocked(todosApi.toggle).mockRejectedValueOnce(new Error("network error"));

    const { result } = renderHook(() => useToggleTodoMutation("workspace-1"), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: "todo-1", isCompleted: true });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toastActions.showToast).toHaveBeenCalledWith("완료 상태 변경에 실패했습니다.", "error");
  });
});
