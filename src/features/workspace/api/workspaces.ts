import { supabase } from "@/shared/lib/supabase";
import type { Workspace, WorkspaceMember } from "@/features/workspace/types/workspace";

interface WorkspaceRow {
  id: string;
  name: string;
  type: "couple" | "group";
  start_date?: string;
  background_image?: string;
  created_by: string;
}

interface MemberRow {
  user_id: string;
  display_name: string;
  email?: string;
  avatar_url?: string;
}

const rowToWorkspace = (row: WorkspaceRow, members: MemberRow[]): Workspace => ({
  id: row.id,
  name: row.name,
  type: row.type,
  startDate: row.start_date,
  backgroundImage: row.background_image,
  members: members.map((m) => ({
    id: m.user_id,
    name: m.display_name,
    email: m.email ?? "",
    avatar: m.avatar_url,
  })),
});

export const workspacesApi = {
  // 내가 속한 워크스페이스 목록 (멤버 포함)
  listMine: async (): Promise<Workspace[]> => {
    const { data: memberRows, error: memberError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "");

    if (memberError) throw memberError;
    if (!memberRows?.length) return [];

    const workspaceIds = memberRows.map((r) => r.workspace_id);

    const { data: wsRows, error: wsError } = await supabase
      .from("workspaces")
      .select("*")
      .in("id", workspaceIds);

    if (wsError) throw wsError;

    const { data: allMembers, error: allMembersError } = await supabase
      .from("workspace_members")
      .select("*")
      .in("workspace_id", workspaceIds);

    if (allMembersError) throw allMembersError;

    return (wsRows as WorkspaceRow[]).map((ws) => {
      const members = (allMembers as (MemberRow & { workspace_id: string })[]).filter(
        (m) => m.workspace_id === ws.id
      );
      return rowToWorkspace(ws, members);
    });
  },

  // 워크스페이스 생성 + 생성자 멤버 추가
  create: async (
    name: string,
    type: "couple" | "group",
    startDate: string | undefined,
    user: { id: string; name: string; email?: string; profileImage?: string }
  ): Promise<{ workspace: Workspace }> => {
    const { data: ws, error: wsError } = await supabase
      .from("workspaces")
      .insert({
        name,
        type,
        start_date: startDate || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (wsError) throw wsError;

    const { error: memberError } = await supabase.from("workspace_members").insert({
      workspace_id: ws.id,
      user_id: user.id,
      display_name: user.name,
      email: user.email,
      avatar_url: user.profileImage,
    });

    if (memberError) throw memberError;

    const workspace = rowToWorkspace(ws as WorkspaceRow, [
      {
        user_id: user.id,
        display_name: user.name,
        email: user.email,
        avatar_url: user.profileImage,
      },
    ]);

    return { workspace };
  },

  // 초대 코드로 워크스페이스 조회
  getByInviteCode: async (code: string): Promise<Workspace | null> => {
    const { data: invite, error } = await supabase
      .from("workspace_invites")
      .select("workspace_id, expires_at")
      .eq("invite_code", code)
      .single();

    if (error || !invite) return null;

    const now = new Date();
    if (new Date(invite.expires_at) < now) return null;

    const { data: ws, error: wsError } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", invite.workspace_id)
      .single();

    if (wsError || !ws) return null;

    const { data: members } = await supabase
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", ws.id);

    return rowToWorkspace(ws as WorkspaceRow, (members ?? []) as MemberRow[]);
  },

  // 워크스페이스 참여
  join: async (
    workspaceId: string,
    user: { id: string; name: string; email?: string; profileImage?: string }
  ): Promise<Workspace> => {
    // 이미 멤버인지 확인
    const { data: existing } = await supabase
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      const { error } = await supabase.from("workspace_members").insert({
        workspace_id: workspaceId,
        user_id: user.id,
        display_name: user.name,
        email: user.email,
        avatar_url: user.profileImage,
      });
      if (error) throw error;
    }

    const { data: ws, error: wsError } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .single();

    if (wsError) throw wsError;

    const { data: members } = await supabase
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", workspaceId);

    return rowToWorkspace(ws as WorkspaceRow, (members ?? []) as MemberRow[]);
  },

  // 워크스페이스 이름 수정
  updateName: async (workspaceId: string, name: string): Promise<void> => {
    const { error } = await supabase.from("workspaces").update({ name }).eq("id", workspaceId);
    if (error) throw error;
  },

  // 워크스페이스 시작일 수정
  updateStartDate: async (workspaceId: string, startDate: string): Promise<void> => {
    const { error } = await supabase
      .from("workspaces")
      .update({ start_date: startDate })
      .eq("id", workspaceId);
    if (error) throw error;
  },

  // 이메일로 초대장 발송 (DB에 기록)
  sendInvite: async (
    workspaceId: string,
    workspaceName: string,
    inviteeEmail: string,
    userId: string
  ): Promise<void> => {
    const { error } = await supabase.from("workspace_invites").insert({
      workspace_id: workspaceId,
      workspace_name: workspaceName,
      invitee_email: inviteeEmail.toLowerCase().trim(),
      created_by: userId,
      status: "pending",
    });
    if (error) throw error;
  },

  // 내 이메일로 온 pending 초대 목록
  getPendingInvites: async (
    email: string
  ): Promise<
    {
      id: string;
      workspaceId: string;
      workspaceName: string;
    }[]
  > => {
    const { data, error } = await supabase
      .from("workspace_invites")
      .select("id, workspace_id, workspace_name")
      .eq("invitee_email", email.toLowerCase().trim())
      .eq("status", "pending");
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      workspaceId: r.workspace_id,
      workspaceName: r.workspace_name ?? "",
    }));
  },

  // 초대 거절
  declineInvite: async (inviteId: string): Promise<void> => {
    const { error } = await supabase
      .from("workspace_invites")
      .update({ status: "declined" })
      .eq("id", inviteId);
    if (error) throw error;
  },

  // 초대 수락 → 워크스페이스 멤버로 추가
  acceptInvite: async (
    inviteId: string,
    workspaceId: string,
    user: { id: string; name: string; email?: string; profileImage?: string }
  ): Promise<Workspace> => {
    // 상태 업데이트
    const { error: updateError } = await supabase
      .from("workspace_invites")
      .update({ status: "accepted" })
      .eq("id", inviteId);
    if (updateError) throw updateError;

    // 워크스페이스 참여
    return workspacesApi.join(workspaceId, user);
  },

  // 멤버 프로필 업데이트
  updateMember: async (
    workspaceId: string,
    userId: string,
    updates: { display_name?: string; avatar_url?: string }
  ): Promise<void> => {
    const { error } = await supabase
      .from("workspace_members")
      .update(updates)
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId);
    if (error) throw error;
  },
};
