import { describe, expect, it, vi } from "vitest";

import { rowToWorkspace, buildInviteLink } from "@/features/workspace/utils/workspaceUtils";

import type { WorkspaceRow, MemberRow } from "@/features/workspace/utils/workspaceUtils";

describe("rowToWorkspace", () => {
  it("row와 멤버 목록을 Workspace 타입으로 변환한다", () => {
    const row: WorkspaceRow = {
      id: "ws-1",
      name: "우리 커플",
      type: "couple",
      start_date: "2026-01-01",
      background_image: "https://example.com/bg.png",
      created_by: "user-1",
      theme_color: "pink",
    };
    const members: MemberRow[] = [
      { user_id: "user-1", display_name: "민수", email: "a@a.com", avatar_url: "https://a.png" },
    ];

    expect(rowToWorkspace(row, members)).toEqual({
      id: "ws-1",
      name: "우리 커플",
      type: "couple",
      startDate: "2026-01-01",
      backgroundImage: "https://example.com/bg.png",
      themeColor: "pink",
      members: [{ id: "user-1", name: "민수", email: "a@a.com", avatar: "https://a.png" }],
    });
  });

  it("멤버의 email이 없으면 빈 문자열로 대체한다", () => {
    const row: WorkspaceRow = {
      id: "ws-1",
      name: "우리 커플",
      type: "couple",
      created_by: "user-1",
      theme_color: "pink",
    };
    const members: MemberRow[] = [{ user_id: "user-1", display_name: "민수" }];

    expect(rowToWorkspace(row, members).members?.[0].email).toBe("");
  });
});

describe("buildInviteLink", () => {
  it("현재 origin과 초대 코드로 참여 링크를 만든다", () => {
    vi.stubGlobal("location", { origin: "https://duous.app" });

    expect(buildInviteLink("ABC123")).toBe("https://duous.app/workspace/join/ABC123");

    vi.unstubAllGlobals();
  });
});
