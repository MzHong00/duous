"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { authQueries } from "@/features/auth/queries/authQueries";
import { authApi } from "@/features/auth/api/auth";
import { workspaceActions } from "@/features/workspace/stores/useWorkspaceStore";

import { modalActions } from "@/stores/useModalStore";
import { toastActions } from "@/stores/useToastStore";
import { ROUTES } from "@/constants/routes";

import type { ChangeEvent, ReactNode } from "react";
import type { User } from "@/types/user";

interface UseProfileSettingsResult {
  /** 이름 수정 모달을 띄운다 */
  openEditNameModal: (currentName: string, content: ReactNode, getName: () => string) => void;
  /** 파일 선택 이벤트로 프로필 사진을 교체한다 */
  changePhoto: (event: ChangeEvent<HTMLInputElement>) => void;
  /** 로그아웃 확인 모달을 띄운다 */
  confirmLogout: () => void;
}

/**
 * 설정 화면의 사용자 변경·로그아웃 로직을 담당한다.
 * 사용자 캐시 갱신, 모달/토스트, 세션 정리 등 비-UI 책임을 컴포넌트에서 분리한다.
 */
export const useProfileSettings = (): UseProfileSettingsResult => {
  const router = useRouter();
  const queryClient = useQueryClient();

  /** 사용자 쿼리 캐시를 부분 갱신한다 */
  const updateUserCache = useCallback(
    (updates: Partial<User>) => {
      queryClient.setQueryData(authQueries.user().queryKey, (prev: User | null | undefined) =>
        prev ? { ...prev, ...updates } : prev
      );
    },
    [queryClient]
  );

  const openEditNameModal = useCallback(
    (currentName: string, content: ReactNode, getName: () => string) => {
      modalActions.showModal({
        type: "confirm",
        title: "이름 수정",
        confirmText: "변경하기",
        content,
        onConfirm: () => {
          const nextName = getName().trim();
          if (nextName) {
            updateUserCache({ name: nextName });
            toastActions.showToast("이름이 성공적으로 변경되었습니다", "success");
          }
        },
      });
    },
    [updateUserCache]
  );

  const changePhoto = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      updateUserCache({ profileImage: url });
      toastActions.showToast("프로필 사진이 변경되었습니다", "success");
    },
    [updateUserCache]
  );

  const confirmLogout = useCallback(() => {
    modalActions.showModal({
      type: "confirm",
      title: "로그아웃",
      message: "정말 로그아웃 하시겠어요?",
      onConfirm: async () => {
        await authApi.signOut();
        workspaceActions.clearData();
        queryClient.clear();
        router.replace(ROUTES.LOGIN.path);
      },
    });
  }, [queryClient, router]);

  return { openEditNameModal, changePhoto, confirmLogout };
};
