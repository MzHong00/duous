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

/** 같은 발신자가 같은 분(time 문자열 동일)에 연속으로 보낸 메시지인지 판별(카카오톡 스타일 묶음 판단용) */
const isSameGroup = (a: ChatMessage, b: ChatMessage) => a.sender === b.sender && a.time === b.time;

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
      {messages.map((msg, index) => {
        const prev = messages[index - 1];
        const next = messages[index + 1];
        const isFirstInGroup = !prev || !isSameGroup(prev, msg);
        const isLastInGroup = !next || !isSameGroup(next, msg);

        return (
          <MessageBubble
            key={msg.id}
            text={msg.text}
            sender={msg.sender}
            time={msg.time}
            avatar={msg.sender === "partner" ? partnerAvatar : undefined}
            name={msg.sender === "partner" ? partnerName : undefined}
            isFirstInGroup={isFirstInGroup}
            isLastInGroup={isLastInGroup}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export const MessageList = memo(MessageListComponent);
MessageList.displayName = "MessageList";
