import { MessageBubble } from "@/features/chat/components/MessageBubble";

import type { ChatMessage } from "@/features/chat/types/chat";

interface MessageListProps {
  messages: ChatMessage[];
  partnerName: string;
  partnerAvatar?: string;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

export const MessageList = ({
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
