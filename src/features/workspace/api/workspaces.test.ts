import { beforeEach, describe, expect, it, vi } from "vitest";

import { workspacesApi } from "@/features/workspace/api/workspaces";

import type { User } from "@/types/user";

const mockFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const workspaceRow = {
  id: "workspace-1",
  name: "우리집",
  type: "couple",
  start_date: "2026-01-01",
  background_image: null,
  theme_color: "pink",
  created_by: "user-1",
  created_at: "2026-01-01T00:00:00Z",
};

const memberRow = {
  workspace_id: "workspace-1",
  user_id: "user-1",
  display_name: "홍길동",
  email: "test@example.com",
  avatar_url: "https://example.com/avatar.png",
};

const user: User = {
  id: "user-1",
  name: "홍길동",
  email: "test@example.com",
  profileImage: "https://example.com/avatar.png",
};

describe("workspacesApi.listMine", () => {
  it("내가 속한 워크스페이스 목록을 멤버 포함해 조회한다", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-1" } } });

    const memberEq = vi.fn().mockResolvedValueOnce({
      data: [{ workspace_id: "workspace-1" }],
      error: null,
    });
    const memberSelect = vi.fn().mockReturnValue({ eq: memberEq });

    const wsIn = vi.fn().mockResolvedValueOnce({ data: [workspaceRow], error: null });
    const wsSelect = vi.fn().mockReturnValue({ in: wsIn });

    const allMembersIn = vi.fn().mockResolvedValueOnce({ data: [memberRow], error: null });
    const allMembersSelect = vi.fn().mockReturnValue({ in: allMembersIn });

    mockFrom
      .mockReturnValueOnce({ select: memberSelect })
      .mockReturnValueOnce({ select: wsSelect })
      .mockReturnValueOnce({ select: allMembersSelect });

    const result = await workspacesApi.listMine();

    expect(mockFrom).toHaveBeenNthCalledWith(1, "workspace_members");
    expect(memberEq).toHaveBeenCalledWith("user_id", "user-1");
    expect(mockFrom).toHaveBeenNthCalledWith(2, "workspaces");
    expect(wsIn).toHaveBeenCalledWith("id", ["workspace-1"]);
    expect(mockFrom).toHaveBeenNthCalledWith(3, "workspace_members");
    expect(allMembersIn).toHaveBeenCalledWith("workspace_id", ["workspace-1"]);
    expect(result).toEqual([expect.objectContaining({ id: "workspace-1", name: "우리집" })]);
  });

  it("속한 워크스페이스가 없으면 빈 배열을 반환한다", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-1" } } });

    const memberEq = vi.fn().mockResolvedValueOnce({ data: [], error: null });
    const memberSelect = vi.fn().mockReturnValue({ eq: memberEq });
    mockFrom.mockReturnValueOnce({ select: memberSelect });

    const result = await workspacesApi.listMine();

    expect(result).toEqual([]);
  });

  it("멤버 조회 실패 시 에러를 throw한다", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-1" } } });

    const memberEq = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: new Error("member list failed") });
    const memberSelect = vi.fn().mockReturnValue({ eq: memberEq });
    mockFrom.mockReturnValueOnce({ select: memberSelect });

    await expect(workspacesApi.listMine()).rejects.toThrow(
      "워크스페이스 목록 조회에 실패했습니다."
    );
  });
});

