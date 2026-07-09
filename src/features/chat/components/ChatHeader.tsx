"use client";
import { memo } from "react";

import { ProfileImage } from "@/components/ProfileImage";
import { PARTNER_AVATAR_SIZE } from "@/features/chat/constants/chat";

import styles from "./ChatHeader.module.scss";

interface ChatHeaderProps {
  partnerName: string;
  partnerAvatar?: string;
}

// 입력바 텍스트 변경 등 부모(ChatView) 리렌더 시 props 참조가 그대로면 재렌더를 건너뛴다
// GNB 최상위 탭 페이지이므로 서브 페이지 패턴(뒤로가기)이 아닌, 다른 탭과 동일한 프레임리스 헤더로 구성
const ChatHeaderComponent = ({ partnerName, partnerAvatar }: ChatHeaderProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerInfo}>
        <ProfileImage uri={partnerAvatar} name={partnerName} size={PARTNER_AVATAR_SIZE} />
        <p className={styles.partnerName}>{partnerName}</p>
      </div>
    </header>
  );
};

export const ChatHeader = memo(ChatHeaderComponent);
ChatHeader.displayName = "ChatHeader";
