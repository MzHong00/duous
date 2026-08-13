import type { ChatMessage } from "@/features/chat/types/chat";

export interface MessageRow {
  id: string;
  workspace_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

/**
 * DB row를 ChatMessage로 변환한다 (Realtime 구독·API Route에서 공용).
 * 뷰어에 따라 달라지는 값(내 메시지 여부·시각 표기)은 담지 않고 렌더 시점에서 계산한다.
 */
export const rowToChatMessage = (row: MessageRow): ChatMessage => ({
  id: row.id,
  text: row.text,
  senderId: row.sender_id,
  createdAt: row.created_at,
});
