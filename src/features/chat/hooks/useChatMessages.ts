import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase/client";
import { rowToChatMessage } from "@/features/chat/api/chat";
import { chatQueries } from "@/features/chat/queries/chatQueries";
import { useSendMessageMutation } from "@/features/chat/queries/chatMutations";
import { toastActions } from "@/stores/useToastStore";

import type { MessageRow } from "@/features/chat/api/chat";
import type { ChatMessage } from "@/features/chat/types/chat";

interface UseChatMessagesResult {
  messages: ChatMessage[];
  isLoading: boolean;
  /** 빈 문자열·공백은 무시하고, 내 메시지를 전송한다 (실시간 구독이 목록에 반영) */
  sendMessage: (text: string) => void;
}

/**
 * 워크스페이스 채팅 메시지 목록과 전송 로직을 제공한다.
 * 초기 목록은 쿼리로 불러오고, Supabase Realtime INSERT 구독으로 새 메시지를 실시간 반영한다.
 */
export const useChatMessages = (workspaceId: string, userId: string): UseChatMessagesResult => {
  const queryClient = useQueryClient();
  const listQuery = chatQueries.list(workspaceId, userId);
  const { data: messages = [], isLoading } = useQuery(listQuery);
  const sendMutation = useSendMessageMutation();

  // Realtime: 이 워크스페이스의 messages INSERT를 구독해 캐시에 append
  useEffect(() => {
    if (!workspaceId || !userId) return;

    const channel = supabase
      .channel(`chat:${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          const message = rowToChatMessage(payload.new as MessageRow, userId);
          queryClient.setQueryData<ChatMessage[]>(listQuery.queryKey, (prev = []) =>
            prev.some((m) => m.id === message.id) ? prev : [...prev, message]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, userId, queryClient, listQuery.queryKey]);

  /** 입력 텍스트를 검증해 전송한다 */
  const sendMessage = (text: string) => {
    if (!text.trim() || !workspaceId || !userId) return;
    sendMutation.mutate(
      { workspaceId, senderId: userId, text: text.trim() },
      { onError: () => toastActions.showToast("메시지 전송에 실패했어요.", "error") }
    );
  };

  return { messages, isLoading, sendMessage };
};
