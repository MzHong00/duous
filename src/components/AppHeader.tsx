"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { cx } from "@/utils/cn";

import styles from "./AppHeader.module.scss";

interface AppHeaderProps {
  title?: string;
  isBackVisible?: boolean; // 뒤로가기 버튼 노출 여부
  rightElement?: React.ReactNode;
  /** 뒤로가기 클릭 핸들러. 미지정 시 router.back() */
  onBack?: () => void;
  isTransparent?: boolean; // 헤더 배경 투명 여부
}

export const AppHeader = ({
  title,
  isBackVisible = true,
  rightElement,
  onBack,
  isTransparent = true,
}: AppHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className={cx(styles.header, isTransparent && styles.transparent)}>
      {isBackVisible ? (
        <button onClick={handleBack} className={styles.backButton}>
          <ChevronLeft size={24} />
        </button>
      ) : (
        <div className={styles.placeholder} />
      )}

      {title && <h1 className={styles.title}>{title}</h1>}

      <div className={styles.right}>{rightElement}</div>
    </header>
  );
};
