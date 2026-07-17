import { supabase } from "@/lib/supabase/client";
import { formatChatTime } from "@/utils/date";
import { ApiError } from "@/lib/errors/apiError";

import type { ChatMessage } from "@/features/chat/types/chat";

interface MessageRow {
  id: string;
  workspace_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

/** DB row를 뷰어(userId) 관점의 ChatMessage로 변환한다 */
export const rowToChatMessage = (row: MessageRow, userId: string): ChatMessage => ({
  id: row.id,
  text: row.text,
  sender: row.sender_id === userId ? "me" : "partner",
  senderId: row.sender_id,
  time: formatChatTime(row.created_at),
});

export const chatApi = {
  // 워크스페이스의 메시지 목록 (오래된 순)
  list: async (workspaceId: string, userId: string): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });
    if (error) throw new ApiError("메시지 목록 조회에 실패했습니다.", error);
    return (data as MessageRow[]).map((row) => rowToChatMessage(row, userId));
  },

  // 메시지 전송 (실시간 반영은 구독이 담당)
  send: async (workspaceId: string, senderId: string, text: string): Promise<void> => {
    const { error } = await supabase
      .from("messages")
      .insert({ workspace_id: workspaceId, sender_id: senderId, text });
    if (error) throw new ApiError("메시지 전송에 실패했습니다.", error);
  },
};

export type { MessageRow };
