import { describe, expect, it, vi } from "vitest";

import { chatApi, rowToChatMessage } from "@/features/chat/api/chat";

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();
const mockInsert = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

const messageRow = {
  id: "message-1",
  workspace_id: "workspace-1",
  sender_id: "user-1",
  text: "안녕",
  created_at: "2026-07-01T00:00:00Z",
};

describe("rowToChatMessage", () => {
  it("sender_id가 userId와 같으면 sender를 me로 변환한다", () => {
    const result = rowToChatMessage(messageRow, "user-1");

    expect(result).toEqual(
      expect.objectContaining({ id: "message-1", text: "안녕", sender: "me", senderId: "user-1" })
    );
  });

  it("sender_id가 userId와 다르면 sender를 partner로 변환한다", () => {
    const result = rowToChatMessage(messageRow, "user-2");

    expect(result.sender).toBe("partner");
  });
});

describe("chatApi.list", () => {
  it("workspaceId로 필터링해 created_at 오름차순으로 조회하고 ChatMessage로 변환한다", async () => {
    mockOrder.mockResolvedValueOnce({ data: [messageRow], error: null });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    const result = await chatApi.list("workspace-1", "user-1");

    expect(mockFrom).toHaveBeenCalledWith("messages");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("workspace_id", "workspace-1");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: true });
    expect(result).toEqual([
      expect.objectContaining({ id: "message-1", sender: "me", text: "안녕" }),
    ]);
  });

  it("조회 실패 시 에러를 throw한다", async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: new Error("list failed") });
    mockEq.mockReturnValue({ order: mockOrder });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockFrom.mockReturnValue({ select: mockSelect });

    await expect(chatApi.list("workspace-1", "user-1")).rejects.toThrow(
      "메시지 목록 조회에 실패했습니다."
    );
  });
});

describe("chatApi.send", () => {
  it("workspaceId, senderId, text를 insert한다", async () => {
    mockInsert.mockResolvedValueOnce({ error: null });
    mockFrom.mockReturnValue({ insert: mockInsert });

    await chatApi.send("workspace-1", "user-1", "안녕");

    expect(mockFrom).toHaveBeenCalledWith("messages");
    expect(mockInsert).toHaveBeenCalledWith({
      workspace_id: "workspace-1",
      sender_id: "user-1",
      text: "안녕",
    });
  });

  it("전송 실패 시 에러를 throw한다", async () => {
    mockInsert.mockResolvedValueOnce({ error: new Error("send failed") });
    mockFrom.mockReturnValue({ insert: mockInsert });

    await expect(chatApi.send("workspace-1", "user-1", "안녕")).rejects.toThrow(
      "메시지 전송에 실패했습니다."
    );
  });
});
