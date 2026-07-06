"use client";
import { useToastStore } from "@/stores/useToastStore";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

import { cx } from "@/utils/cn";

import styles from "./Toast.module.scss";

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

export const Toast = () => {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div key={toast.id} className={cx(styles.toast, styles[toast.type])}>
            <Icon size={18} />
            <span className={styles.message}>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
