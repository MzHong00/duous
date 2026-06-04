import type { ReactNode } from "react";

export interface ModalConfig {
  type: "alert" | "confirm";
  title: string;
  message?: string;
  content?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}
