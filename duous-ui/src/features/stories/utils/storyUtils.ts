import { PATH_COLORS } from "@/constants/theme";

import type { Story, LocationPoint } from "@/features/stories/types/story";

export interface StoryRow {
  id: string;
  workspace_id: string;
  user_id: string;
  title?: string;
  description?: string;
  date: string;
  thumbnail_url?: string;
  path: LocationPoint[];
  path_color: string;
}

/** Supabase row를 앱의 Story 타입으로 변환한다 */
export const rowToStory = (row: StoryRow): Story => ({
  id: row.id,
  title: row.title,
  description: row.description,
  date: row.date,
  thumbnailUrl: row.thumbnail_url,
  path: row.path ?? [],
  pathColor: row.path_color ?? PATH_COLORS[0],
  userId: row.user_id,
  workspaceId: row.workspace_id,
});
