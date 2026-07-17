import { describe, expect, it, vi } from "vitest";

import { storiesApi } from "@/features/stories/api/stories";

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

const storyRow = {
  id: "story-1",
  workspace_id: "workspace-1",
  user_id: "user-1",
  title: "제목",
  description: "설명",
  date: "2026-07-01",
  thumbnail_url: "https://example.com/thumb.png",
  path: [],
  path_color: "#fff",
  created_at: "2026-07-01T00:00:00Z",
};

describe("storiesApi.list", () => {
  it("workspaceId로 필터링해 date 내림차순으로 조회하고 Story로 변환한다", async () => {
    mockOrder.mockResolvedValueOnce({ data: [storyRow], error: null });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const result = await storiesApi.list("workspace-1");

    expect(mockFrom).toHaveBeenCalledWith("stories");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("workspace_id", "workspace-1");
    expect(mockOrder).toHaveBeenCalledWith("date", { ascending: false });
    expect(result).toEqual([
      expect.objectContaining({ id: "story-1", workspaceId: "workspace-1", title: "제목" }),
    ]);
  });

  it("조회 실패 시 에러를 throw한다", async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: new Error("list failed") });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    await expect(storiesApi.list("workspace-1")).rejects.toThrow(
      "스토리 목록 조회에 실패했습니다."
    );
  });
});

describe("storiesApi.create", () => {
  it("story 필드를 snake_case로 변환해 insert하고 생성된 Story를 반환한다", async () => {
    mockSingle.mockResolvedValueOnce({ data: storyRow, error: null });
    const mockSelectAfterInsert = vi.fn().mockReturnValue({ single: mockSingle });
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockFrom.mockReturnValue({ insert: mockInsert });

    const result = await storiesApi.create({
      workspaceId: "workspace-1",
      userId: "user-1",
      title: "제목",
      description: "설명",
      date: "2026-07-01",
      thumbnailUrl: "https://example.com/thumb.png",
      path: [],
      pathColor: "#fff",
    });

    expect(mockFrom).toHaveBeenCalledWith("stories");
    expect(mockInsert).toHaveBeenCalledWith({
      workspace_id: "workspace-1",
      user_id: "user-1",
      title: "제목",
      description: "설명",
      date: "2026-07-01",
      thumbnail_url: "https://example.com/thumb.png",
      path: [],
      path_color: "#fff",
    });
    expect(result).toEqual(expect.objectContaining({ id: "story-1", title: "제목" }));
  });

  it("생성 실패 시 에러를 throw한다", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error("create failed") });
    const mockSelectAfterInsert = vi.fn().mockReturnValue({ single: mockSingle });
    mockInsert.mockReturnValue({ select: mockSelectAfterInsert });
    mockFrom.mockReturnValue({ insert: mockInsert });

    await expect(
      storiesApi.create({
        workspaceId: "workspace-1",
        userId: "user-1",
        title: "제목",
        description: "설명",
        date: "2026-07-01",
        thumbnailUrl: "https://example.com/thumb.png",
        path: [],
        pathColor: "#fff",
      })
    ).rejects.toThrow("스토리 생성에 실패했습니다.");
  });
});

describe("storiesApi.update", () => {
  it("변경된 필드를 update하고 수정된 Story를 반환한다", async () => {
    mockSingle.mockResolvedValueOnce({ data: storyRow, error: null });
    const mockSelectAfterUpdate = vi.fn().mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ select: mockSelectAfterUpdate });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    const result = await storiesApi.update("story-1", { title: "수정된 제목" });

    expect(mockFrom).toHaveBeenCalledWith("stories");
    expect(mockUpdate).toHaveBeenCalledWith({
      title: "수정된 제목",
      description: undefined,
      date: undefined,
      thumbnail_url: undefined,
      path: undefined,
      path_color: undefined,
    });
    expect(mockEq).toHaveBeenCalledWith("id", "story-1");
    expect(result).toEqual(expect.objectContaining({ id: "story-1" }));
  });

  it("수정 실패 시 에러를 throw한다", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error("update failed") });
    const mockSelectAfterUpdate = vi.fn().mockReturnValue({ single: mockSingle });
    mockEq.mockReturnValue({ select: mockSelectAfterUpdate });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ update: mockUpdate });

    await expect(storiesApi.update("story-1", { title: "수정된 제목" })).rejects.toThrow(
      "스토리 수정에 실패했습니다."
    );
  });
});

describe("storiesApi.delete", () => {
  it("id로 delete 요청을 보낸다", async () => {
    mockEq.mockResolvedValueOnce({ error: null });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ delete: mockDelete });

    await storiesApi.delete("story-1");

    expect(mockFrom).toHaveBeenCalledWith("stories");
    expect(mockDelete).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith("id", "story-1");
  });

  it("삭제 실패 시 에러를 throw한다", async () => {
    mockEq.mockResolvedValueOnce({ error: new Error("delete failed") });
    mockDelete.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ delete: mockDelete });

    await expect(storiesApi.delete("story-1")).rejects.toThrow("스토리 삭제에 실패했습니다.");
  });
});