describe("workspacesApi.create", () => {
  it("워크스페이스를 생성하고 생성자를 멤버로 추가한다", async () => {
    const wsSingle = vi.fn().mockResolvedValueOnce({ data: workspaceRow, error: null });
    const wsSelect = vi.fn().mockReturnValue({ single: wsSingle });
    const wsInsert = vi.fn().mockReturnValue({ select: wsSelect });

    const memberInsert = vi.fn().mockResolvedValueOnce({ error: null });

    mockFrom
      .mockReturnValueOnce({ insert: wsInsert })
      .mockReturnValueOnce({ insert: memberInsert });

    const result = await workspacesApi.create("우리집", "couple", "2026-01-01", user);

    expect(mockFrom).toHaveBeenNthCalledWith(1, "workspaces");
    expect(wsInsert).toHaveBeenCalledWith({
      name: "우리집",
      type: "couple",
      start_date: "2026-01-01",
      created_by: "user-1",
    });
    expect(mockFrom).toHaveBeenNthCalledWith(2, "workspace_members");
    expect(memberInsert).toHaveBeenCalledWith({
      workspace_id: "workspace-1",
      user_id: "user-1",
      display_name: "홍길동",
      email: "test@example.com",
      avatar_url: "https://example.com/avatar.png",
    });
    expect(result.workspace).toEqual(expect.objectContaining({ id: "workspace-1" }));
  });

  it("워크스페이스 생성 실패 시 에러를 throw한다", async () => {
    const wsSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: new Error("create failed") });
    const wsSelect = vi.fn().mockReturnValue({ single: wsSingle });
    const wsInsert = vi.fn().mockReturnValue({ select: wsSelect });
    mockFrom.mockReturnValueOnce({ insert: wsInsert });

    await expect(workspacesApi.create("우리집", "couple", "2026-01-01", user)).rejects.toThrow(
      "워크스페이스 생성에 실패했습니다."
    );
  });

  it("멤버 추가 실패 시 에러를 throw한다", async () => {
    const wsSingle = vi.fn().mockResolvedValueOnce({ data: workspaceRow, error: null });
    const wsSelect = vi.fn().mockReturnValue({ single: wsSingle });
    const wsInsert = vi.fn().mockReturnValue({ select: wsSelect });

    const memberInsert = vi.fn().mockResolvedValueOnce({ error: new Error("member add failed") });

    mockFrom
      .mockReturnValueOnce({ insert: wsInsert })
      .mockReturnValueOnce({ insert: memberInsert });

    await expect(workspacesApi.create("우리집", "couple", "2026-01-01", user)).rejects.toThrow(
      "워크스페이스 생성에 실패했습니다."
    );
  });
});

describe("workspacesApi.getByInviteCode", () => {
  it("초대 코드로 워크스페이스를 조회한다", async () => {
    const futureExpiry = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    const inviteSingle = vi.fn().mockResolvedValueOnce({
      data: { workspace_id: "workspace-1", expires_at: futureExpiry },
      error: null,
    });
    const inviteEq = vi.fn().mockReturnValue({ single: inviteSingle });
    const inviteSelect = vi.fn().mockReturnValue({ eq: inviteEq });

    const wsSingle = vi.fn().mockResolvedValueOnce({ data: workspaceRow, error: null });
    const wsEq = vi.fn().mockReturnValue({ single: wsSingle });
    const wsSelect = vi.fn().mockReturnValue({ eq: wsEq });

    const membersEq = vi.fn().mockResolvedValueOnce({ data: [memberRow], error: null });
    const membersSelect = vi.fn().mockReturnValue({ eq: membersEq });

    mockFrom
      .mockReturnValueOnce({ select: inviteSelect })
      .mockReturnValueOnce({ select: wsSelect })
      .mockReturnValueOnce({ select: membersSelect });

    const result = await workspacesApi.getByInviteCode("ABCD1234");

    expect(mockFrom).toHaveBeenNthCalledWith(1, "workspace_invites");
    expect(inviteEq).toHaveBeenCalledWith("invite_code", "ABCD1234");
    expect(mockFrom).toHaveBeenNthCalledWith(2, "workspaces");
    expect(wsEq).toHaveBeenCalledWith("id", "workspace-1");
    expect(result).toEqual(expect.objectContaining({ id: "workspace-1" }));
  });

  it("초대 코드가 없으면 null을 반환한다", async () => {
    const inviteSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: new Error("not found") });
    const inviteEq = vi.fn().mockReturnValue({ single: inviteSingle });
    const inviteSelect = vi.fn().mockReturnValue({ eq: inviteEq });
    mockFrom.mockReturnValueOnce({ select: inviteSelect });

    const result = await workspacesApi.getByInviteCode("INVALID1");

    expect(result).toBeNull();
  });

  it("만료된 초대 코드면 null을 반환한다", async () => {
    const pastExpiry = new Date(Date.now() - 1000 * 60 * 60).toISOString();
    const inviteSingle = vi.fn().mockResolvedValueOnce({
      data: { workspace_id: "workspace-1", expires_at: pastExpiry },
      error: null,
    });
    const inviteEq = vi.fn().mockReturnValue({ single: inviteSingle });
    const inviteSelect = vi.fn().mockReturnValue({ eq: inviteEq });
    mockFrom.mockReturnValueOnce({ select: inviteSelect });

    const result = await workspacesApi.getByInviteCode("EXPIRED1");

    expect(result).toBeNull();
  });
});

