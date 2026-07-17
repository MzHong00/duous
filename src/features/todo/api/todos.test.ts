import { describe, expect, it, vi } from "vitest";

import { todosApi } from "@/features/todo/api/todos";

import type { TodoRow } from "@/features/todo/utils/todoUtils";

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

const todoRow: TodoRow = {
  id: "todo-1",
  workspace_id: "workspace-1",
  title: "제목",
  description: "설명",
  is_completed: false,
  assignee_id: "user-1",
  start_date: "2026-07-01",
  end_date: "2026-07-02",
  color: "#fff",
  created_at: "2026-07-01T00:00:00Z",
};

describe("todosApi.list", () => {
  it("workspaceId로 필터링해 최신순 목록을 조회하고 Todo로 변환한다", async () => {
    mockOrder.mockResolvedValueOnce({ data: [todoRow], error: null });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const result = await todosApi.list("workspace-1");

    expect(mockFrom).toHaveBeenCalledWith("todos");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("workspace_id", "workspace-1");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result).toEqual([
      expect.objectContaining({ id: "todo-1", workspaceId: "workspace-1", title: "제목" }),
    ]);
  });

  it("조회 실패 시 에러를 throw한다", async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: new Error("list failed") });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    await expect(todosApi.list("workspace-1")).rejects.toThrow("할 일 목록 조회에 실패했습니다.");
  });
});

describe("todosApi.create", () => {
  it("todo 필드를 snake_case로 변환해 insert하고 생성된 Todo를 반환한다", async () => {
    mockSingle.mockResolvedValueOnce({ data: todoRow, error: null });
    const mockSelectAfterInsert = vi.fn().mockReturnValue({ single: mockSingle });
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockFrom.mockReturnValue({ insert: mockInsert });

    const result = await todosApi.create({
      workspaceId: "workspace-1",
      title: "제목",
      description: "설명",
      isCompleted: false,
      assigneeId: "user-1",
      startDate: "2026-07-01",
      endDate: "2026-07-02",
      color: "#fff",
    });

    expect(mockFrom).toHaveBeenCalledWith("todos");
    expect(mockInsert).toHaveBeenCalledWith({
      workspace_id: "workspace-1",
      title: "제목",
      description: "설명",
      is_completed: false,
      assignee_id: "user-1",
      start_date: "2026-07-01",
      end_date: "2026-07-02",
      color: "#fff",
    });
    expect(result).toEqual(expect.objectContaining({ id: "todo-1", title: "제목" }));
  });

  it("생성 실패 시 에러를 throw한다", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error("create failed") });
    const mockSelectAfterInsert = vi.fn().mockReturnValue({ single: mockSingle });
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockFrom.mockReturnValue({ insert: mockInsert });

    await expect(
      todosApi.create({
        workspaceId: "workspace-1",
        title: "제목",
        isCompleted: false,
        startDate: "2026-07-01",
        endDate: "2026-07-02",
      })
    ).rejects.toThrow("할 일 생성에 실패했습니다.");
  });
});

describe("todosApi.update", () => {
  it("변경된 필드를 update하고 수정된 Todo를 반환한다", async () => {
    mockSingle.mockResolvedValueOnce({ data: todoRow, error: null });
    const mockSelectAfterUpdate = vi.fn().mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ select: mockSelectAfterUpdate });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const result = await todosApi.update("todo-1", { title: "수정된 제목" });

    expect(mockFrom).toHaveBeenCalledWith("todos");
    expect(mockUpdate).toHaveBeenCalledWith({
      title: "수정된 제목",
      description: undefined,
      is_completed: undefined,
      assignee_id: undefined,
      start_date: undefined,
      end_date: undefined,
      color: undefined,
    });
    expect(mockEq).toHaveBeenCalledWith("id", "todo-1");
    expect(result).toEqual(expect.objectContaining({ id: "todo-1" }));
  });

  it("수정 실패 시 에러를 throw한다", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error("update failed") });
    const mockSelectAfterUpdate = vi.fn().mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ select: mockSelectAfterUpdate });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    await expect(todosApi.update("todo-1", { title: "수정된 제목" })).rejects.toThrow(
      "할 일 수정에 실패했습니다."
    );
  });
});

describe("todosApi.toggle", () => {
  it("is_completed만 업데이트하고 변경된 Todo를 반환한다", async () => {
    mockSingle.mockResolvedValueOnce({ data: { ...todoRow, is_completed: true }, error: null });
    const mockSelectAfterUpdate = vi.fn().mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ select: mockSelectAfterUpdate });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const result = await todosApi.toggle("todo-1", true);

    expect(mockUpdate).toHaveBeenCalledWith({ is_completed: true });
    expect(mockEq).toHaveBeenCalledWith("id", "todo-1");
    expect(result.isCompleted).toBe(true);
  });

  it("토글 실패 시 에러를 throw한다", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error("toggle failed") });
    const mockSelectAfterUpdate = vi.fn().mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ select: mockSelectAfterUpdate });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    await expect(todosApi.toggle("todo-1", true)).rejects.toThrow(
      "할 일 상태 변경에 실패했습니다."
    );
  });
});

describe("todosApi.delete", () => {
  it("id로 delete 요청을 보낸다", async () => {
    mockEq.mockResolvedValueOnce({ error: null });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ delete: mockDelete });

    await todosApi.delete("todo-1");

    expect(mockFrom).toHaveBeenCalledWith("todos");
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", "todo-1");
  });

  it("삭제 실패 시 에러를 throw한다", async () => {
    mockEq.mockResolvedValueOnce({ error: new Error("delete failed") });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ delete: mockDelete });

    await expect(todosApi.delete("todo-1")).rejects.toThrow("할 일 삭제에 실패했습니다.");
  });
});
