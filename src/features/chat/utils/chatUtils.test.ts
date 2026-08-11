import { describe, expect, it } from "vitest";

import { rowToChatMessage } from "@/features/chat/utils/chatUtils";

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

    expect(result).toEqual({
      id: "message-1",
      text: "안녕",
      sender: "me",
      senderId: "user-1",
      createdAt: "2026-07-01T00:00:00Z",
    });
  });

  it("sender_id가 userId와 다르면 sender를 partner로 변환한다", () => {
    const result = rowToChatMessage(messageRow, "user-2");

    expect(result.sender).toBe("partner");
  });

  it("created_at을 포맷하지 않고 원본 ISO 문자열로 유지한다", () => {
    const result = rowToChatMessage(messageRow, "user-1");

    expect(result.createdAt).toBe(messageRow.created_at);
  });
});
