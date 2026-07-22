import { memo, useMemo } from "react";

import { Spinner } from "@/components/feedback/Spinner";
import { MessageBubble } from "@/features/chat/components/MessageBubble";
import { UNKNOWN_SENDER_NAME } from "@/features/chat/constants/chat";

import styles from "./MessageList.module.scss";

import type { ChatMessage } from "@/features/chat/types/chat";
import type { WorkspaceMember } from "@/features/workspace/types/workspace";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean; // 메시지 목록 로딩 여부(true면 스피너 표시)
  isError?: boolean; // 메시지 목록 조회 실패 여부(true면 에러 안내 표시)
  // 그룹 워크스페이스에서 메시지별 실제 발신자 이름·아바타를 조회하기 위한 멤버 목록(couple에선 partner 하나만 있어도 무방)
  members?: WorkspaceMember[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

/** 같은 발신자가 같은 분(time 문자열 동일)에 연속으로 보낸 메시지인지 판별(카카오톡 스타일 묶음 판단용) */
const isSameGroup = (a: ChatMessage, b: ChatMessage) =>
  a.senderId === b.senderId && a.time === b.time;

// 입력바 텍스트 변경 등 부모(ChatView) 리렌더 시 messages 참조가 그대로면 메시지 목록 재계산을 건너뛴다
const MessageListComponent = ({
  messages,
  isLoading = false,
  isError = false,
  members,
  bottomRef,
  className,
}: MessageListProps) => {
  // 발신자 id -> 멤버 조회 맵(그룹 워크스페이스에서 상대 메시지별 이름·아바타를 정확히 표시하기 위함)
  const memberMap = useMemo(() => new Map(members?.map((m) => [m.id, m])), [members]);

  if (isError) {
    return (
      <div className={className}>
        <p className={styles.errorText}>메시지를 불러오지 못했습니다.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className={className}>
      {messages.map((msg, index) => {
        const prev = messages[index - 1];
        const next = messages[index + 1];
        const isFirstInGroup = !prev || !isSameGroup(prev, msg);
        const isLastInGroup = !next || !isSameGroup(next, msg);
        const senderMember = memberMap.get(msg.senderId);

        return (
          <MessageBubble
            key={msg.id}
            text={msg.text}
            sender={msg.sender}
            time={msg.time}
            avatar={msg.sender === "partner" ? senderMember?.avatar : undefined}
            name={
              msg.sender === "partner" ? (senderMember?.name ?? UNKNOWN_SENDER_NAME) : undefined
            }
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
