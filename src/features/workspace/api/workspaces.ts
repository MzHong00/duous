import { supabase } from "@/lib/supabase/client";
import { rowToWorkspace } from "@/features/workspace/utils/workspaceUtils";

import type { User } from "@/types/user";
import type { RoomType, ThemeColor, Workspace } from "@/features/workspace/types/workspace";
import type { WorkspaceRow, MemberRow } from "@/features/workspace/utils/workspaceUtils";

const INVITE_CODE_LENGTH = 8; // 초대 코드 길이
const INVITE_CODE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 초대 코드 유효 기간 (7일)

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
    type: RoomType,
    startDate: string | undefined,
    user: User
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
  join: async (workspaceId: string, user: User): Promise<Workspace> => {
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

  // 워크스페이스 배경 이미지 수정
  updateBackground: async (workspaceId: string, imageUrl: string): Promise<void> => {
    const { error } = await supabase
      .from("workspaces")
      .update({ background_image: imageUrl })
      .eq("id", workspaceId);
    if (error) throw error;
  },

  // 워크스페이스 색상 테마 수정
  updateThemeColor: async (workspaceId: string, themeColor: ThemeColor): Promise<void> => {
    const { error } = await supabase
      .from("workspaces")
      .update({ theme_color: themeColor })
      .eq("id", workspaceId);
    if (error) throw error;
  },

  // 초대 코드 생성 (DB에 기록 후 코드 반환)
  createInviteCode: async (workspaceId: string, userId: string): Promise<string> => {
    const code = crypto.randomUUID().replace(/-/g, "").slice(0, INVITE_CODE_LENGTH);
    const expiresAt = new Date(Date.now() + INVITE_CODE_TTL_MS).toISOString();

    const { error } = await supabase.from("workspace_invites").insert({
      workspace_id: workspaceId,
      invite_code: code,
      created_by: userId,
      expires_at: expiresAt,
    });
    if (error) throw error;
    return code;
  },

  // 워크스페이스 나가기 (본인 멤버 row 삭제)
  leave: async (workspaceId: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId);
    if (error) throw error;
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
