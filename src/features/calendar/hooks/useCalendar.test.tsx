import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useTodoToggle } from "@/features/todo/hooks/useTodoToggle";
import { calendarQueries } from "@/features/calendar/queries/calendarQueries";
import { todoQueries } from "@/features/todo/queries/todoQueries";
import { getTodayDateString } from "@/utils/date";
import { useCalendar } from "./useCalendar";

import type { CalendarEvent } from "@/features/calendar/types/calendar";
import type { Todo } from "@/features/todo/types/todo";
import type { ReactNode } from "react";

vi.mock("@/features/workspace/hooks/useCurrentWorkspace", () => ({
  useCurrentWorkspace: vi.fn(),
}));

vi.mock("@/hooks/useQueryParams", () => ({
  useQueryParams: vi.fn(),
}));

vi.mock("@/features/todo/hooks/useTodoToggle", () => ({
  useTodoToggle: vi.fn(),
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

describe("useCalendar", () => {
  const today = getTodayDateString();
  const toggleTodo = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCurrentWorkspace).mockReturnValue({
      currentWorkspace: { id: "ws-1", name: "워크스페이스1", type: "couple", themeColor: "blue" },
      workspaces: [],
    } as unknown as ReturnType<typeof useCurrentWorkspace>);
    vi.mocked(useTodoToggle).mockReturnValue({
      toggleTodo,
      pendingToggleIds: new Set(),
    } as unknown as ReturnType<typeof useTodoToggle>);
  });

  it("URL 쿼리에 date가 없으면 오늘 날짜를 선택일로 사용한다", () => {
    const setParams = { set: vi.fn(), toggle: vi.fn(), delete: vi.fn() };
    vi.mocked(useQueryParams).mockReturnValue([
      new URLSearchParams(),
      setParams,
    ] as unknown as ReturnType<typeof useQueryParams>);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useCalendar(), { wrapper: Wrapper });

    expect(result.current.selectedDate).toBe(today);
    expect(result.current.currentMonth).toBe(today.substring(0, 7));
  });

  it("selectDate 호출 시 선택일/필터를 갱신하고 URL 쿼리에 반영한다", () => {
    const setParams = { set: vi.fn(), toggle: vi.fn(), delete: vi.fn() };
    vi.mocked(useQueryParams).mockReturnValue([
      new URLSearchParams(`date=${today}`),
      setParams,
    ] as unknown as ReturnType<typeof useQueryParams>);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useCalendar(), { wrapper: Wrapper });

    act(() => {
      result.current.selectDate("2026-08-15");
    });

    expect(result.current.selectedDate).toBe("2026-08-15");
    expect(result.current.filter).toBe("all");
    expect(setParams.set).toHaveBeenCalledWith("date", "2026-08-15");
  });

  it("URL의 date가 외부 요인(뒤로가기 등)으로 바뀌면 선택일/월을 그 값으로 되돌린다", () => {
    const setParams = { set: vi.fn(), toggle: vi.fn(), delete: vi.fn() };
    let search = `date=${today}`;
    vi.mocked(useQueryParams).mockImplementation(
      () => [new URLSearchParams(search), setParams] as unknown as ReturnType<typeof useQueryParams>
    );
    const { Wrapper } = createWrapper();

    const { result, rerender } = renderHook(() => useCalendar(), { wrapper: Wrapper });
    expect(result.current.selectedDate).toBe(today);

    search = "date=2026-01-05";
    rerender();

    expect(result.current.selectedDate).toBe("2026-01-05");
    expect(result.current.currentMonth).toBe("2026-01");
  });

  it("moveMonth 호출 시 표시 월을 delta만큼 이동한다", () => {
    const setParams = { set: vi.fn(), toggle: vi.fn(), delete: vi.fn() };
    vi.mocked(useQueryParams).mockReturnValue([
      new URLSearchParams("date=2026-03-10"),
      setParams,
    ] as unknown as ReturnType<typeof useQueryParams>);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useCalendar(), { wrapper: Wrapper });

    act(() => {
      result.current.moveMonth(1);
    });

    expect(result.current.currentMonth).toBe("2026-04");
  });

  it("선택일이 기간에 포함되는 할 일만 selectedDateTodos로 반환한다", () => {
    const setParams = { set: vi.fn(), toggle: vi.fn(), delete: vi.fn() };
    vi.mocked(useQueryParams).mockReturnValue([
      new URLSearchParams(`date=${today}`),
      setParams,
    ] as unknown as ReturnType<typeof useQueryParams>);
    const { Wrapper, queryClient } = createWrapper();
    const todos = [
      { id: "1", startDate: today, endDate: today, color: "" },
      { id: "2", startDate: "2000-01-01", endDate: "2000-01-02", color: "" },
    ];
    queryClient.setQueryData(
      calendarQueries.list("ws-1").queryKey,
      [] as unknown as CalendarEvent[]
    );
    queryClient.setQueryData(todoQueries.list("ws-1").queryKey, todos as unknown as Todo[]);

    const { result } = renderHook(() => useCalendar(), { wrapper: Wrapper });

    expect(result.current.selectedDateTodos.map((t) => t.id)).toEqual(["1"]);
  });
});
