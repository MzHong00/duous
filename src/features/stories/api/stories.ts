import { supabase } from "@/lib/supabase/client";
import { rowToStory } from "@/features/stories/utils/storyUtils";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Story } from "@/features/stories/types/story";
import type { StoryRow } from "@/features/stories/utils/storyUtils";

export const storiesApi = {
  // client 미지정 시 브라우저 클라이언트 사용 — 서버 prefetch에서는 서버 클라이언트 주입
  list: async (workspaceId: string, client: SupabaseClient = supabase): Promise<Story[]> => {
    const { data, error } = await client
      .from("stories")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("date", { ascending: false });
    if (error) throw error;
    return (data as StoryRow[]).map(rowToStory);
  },

  create: async (story: Omit<Story, "id">): Promise<Story> => {
    const { data, error } = await supabase
      .from("stories")
      .insert({
        workspace_id: story.workspaceId,
        user_id: story.userId,
        title: story.title,
        description: story.description,
        date: story.date,
        thumbnail_url: story.thumbnailUrl,
        path: story.path,
        path_color: story.pathColor,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToStory(data as StoryRow);
  },

  update: async (
    id: string,
    data: Partial<
      Pick<Story, "title" | "description" | "date" | "thumbnailUrl" | "path" | "pathColor">
    >
  ): Promise<Story> => {
    const { data: updated, error } = await supabase
      .from("stories")
      .update({
        title: data.title,
        description: data.description,
        date: data.date,
        thumbnail_url: data.thumbnailUrl,
        path: data.path,
        path_color: data.pathColor,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return rowToStory(updated as StoryRow);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("stories").delete().eq("id", id);
    if (error) throw error;
  },
};
