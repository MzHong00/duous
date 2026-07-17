import { describe, expect, it, vi } from "vitest";

import { calendarApi } from "@/features/calendar/api/calendar";

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockSingle = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

const eventRow = {
  id: "event-1",
  workspace_id: "workspace-1",
  title: "생일",
  description: "설명",
  start_date: "2026-07-01",
  end_date: "2026-07-02",
  start_time: "10:00",
  end_time: "11:00",
  is_all_day: false,
  color: "#fff",
  created_at: "2026-07-01T00:00:00Z",
};

describe("calendarApi.list", () => {
  it("workspaceId로 필터링해 start_date 오름차순으로 조회하고 CalendarEvent로 변환한다", async () => {
    mockOrder.mockResolvedValueOnce({ data: [eventRow], error: null });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const result = await calendarApi.list("workspace-1");

    expect(mockFrom).toHaveBeenCalledWith("calendar_events");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("workspace_id", "workspace-1");
    expect(mockOrder).toHaveBeenCalledWith("start_date", { ascending: true });
    expect(result).toEqual([
      expect.objectContaining({ id: "event-1", workspaceId: "workspace-1", title: "생일" }),
    ]);
  });

  it("조회 실패 시 에러를 throw한다", async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: new Error("list failed") });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    await expect(calendarApi.list("workspace-1")).rejects.toThrow("일정 목록 조회에 실패했습니다.");
  });
});

describe("calendarApi.create", () => {
  it("event 필드를 snake_case로 변환해 insert하고 생성된 CalendarEvent를 반환한다", async () => {
    mockSingle.mockResolvedValueOnce({ data: eventRow, error: null });
    const mockSelectAfterInsert = vi.fn().mockReturnValue({ single: mockSingle });
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockFrom.mockReturnValue({ insert: mockInsert });

    const result = await calendarApi.create({
      workspaceId: "workspace-1",
      title: "생일",
      description: "설명",
      startDate: "2026-07-01",
      endDate: "2026-07-02",
      startTime: "10:00",
      endTime: "11:00",
      isAllDay: false,
      color: "#fff",
    });

    expect(mockFrom).toHaveBeenCalledWith("calendar_events");
    expect(mockInsert).toHaveBeenCalledWith({
      workspace_id: "workspace-1",
      title: "생일",
      description: "설명",
      start_date: "2026-07-01",
      end_date: "2026-07-02",
      start_time: "10:00",
      end_time: "11:00",
      is_all_day: false,
      color: "#fff",
    });
    expect(result).toEqual(expect.objectContaining({ id: "event-1", title: "생일" }));
  });

  it("생성 실패 시 에러를 throw한다", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error("create failed") });
    const mockSelectAfterInsert = vi.fn().mockReturnValue({ single: mockSingle });
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockFrom.mockReturnValue({ insert: mockInsert });

    await expect(
      calendarApi.create({
        workspaceId: "workspace-1",
        title: "생일",
        startDate: "2026-07-01",
        endDate: "2026-07-02",
        isAllDay: false,
        color: "#fff",
      })
    ).rejects.toThrow("일정 생성에 실패했습니다.");
  });
});

describe("calendarApi.update", () => {
  it("변경된 필드를 update하고 수정된 CalendarEvent를 반환한다", async () => {
    mockSingle.mockResolvedValueOnce({ data: eventRow, error: null });
    const mockSelectAfterUpdate = vi.fn().mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ select: mockSelectAfterUpdate });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const result = await calendarApi.update("event-1", { title: "수정된 제목" });

    expect(mockFrom).toHaveBeenCalledWith("calendar_events");
    expect(mockUpdate).toHaveBeenCalledWith({
      title: "수정된 제목",
      description: undefined,
      start_date: undefined,
      end_date: undefined,
      start_time: undefined,
      end_time: undefined,
      is_all_day: undefined,
      color: undefined,
    });
    expect(mockEq).toHaveBeenCalledWith("id", "event-1");
    expect(result).toEqual(expect.objectContaining({ id: "event-1" }));
  });

  it("수정 실패 시 에러를 throw한다", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error("update failed") });
    const mockSelectAfterUpdate = vi.fn().mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ select: mockSelectAfterUpdate });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    await expect(calendarApi.update("event-1", { title: "수정된 제목" })).rejects.toThrow(
      "일정 수정에 실패했습니다."
    );
  });
});

describe("calendarApi.delete", () => {
  it("id로 delete 요청을 보낸다", async () => {
    mockEq.mockResolvedValueOnce({ error: null });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ delete: mockDelete });

    await calendarApi.delete("event-1");

    expect(mockFrom).toHaveBeenCalledWith("calendar_events");
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", "event-1");
  });

  it("삭제 실패 시 에러를 throw한다", async () => {
    mockEq.mockResolvedValueOnce({ error: new Error("delete failed") });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ delete: mockDelete });

    await expect(calendarApi.delete("event-1")).rejects.toThrow("일정 삭제에 실패했습니다.");
  });
});
