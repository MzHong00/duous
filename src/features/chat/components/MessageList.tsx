import { memo, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { Spinner } from "@/components/feedback/Spinner";
import { isSameMinute } from "@/utils/date";
import { MessageBubble } from "@/features/chat/components/MessageBubble";
import { UNKNOWN_SENDER_NAME } from "@/features/chat/constants/chat";

import styles from "./MessageList.module.scss";

import type { ChatMessage } from "@/features/chat/types/chat";
import type { WorkspaceMember } from "@/features/workspace/types/workspace";

const ESTIMATED_MESSAGE_HEIGHT_PX = 56; // 가상화 초기 높이 추정치(실제 높이는 렌더 후 measureElement로 보정)
const VIRTUAL_OVERSCAN_COUNT = 8; // 화면 밖에 미리 렌더링해둘 메시지 개수(빠른 스크롤 시 빈 공간 방지)

interface MessageListProps {
  messages: ChatMessage[];
  userId: string; // 뷰어의 사용자 id(메시지별 내 메시지 여부 판별 기준)
  isLoading?: boolean; // 메시지 목록 로딩 여부(true면 스피너 표시)
  isError?: boolean; // 메시지 목록 조회 실패 여부(true면 에러 안내 표시)
  // 그룹 워크스페이스에서 메시지별 실제 발신자 이름·아바타를 조회하기 위한 멤버 목록(couple에선 partner 하나만 있어도 무방)
  members?: WorkspaceMember[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

/** 같은 발신자가 같은 분에 연속으로 보낸 메시지인지 판별(카카오톡 스타일 묶음 판단용 · 목록 경계에선 a가 없어 false) */
const isSameGroup = (a: ChatMessage | undefined, b: ChatMessage) =>
  !!a && a.senderId === b.senderId && isSameMinute(a.createdAt, b.createdAt);

// 입력바 텍스트 변경 등 부모(ChatView) 리렌더 시 messages 참조가 그대로면 메시지 목록 재계산을 건너뛴다
const MessageListComponent = ({
  messages,
  userId,
  isLoading = false,
  isError = false,
  members,
  bottomRef,
  className,
}: MessageListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // 발신자 id -> 멤버 조회 맵(그룹 워크스페이스에서 상대 메시지별 이름·아바타를 정확히 표시하기 위함)
  const memberMap = useMemo(() => new Map(members?.map((m) => [m.id, m])), [members]);

  // 대량 메시지 렌더링 성능을 위해 화면에 보이는 항목만 DOM에 그린다(리스트 가상화)
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Virtual은 메모이즈 불가능한 함수를 반환하는 라이브러리 특성상 발생하는 경고(로직 문제 아님)
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_MESSAGE_HEIGHT_PX,
    overscan: VIRTUAL_OVERSCAN_COUNT,
    getItemKey: (index) => messages[index].id,
  });

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
    <div ref={parentRef} className={className}>
      {/* height·transform은 가상화가 매 스크롤마다 계산하는 동적 값이라 CSS Modules로 옮길 수 없는 인라인 style 예외 */}
      <div className={styles.virtualSizer} style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map(({ index, start }) => {
          const msg = messages[index];
          const isMine = msg.senderId === userId; // 내가 보낸 메시지인지
          const senderMember = isMine ? undefined : memberMap.get(msg.senderId); // 상대 메시지에만 발신자 아바타·이름을 표시

          return (
            <div
              key={msg.id}
              ref={virtualizer.measureElement}
              data-index={index}
              className={styles.virtualItem}
              style={{ transform: `translateY(${start}px)` }}
            >
              <MessageBubble
                text={msg.text}
                isMine={isMine}
                createdAt={msg.createdAt}
                avatar={senderMember?.avatar}
                name={isMine ? undefined : (senderMember?.name ?? UNKNOWN_SENDER_NAME)}
                isFirstInGroup={!isSameGroup(messages[index - 1], msg)}
                isLastInGroup={!isSameGroup(messages[index + 1], msg)}
              />
            </div>
          );
        })}
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

export const MessageList = memo(MessageListComponent);
MessageList.displayName = "MessageList";