describe("workspacesApi.join", () => {
  it("이미 멤버가 아니면 멤버로 추가하고 워크스페이스를 반환한다", async () => {
    const existingSingle = vi.fn().mockResolvedValueOnce({ data: null, error: null });
    const existingEq2 = vi.fn().mockReturnValue({ single: existingSingle });
    const existingEq1 = vi.fn().mockReturnValue({ eq: existingEq2 });
    const existingSelect = vi.fn().mockReturnValue({ eq: existingEq1 });

    const memberInsert = vi.fn().mockResolvedValueOnce({ error: null });

    const wsSingle = vi.fn().mockResolvedValueOnce({ data: workspaceRow, error: null });
    const wsEq = vi.fn().mockReturnValue({ single: wsSingle });
    const wsSelect = vi.fn().mockReturnValue({ eq: wsEq });

    const membersEq = vi.fn().mockResolvedValueOnce({ data: [memberRow], error: null });
    const membersSelect = vi.fn().mockReturnValue({ eq: membersEq });

    mockFrom
      .mockReturnValueOnce({ select: existingSelect })
      .mockReturnValueOnce({ insert: memberInsert })
      .mockReturnValueOnce({ select: wsSelect })
      .mockReturnValueOnce({ select: membersSelect });

    const result = await workspacesApi.join("workspace-1", user);

    expect(mockFrom).toHaveBeenNthCalledWith(1, "workspace_members");
    expect(mockFrom).toHaveBeenNthCalledWith(2, "workspace_members");
    expect(memberInsert).toHaveBeenCalledWith({
      workspace_id: "workspace-1",
      user_id: "user-1",
      display_name: "홍길동",
      email: "test@example.com",
      avatar_url: "https://example.com/avatar.png",
    });
    expect(result).toEqual(expect.objectContaining({ id: "workspace-1" }));
  });

  it("이미 멤버면 추가하지 않고 워크스페이스를 반환한다", async () => {
    const existingSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: { user_id: "user-1" }, error: null });
    const existingEq2 = vi.fn().mockReturnValue({ single: existingSingle });
    const existingEq1 = vi.fn().mockReturnValue({ eq: existingEq2 });
    const existingSelect = vi.fn().mockReturnValue({ eq: existingEq1 });

    const wsSingle = vi.fn().mockResolvedValueOnce({ data: workspaceRow, error: null });
    const wsEq = vi.fn().mockReturnValue({ single: wsSingle });
    const wsSelect = vi.fn().mockReturnValue({ eq: wsEq });

    const membersEq = vi.fn().mockResolvedValueOnce({ data: [memberRow], error: null });
    const membersSelect = vi.fn().mockReturnValue({ eq: membersEq });

    const memberInsert = vi.fn();

    mockFrom
      .mockReturnValueOnce({ select: existingSelect })
      .mockReturnValueOnce({ select: wsSelect })
      .mockReturnValueOnce({ select: membersSelect });

    const result = await workspacesApi.join("workspace-1", user);

    expect(memberInsert).not.toHaveBeenCalled();
    expect(result).toEqual(expect.objectContaining({ id: "workspace-1" }));
  });

  it("unique 제약 위반 에러는 무시하고 참여를 성공으로 간주한다", async () => {
    const existingSingle = vi.fn().mockResolvedValueOnce({ data: null, error: null });
    const existingEq2 = vi.fn().mockReturnValue({ single: existingSingle });
    const existingEq1 = vi.fn().mockReturnValue({ eq: existingEq2 });
    const existingSelect = vi.fn().mockReturnValue({ eq: existingEq1 });

    const memberInsert = vi
      .fn()
      .mockResolvedValueOnce({ error: { code: "23505", message: "duplicate" } });

    const wsSingle = vi.fn().mockResolvedValueOnce({ data: workspaceRow, error: null });
    const wsEq = vi.fn().mockReturnValue({ single: wsSingle });
    const wsSelect = vi.fn().mockReturnValue({ eq: wsEq });

    const membersEq = vi.fn().mockResolvedValueOnce({ data: [memberRow], error: null });
    const membersSelect = vi.fn().mockReturnValue({ eq: membersEq });

    mockFrom
      .mockReturnValueOnce({ select: existingSelect })
      .mockReturnValueOnce({ insert: memberInsert })
      .mockReturnValueOnce({ select: wsSelect })
      .mockReturnValueOnce({ select: membersSelect });

    const result = await workspacesApi.join("workspace-1", user);

    expect(result).toEqual(expect.objectContaining({ id: "workspace-1" }));
  });

  it("unique 제약 위반이 아닌 멤버 추가 실패 시 에러를 throw한다", async () => {
    const existingSingle = vi.fn().mockResolvedValueOnce({ data: null, error: null });
    const existingEq2 = vi.fn().mockReturnValue({ single: existingSingle });
    const existingEq1 = vi.fn().mockReturnValue({ eq: existingEq2 });
    const existingSelect = vi.fn().mockReturnValue({ eq: existingEq1 });

    const memberInsert = vi
      .fn()
      .mockResolvedValueOnce({ error: { code: "OTHER", message: "insert failed" } });

    mockFrom
      .mockReturnValueOnce({ select: existingSelect })
      .mockReturnValueOnce({ insert: memberInsert });

    await expect(workspacesApi.join("workspace-1", user)).rejects.toThrow(
      "워크스페이스 참여에 실패했습니다."
    );
  });

  it("워크스페이스 조회 실패 시 에러를 throw한다", async () => {
    const existingSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: { user_id: "user-1" }, error: null });
    const existingEq2 = vi.fn().mockReturnValue({ single: existingSingle });
    const existingEq1 = vi.fn().mockReturnValue({ eq: existingEq2 });
    const existingSelect = vi.fn().mockReturnValue({ eq: existingEq1 });

    const wsSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: new Error("ws fetch failed") });
    const wsEq = vi.fn().mockReturnValue({ single: wsSingle });
    const wsSelect = vi.fn().mockReturnValue({ eq: wsEq });

    mockFrom
      .mockReturnValueOnce({ select: existingSelect })
      .mockReturnValueOnce({ select: wsSelect });

    await expect(workspacesApi.join("workspace-1", user)).rejects.toThrow(
      "워크스페이스 참여에 실패했습니다."
    );
  });
});

