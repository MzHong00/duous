import "server-only";

import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import type { RoomType, Workspace, WorkspaceMember } from "@/features/workspace/types/workspace";

// select 시 DB 컬럼(snake_case) → 프론트 타입(camelCase)으로 alias
const WORKSPACE_COLUMNS =
  "id, name, type, startDate:start_date, backgroundImage:background_image, themeColor:theme_color";
const MEMBER_COLUMNS = "id:user_id, name:display_name, email, avatar:avatar_url";

interface NewMember {
  userId: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

type WorkspaceFields = Omit<Workspace, "members">; // WORKSPACE_COLUMNS로 select한 결과 모양
type MemberWithWorkspaceId = WorkspaceMember & { workspace_id: string }; // 목록 조회용: 소속 워크스페이스 식별자 포함

/** 특정 워크스페이스의 멤버 목록을 가져온다 */
const findMembers = async (
  supabase: SupabaseClient,
  workspaceId: string
): Promise<WorkspaceMember[]> => {
  const { data } = await supabase
    .from("workspace_members")
    .select(MEMBER_COLUMNS)
    .eq("workspace_id", workspaceId);
  return (data ?? []) as unknown as WorkspaceMember[];
};

export const workspaceRepository = {
  /** 워크스페이스 하나를 멤버 포함해서 가져온다 (참여/초대 조회 공용) */
  findById: async (
    supabase: SupabaseClient,
    workspaceId: string
  ): Promise<{ data: Workspace | null; error: PostgrestError | null }> => {
    const [{ data: ws, error }, members] = await Promise.all([
      supabase.from("workspaces").select(WORKSPACE_COLUMNS).eq("id", workspaceId).single(),
      findMembers(supabase, workspaceId),
    ]);
    if (error || !ws) return { data: null, error };

    return { data: { ...(ws as unknown as WorkspaceFields), members }, error: null };
  },

  /** 내가 속한 워크스페이스 전부를 멤버 포함해서 가져온다 */
  findManyByUserId: async (
    supabase: SupabaseClient,
    userId: string
  ): Promise<{ data: Workspace[]; error: PostgrestError | null }> => {
    const { data: memberRows, error: memberError } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId);
    if (memberError) return { data: [], error: memberError };

    const workspaceIds = memberRows?.map((r) => r.workspace_id) ?? [];
    if (workspaceIds.length === 0) return { data: [], error: null };

    // 워크스페이스와 멤버 목록은 서로 독립이므로 병렬 조회
    const [{ data: workspaces, error: wsError }, { data: members, error: membersError }] =
      await Promise.all([
        supabase.from("workspaces").select(WORKSPACE_COLUMNS).in("id", workspaceIds),
        supabase
          .from("workspace_members")
          .select(`workspace_id, ${MEMBER_COLUMNS}`)
          .in("workspace_id", workspaceIds),
      ]);
    if (wsError) return { data: [], error: wsError };
    if (membersError) return { data: [], error: membersError };

    const memberList = (members ?? []) as unknown as MemberWithWorkspaceId[];
    const data = (workspaces as unknown as WorkspaceFields[])?.map((ws) => ({
      ...ws,
      members: memberList.filter((m) => m.workspace_id === ws.id),
    }));
    return { data: data ?? [], error: null };
  },

  /** 워크스페이스를 생성한다 */
  create: async (
    supabase: SupabaseClient,
    input: { name: string; type: RoomType; startDate?: string; createdBy: string }
  ) =>
    supabase
      .from("workspaces")
      .insert({
        name: input.name,
        type: input.type,
        start_date: input.startDate || null,
        created_by: input.createdBy,
      })
      .select(WORKSPACE_COLUMNS)
      .single(),

  /** 멤버를 추가한다 (생성 시 본인 등록, 초대 참여 공용) */
  insertMember: async (supabase: SupabaseClient, workspaceId: string, member: NewMember) =>
    supabase.from("workspace_members").insert({
      workspace_id: workspaceId,
      user_id: member.userId,
      display_name: member.name,
      email: member.email,
      avatar_url: member.avatarUrl,
    }),

  /** 특정 사용자가 속한 모든 워크스페이스의 멤버 정보(이름·사진)를 동기화한다 */
  updateMemberProfile: async (
    supabase: SupabaseClient,
    userId: string,
    input: { name?: string; avatarUrl?: string }
  ) =>
    supabase
      .from("workspace_members")
      .update({
        ...(input.name !== undefined && { display_name: input.name }),
        ...(input.avatarUrl !== undefined && { avatar_url: input.avatarUrl }),
      })
      .eq("user_id", userId),
};
