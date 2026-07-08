"use client";
import { memo } from "react";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ProfileImage } from "@/components/ProfileImage";
import { PARTNER_AVATAR_SIZE } from "@/features/chat/constants/chat";

import styles from "./ChatHeader.module.scss";

interface ChatHeaderProps {
  partnerName: string;
  partnerAvatar?: string;
}

// 입력바 텍스트 변경 등 부모(ChatView) 리렌더 시 props 참조가 그대로면 재렌더를 건너뛴다
const ChatHeaderComponent = ({ partnerName, partnerAvatar }: ChatHeaderProps) => {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <button onClick={() => router.back()} className={styles.backButton} aria-label="뒤로 가기">
        <ChevronLeft size={24} />
      </button>
      <div className={styles.headerInfo}>
        <ProfileImage uri={partnerAvatar} name={partnerName} size={PARTNER_AVATAR_SIZE} />
        <div>
          <p className={styles.partnerName}>{partnerName}</p>
        </div>
      </div>
      <div className={styles.headerRight} />
    </header>
  );
};

export const ChatHeader = memo(ChatHeaderComponent);
ChatHeader.displayName = "ChatHeader";
