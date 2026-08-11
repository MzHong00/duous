import type { ChatMessage } from "@/features/chat/types/chat";

export interface MessageRow {
  id: string;
  workspace_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

/**
 * DB row를 뷰어(userId) 관점의 ChatMessage로 변환한다 (Realtime 구독·API Route에서 공용).
 * createdAt은 원본 ISO 문자열을 그대로 담는다 — 표시용 시각 포맷은 뷰어 타임존에 의존하므로 렌더 시점에서 수행한다.
 */
export const rowToChatMessage = (row: MessageRow, userId: string): ChatMessage => ({
  id: row.id,
  text: row.text,
  sender: row.sender_id === userId ? "me" : "partner",
  senderId: row.sender_id,
  createdAt: row.created_at,
});
