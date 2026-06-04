import { supabase } from "@/shared/lib/supabase";
import type { Story, LocationPoint } from "@/features/stories/types/story";

interface StoryRow {
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

const rowToStory = (row: StoryRow): Story => ({
  id: row.id,
  title: row.title,
  description: row.description,
  date: row.date,
  thumbnailUrl: row.thumbnail_url,
  path: row.path ?? [],
  pathColor: row.path_color ?? "#3182F6",
  userId: row.user_id,
  workspaceId: row.workspace_id,
});

export const storiesApi = {
  list: async (workspaceId: string): Promise<Story[]> => {
    const { data, error } = await supabase
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
    data: Partial<Pick<Story, "title" | "description" | "thumbnailUrl" | "path" | "pathColor">>
  ): Promise<Story> => {
    const { data: updated, error } = await supabase
      .from("stories")
      .update({
        title: data.title,
        description: data.description,
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
