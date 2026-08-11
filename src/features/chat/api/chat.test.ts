import { afterEach, describe, expect, it, vi } from "vitest";

import { chatApi } from "@/features/chat/api/chat";

import { mockFetch } from "@/lib/api/mockFetch";

import type { ChatMessage } from "@/features/chat/types/chat";

const chatMessage: ChatMessage = {
  id: "message-1",
  text: "안녕",
  sender: "me",
  senderId: "user-1",
  createdAt: "2026-07-01T00:00:00Z",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("chatApi.list", () => {
  it("workspaceId·userId 쿼리로 GET /api/messages를 호출하고 목록을 반환한다", async () => {
    const fetchSpy = mockFetch(200, [chatMessage]);

    const result = await chatApi.list("workspace-1");

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/messages?workspaceId=workspace-1",
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );
    expect(result).toEqual([chatMessage]);
  });

  it("조회 실패 시 에러를 throw한다", async () => {
    mockFetch(500, { message: "메시지 목록 조회에 실패했습니다." });

    await expect(chatApi.list("workspace-1")).rejects.toThrow("메시지 목록 조회에 실패했습니다.");
  });
});

describe("chatApi.send", () => {
  it("POST /api/messages로 메시지 전송 요청을 보낸다", async () => {
    const fetchSpy = mockFetch(204, null);

    await chatApi.send("workspace-1", "안녕");

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/messages",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ workspaceId: "workspace-1", text: "안녕" }),
      })
    );
  });

  it("전송 실패 시 에러를 throw한다", async () => {
    mockFetch(500, { message: "메시지 전송에 실패했습니다." });

    await expect(chatApi.send("workspace-1", "안녕")).rejects.toThrow(
      "메시지 전송에 실패했습니다."
    );
  });
});
