"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { ProfileImage } from "@/components/ProfileImage";
import { PARTNER_AVATAR_SIZE } from "@/features/chat/constants/chat";

import styles from "./ChatHeader.module.scss";

interface ChatHeaderProps {
  partnerName: string;
  partnerAvatar?: string;
}

export const ChatHeader = ({ partnerName, partnerAvatar }: ChatHeaderProps) => {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <button onClick={() => router.back()} className={styles.backButton}>
        <ChevronLeft size={24} />
      </button>
      <div className={styles.headerInfo}>
        <ProfileImage uri={partnerAvatar} name={partnerName} size={PARTNER_AVATAR_SIZE} />
        <div>
          <p className={styles.partnerName}>{partnerName}</p>
          <p className={styles.onlineStatus}>현재 활동 중</p>
        </div>
      </div>
      <div className={styles.headerRight} />
    </header>
  );
};
