import { supabase } from "@/lib/supabase/client";

const BUCKET = "memories";

export const storageApi = {
  uploadImage: async (file: File, userId: string): Promise<string> => {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  deleteImage: async (publicUrl: string): Promise<void> => {
    // publicUrl 에서 path 추출: .../memories/<path> → <path>
    const parts = publicUrl.split(`/${BUCKET}/`);
    if (parts.length < 2) return;
    const path = parts[1];
    await supabase.storage.from(BUCKET).remove([path]);
  },
};
