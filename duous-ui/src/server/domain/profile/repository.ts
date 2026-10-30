import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileUpsertInputDto } from "@/server/domain/profile/dto";

export const profileRepository = {
  /** 세션 사용자의 프로필(이름·사진)을 가져온다 */
  findById: (supabase: SupabaseClient, userId: string) =>
    supabase
      .from("profiles")
      .select("name, avatar_url, main_workspace_id")
      .eq("id", userId)
      .maybeSingle(),

  /** 프로필이 없으면 생성한다 (이미 있으면 무시) */
  createIfNotExists: (supabase: SupabaseClient, userId: string, input: ProfileUpsertInputDto) =>
    supabase
      .from("profiles")
      .upsert(
        { id: userId, name: input.name, avatar_url: input.avatarUrl },
        { onConflict: "id", ignoreDuplicates: true }
      ),

  /**
   * 메인 라이프룸이 지정한 워크스페이스라면 해제한다 (탈퇴로 더 이상 접근할 수 없게 된 경우).
   * 워크스페이스가 통째로 삭제되는 경우는 main_workspace_id의 ON DELETE SET NULL이 처리하므로 호출하지 않는다.
   */
  clearMainWorkspaceIfMatches: (supabase: SupabaseClient, userId: string, workspaceId: string) =>
    supabase
      .from("profiles")
      .update({ main_workspace_id: null })
      .eq("id", userId)
      .eq("main_workspace_id", workspaceId),

  /** 프로필을 수정한다 (변경된 필드만 upsert) */
  update: (supabase: SupabaseClient, userId: string, input: ProfileUpsertInputDto) =>
    supabase.from("profiles").upsert({
      id: userId,
      ...(input.name !== undefined && { name: input.name }),
      ...(input.avatarUrl !== undefined && { avatar_url: input.avatarUrl }),
      ...(input.mainWorkspaceId !== undefined && { main_workspace_id: input.mainWorkspaceId }),
    }),
};