describe("workspacesApi.updateName", () => {
  it("워크스페이스 이름을 수정한다", async () => {
    const eq = vi.fn().mockResolvedValueOnce({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValueOnce({ update });

    await workspacesApi.updateName("workspace-1", "새이름");

    expect(mockFrom).toHaveBeenCalledWith("workspaces");
    expect(update).toHaveBeenCalledWith({ name: "새이름" });
    expect(eq).toHaveBeenCalledWith("id", "workspace-1");
  });

  it("수정 실패 시 에러를 throw한다", async () => {
    const eq = vi.fn().mockResolvedValueOnce({ error: new Error("update failed") });
    const update = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValueOnce({ update });

    await expect(workspacesApi.updateName("workspace-1", "새이름")).rejects.toThrow(
      "워크스페이스 이름 수정에 실패했습니다."
    );
  });
});

describe("workspacesApi.updateStartDate", () => {
  it("워크스페이스 시작일을 수정한다", async () => {
    const eq = vi.fn().mockResolvedValueOnce({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValueOnce({ update });

    await workspacesApi.updateStartDate("workspace-1", "2026-02-01");

    expect(mockFrom).toHaveBeenCalledWith("workspaces");
    expect(update).toHaveBeenCalledWith({ start_date: "2026-02-01" });
    expect(eq).toHaveBeenCalledWith("id", "workspace-1");
  });

  it("수정 실패 시 에러를 throw한다", async () => {
    const eq = vi.fn().mockResolvedValueOnce({ error: new Error("update failed") });
    const update = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValueOnce({ update });

    await expect(workspacesApi.updateStartDate("workspace-1", "2026-02-01")).rejects.toThrow(
      "워크스페이스 시작일 수정에 실패했습니다."
    );
  });
});

describe("workspacesApi.updateThemeColor", () => {
  it("워크스페이스 테마 컬러를 수정한다", async () => {
    const eq = vi.fn().mockResolvedValueOnce({ error: null });
    const update = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValueOnce({ update });

    await workspacesApi.updateThemeColor("workspace-1", "blue");

    expect(mockFrom).toHaveBeenCalledWith("workspaces");
    expect(update).toHaveBeenCalledWith({ theme_color: "blue" });
    expect(eq).toHaveBeenCalledWith("id", "workspace-1");
  });

  it("수정 실패 시 에러를 throw한다", async () => {
    const eq = vi.fn().mockResolvedValueOnce({ error: new Error("update failed") });
    const update = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValueOnce({ update });

    await expect(workspacesApi.updateThemeColor("workspace-1", "blue")).rejects.toThrow(
      "워크스페이스 테마 색상 수정에 실패했습니다."
    );
  });
});

describe("workspacesApi.createInviteCode", () => {
  it("초대 코드를 생성해 DB에 기록하고 코드를 반환한다", async () => {
    const insert = vi.fn().mockResolvedValueOnce({ error: null });
    mockFrom.mockReturnValueOnce({ insert });

    const code = await workspacesApi.createInviteCode("workspace-1", "user-1");

    expect(mockFrom).toHaveBeenCalledWith("workspace_invites");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        workspace_id: "workspace-1",
        invite_code: code,
        created_by: "user-1",
      })
    );
    expect(code).toHaveLength(8);
  });

  it("생성 실패 시 에러를 throw한다", async () => {
    const insert = vi.fn().mockResolvedValueOnce({ error: new Error("invite failed") });
    mockFrom.mockReturnValueOnce({ insert });

    await expect(workspacesApi.createInviteCode("workspace-1", "user-1")).rejects.toThrow(
      "초대 코드 생성에 실패했습니다."
    );
  });
});

describe("workspacesApi.leave", () => {
  it("본인 멤버 row를 삭제한다", async () => {
    const eq2 = vi.fn().mockResolvedValueOnce({ error: null });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const del = vi.fn().mockReturnValue({ eq: eq1 });
    mockFrom.mockReturnValueOnce({ delete: del });

    await workspacesApi.leave("workspace-1", "user-1");

    expect(mockFrom).toHaveBeenCalledWith("workspace_members");
    expect(eq1).toHaveBeenCalledWith("workspace_id", "workspace-1");
    expect(eq2).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("삭제 실패 시 에러를 throw한다", async () => {
    const eq2 = vi.fn().mockResolvedValueOnce({ error: new Error("leave failed") });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const del = vi.fn().mockReturnValue({ eq: eq1 });
    mockFrom.mockReturnValueOnce({ delete: del });

    await expect(workspacesApi.leave("workspace-1", "user-1")).rejects.toThrow(
      "워크스페이스 나가기에 실패했습니다."
    );
  });
});

describe("workspacesApi.updateMember", () => {
  it("멤버 프로필을 업데이트한다", async () => {
    const eq2 = vi.fn().mockResolvedValueOnce({ error: null });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const update = vi.fn().mockReturnValue({ eq: eq1 });
    mockFrom.mockReturnValueOnce({ update });

    await workspacesApi.updateMember("workspace-1", "user-1", { display_name: "새이름" });

    expect(mockFrom).toHaveBeenCalledWith("workspace_members");
    expect(update).toHaveBeenCalledWith({ display_name: "새이름" });
    expect(eq1).toHaveBeenCalledWith("workspace_id", "workspace-1");
    expect(eq2).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("업데이트 실패 시 에러를 throw한다", async () => {
    const eq2 = vi.fn().mockResolvedValueOnce({ error: new Error("update failed") });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const update = vi.fn().mockReturnValue({ eq: eq1 });
    mockFrom.mockReturnValueOnce({ update });

    await expect(
      workspacesApi.updateMember("workspace-1", "user-1", { display_name: "새이름" })
    ).rejects.toThrow("멤버 프로필 수정에 실패했습니다.");
  });
});
