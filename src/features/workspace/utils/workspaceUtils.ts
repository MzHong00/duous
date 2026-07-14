import { ROUTES } from "@/constants/routes";

import type { RoomType, ThemeColor, Workspace } from "@/features/workspace/types/workspace";

export interface WorkspaceRow {
  id: string;
  name: string;
  type: RoomType;
  start_date?: string;
  background_image?: string;
  created_by: string;
  theme_color: ThemeColor;
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
  themeColor: row.theme_color,
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

// 워크스페이스별 themeColor를 실제 액센트 색상값으로 매핑 (globals.scss의 --theme-accent 값과 동일하게 유지)
export const WORKSPACE_THEME_ACCENT: Record<ThemeColor, string> = {
  pink: "#ec4899",
  blue: "#38bdf8",
  twilight: "#fb7185",
  yellow: "#facc15",
  green: "#4ade80",
};
