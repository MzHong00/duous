"use client";
import { useState } from "react";
import { Check, AlertCircle, Info, AlertTriangle } from "lucide-react";

import { useToastStore, toastActions } from "@/stores/useToastStore";
import { ICON_SIZE } from "@/constants/style";

import styles from "./Toast.module.scss";

/** 토스트 타입별 아이콘 매핑 */
const TOAST_ICONS = {
  success: Check,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const POP_DURATION_MS = 150; // 클릭 시 pop-out 애니메이션 재생 시간(ms), removeToast 호출 전 대기

export const Toast = () => {
  const toast = useToastStore((s) => s.toast);
  const [isPopping, setIsPopping] = useState(false);

  if (!toast) return null;

  const Icon = TOAST_ICONS[toast.type];

  /** 토스트 클릭 시 pop 애니메이션을 재생한 뒤 제거한다 */
  const handleClick = () => {
    setIsPopping(true);
    setTimeout(() => toastActions.removeToast(toast.id), POP_DURATION_MS);
  };

  return (
    <div className={styles.container}>
      <button
        key={toast.id}
        type="button"
        className={styles.toast}
        data-type={toast.type}
        data-popping={isPopping}
        onClick={handleClick}
      >
        <span className={styles.iconWrap}>
          <Icon size={ICON_SIZE.md} className={styles.icon} />
        </span>
        <span className={styles.message}>{toast.message}</span>
      </button>
    </div>
  );
};
