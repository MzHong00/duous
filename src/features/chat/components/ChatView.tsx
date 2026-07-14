"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ChatHeader } from "@/features/chat/components/ChatHeader";
import { MessageList } from "@/features/chat/components/MessageList";
import { ChatInput } from "@/features/chat/components/ChatInput";
import { useChatPartner } from "@/features/chat/hooks/useChatPartner";
import { useChatMessages } from "@/features/chat/hooks/useChatMessages";
import { useChatViewport } from "@/features/chat/hooks/useChatViewport";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { authQueries } from "@/features/auth/queries/authQueries";

import styles from "./ChatView.module.scss";

export const ChatView = () => {
  const [inputText, setInputText] = useState(""); // 입력바 텍스트
  const { currentWorkspace } = useCurrentWorkspace();
  const { data: user } = useQuery(authQueries.user());
  const partner = useChatPartner();
  const { messages, isLoading, isError, sendMessage } = useChatMessages(
    currentWorkspace?.id ?? "",
    user?.id ?? ""
  );
  const { bottomRef } = useChatViewport(messages);

  /** 현재 입력값을 전송하고 입력바를 비운다 (전송 실패 시 입력값 복원) */
  const handleSend = () => {
    const textToSend = inputText;
    sendMessage(textToSend, () => setInputText(textToSend));
    setInputText("");
  };

  return (
    <div className={styles.page}>
      <div className={styles.board}>
        <ChatHeader partnerName={partner.name} partnerAvatar={partner.avatar} />

        <MessageList
          messages={messages}
          isLoading={isLoading}
          isError={isError}
          partnerName={partner.name}
          partnerAvatar={partner.avatar}
          members={currentWorkspace?.members}
          bottomRef={bottomRef}
          className={styles.messages}
        />

        <div className={styles.inputArea}>
          <ChatInput value={inputText} onChange={setInputText} onSend={handleSend} />
        </div>
      </div>
    </div>
  );
};
