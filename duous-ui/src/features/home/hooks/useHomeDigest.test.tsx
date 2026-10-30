import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { calendarQueries } from "@/features/calendar/queries/calendarQueries";
import { todoQueries } from "@/features/todo/queries/todoQueries";
import { getTodayDateString } from "@/utils/date";
import { useHomeDigest } from "./useHomeDigest";

import type { CalendarEvent } from "@/features/calendar/types/calendar";
import type { Todo } from "@/features/todo/types/todo";
import type { ReactNode } from "react";

vi.mock("@/features/workspace/hooks/useCurrentWorkspace", () => ({
  useCurrentWorkspace: vi.fn(),
}));

vi.mock("@/features/calendar/queries/calendarQueries", () => ({
  calendarQueries: {
    list: vi.fn((workspaceId: string) => ({ queryKey: ["calendar", "list", workspaceId] })),
  },
}));

vi.mock("@/features/todo/queries/todoQueries", () => ({
  todoQueries: {
    list: vi.fn((workspaceId: string) => ({ queryKey: ["todos", "list", workspaceId] })),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { Wrapper, queryClient };
};

describe("useHomeDigest", () => {
  const today = getTodayDateString();

  it("종료되지 않은 일정을 시작일 임박순으로 상위 3개만 반환한다", () => {
    vi.mocked(useCurrentWorkspace).mockReturnValue({
      currentWorkspace: { id: "ws-1", name: "워크스페이스1", type: "couple", themeColor: "blue" },
      workspaces: [],
    } as unknown as ReturnType<typeof useCurrentWorkspace>);
    const { Wrapper, queryClient } = createWrapper();
    const events = [
      { id: "1", startDate: `${today}T05:00:00`, endDate: `${today}T10:00:00` },
      { id: "2", startDate: "2000-01-01T00:00:00", endDate: "2000-01-02T00:00:00" }, // 과거 종료 → 제외
      { id: "3", startDate: `${today}T01:00:00`, endDate: `${today}T23:00:00` },
      { id: "4", startDate: "2999-01-01T00:00:00", endDate: "2999-01-02T00:00:00" },
      { id: "5", startDate: "2999-02-01T00:00:00", endDate: "2999-02-02T00:00:00" },
    ];
    queryClient.setQueryData(
      calendarQueries.list("ws-1").queryKey,
      events as unknown as CalendarEvent[]
    );
    queryClient.setQueryData(todoQueries.list("ws-1").queryKey, [] as unknown as Todo[]);

    const { result } = renderHook(() => useHomeDigest(), { wrapper: Wrapper });

    expect(result.current.upcomingEvents.map((event) => event.id)).toEqual(["3", "1", "4"]);
  });

  it("오늘이 기간에 포함된 미완료 할 일만 반환하고 노출은 상위 3개로 제한한다", () => {
    vi.mocked(useCurrentWorkspace).mockReturnValue({
      currentWorkspace: { id: "ws-1", name: "워크스페이스1", type: "couple", themeColor: "blue" },
      workspaces: [],
    } as unknown as ReturnType<typeof useCurrentWorkspace>);
    const { Wrapper, queryClient } = createWrapper();
    const todos = [
      { id: "1", isCompleted: false, startDate: today, endDate: today },
      { id: "2", isCompleted: true, startDate: today, endDate: today }, // 완료 → 제외
      { id: "3", isCompleted: false, startDate: "2000-01-01", endDate: "2000-01-02" }, // 기간 밖 → 제외
      { id: "4", isCompleted: false, startDate: today, endDate: today },
      { id: "5", isCompleted: false, startDate: today, endDate: today },
      { id: "6", isCompleted: false, startDate: today, endDate: today },
    ];
    queryClient.setQueryData(
      calendarQueries.list("ws-1").queryKey,
      [] as unknown as CalendarEvent[]
    );
    queryClient.setQueryData(todoQueries.list("ws-1").queryKey, todos as unknown as Todo[]);

    const { result } = renderHook(() => useHomeDigest(), { wrapper: Wrapper });

    expect(result.current.todayTodos.map((todo) => todo.id)).toEqual(["1", "4", "5"]);
    expect(result.current.todayTodoTotal).toBe(4);
  });

  it("워크스페이스가 없으면 빈 결과를 반환한다", () => {
    vi.mocked(useCurrentWorkspace).mockReturnValue({
      currentWorkspace: null,
      workspaces: [],
    } as unknown as ReturnType<typeof useCurrentWorkspace>);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useHomeDigest(), { wrapper: Wrapper });

    expect(result.current.upcomingEvents).toEqual([]);
    expect(result.current.todayTodos).toEqual([]);
    expect(result.current.todayTodoTotal).toBe(0);
  });
});
