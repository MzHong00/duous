import { memo } from "react";

import { MessageBubble } from "@/features/chat/components/MessageBubble";

import type { ChatMessage } from "@/features/chat/types/chat";

interface MessageListProps {
  messages: ChatMessage[];
  partnerName: string;
  partnerAvatar?: string;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

// 입력바 텍스트 변경 등 부모(ChatView) 리렌더 시 messages 참조가 그대로면 메시지 목록 재계산을 건너뛴다
const MessageListComponent = ({
  messages,
  partnerName,
  partnerAvatar,
  bottomRef,
  className,
}: MessageListProps) => {
  return (
    <div className={className}>
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          text={msg.text}
          sender={msg.sender}
          time={msg.time}
          avatar={msg.sender === "partner" ? partnerAvatar : undefined}
          name={msg.sender === "partner" ? partnerName : undefined}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export const MessageList = memo(MessageListComponent);
MessageList.displayName = "MessageList";
