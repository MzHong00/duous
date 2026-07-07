import { ROUTES } from "@/constants/routes";

import type { RoomType, Workspace } from "@/features/workspace/types/workspace";

export interface WorkspaceRow {
  id: string;
  name: string;
  type: RoomType;
  start_date?: string;
  background_image?: string;
  created_by: string;
}

export interface MemberRow {
  user_id: string;
  display_name: string;
  email?: string;
  avatar_url?: string;
}

/** Supabase row + member row 배열을 앱의 Workspace 타입으로 변환한다 */
export const rowToWorkspace = (row: WorkspaceRow, members: MemberRow[]): Workspace => ({
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

/** 초대 코드로 참여 링크를 만든다 */
export const buildInviteLink = (code: string) =>
  `${window.location.origin}${ROUTES.WORKSPACE.join(code)}`;
