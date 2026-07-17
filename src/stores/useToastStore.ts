"use client";
import { create } from "zustand";
import type { ToastType } from "@/types/toast";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: ToastItem[];
}

const TOAST_DURATION_MS = 3000; // 토스트 자동 제거까지의 시간(ms)

const toastStore = create<ToastState>()(() => ({ toasts: [] }));

/** 토스트 상태 셀렉터 훅 */
export const useToastStore = <T>(selector: (state: ToastState) => T) => toastStore(selector);

export const toastActions = {
  /** 토스트를 추가하고 TOAST_DURATION_MS 후 자동 제거한다 */
  showToast: (message: string, type: ToastType = "info") => {
    const id = `toast-${crypto.randomUUID()}`;
    toastStore.setState((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      toastStore.setState((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, TOAST_DURATION_MS);
  },
  /** id로 토스트를 즉시 제거한다 */
  removeToast: (id: string) => {
    toastStore.setState((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
};
