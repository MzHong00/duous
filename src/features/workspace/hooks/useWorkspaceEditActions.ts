"use client";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { buildInviteLink } from "@/features/workspace/utils/workspaceUtils";
import { modalActions } from "@/stores/useModalStore";
import { toastActions } from "@/stores/useToastStore";
import { authQueries } from "@/features/auth/queries/authQueries";
import { workspaceActions } from "@/features/workspace/stores/useWorkspaceStore";
import {
  useUpdateWorkspaceNameMutation,
  useUpdateWorkspaceStartDateMutation,
  useUpdateWorkspaceThemeMutation,
  useUpdateWorkspaceMemberMutation,
  useLeaveWorkspaceMutation,
  useCreateInviteCodeMutation,
} from "@/features/workspace/queries/workspaceMutations";

import type { ThemeColor } from "@/features/workspace/types/workspace";

/**
 * 라이프룸 설정 화면(WorkspaceEditView)의 수정·나가기·초대 액션을 담당하는 훅.
 * 각 액션은 뮤테이션 호출과 실패 시 에러 알림까지 책임지며, 컴포넌트는 모달 UI 구성만 담당한다.
 */
export const useWorkspaceEditActions = (workspaceId: string) => {
  const router = useRouter();
  const { data: user } = useQuery(authQueries.user());
  const updateName = useUpdateWorkspaceNameMutation();
  const updateStartDate = useUpdateWorkspaceStartDateMutation();
  const updateTheme = useUpdateWorkspaceThemeMutation();
  const updateMember = useUpdateWorkspaceMemberMutation();
  const leaveWorkspace = useLeaveWorkspaceMutation();
  const createInviteCode = useCreateInviteCodeMutation();

  /** 액션을 실행하고 실패 시 오류 알림 모달을 띄운다 (수정 계열 액션 공통 에러 처리) */
  const runWithErrorAlert = async (action: () => Promise<unknown>, errorMessage: string) => {
    try {
      await action();
    } catch {
      modalActions.showModal({ type: "alert", title: "오류", message: errorMessage });
    }
  };

  /** 라이프룸 제목을 수정한다 */
  const changeName = (name: string) =>
    runWithErrorAlert(
      () => updateName.mutateAsync({ workspaceId, name }),
      "제목 수정에 실패했습니다."
    );

  /** 함께한 날(시작일)을 수정한다 */
  const changeStartDate = (startDate: string) =>
    runWithErrorAlert(
      () => updateStartDate.mutateAsync({ workspaceId, startDate }),
      "날짜 수정에 실패했습니다."
    );

  /** 워크스페이스 전역 색상 테마를 수정한다 */
  const changeThemeColor = (themeColor: ThemeColor) =>
    runWithErrorAlert(
      () => updateTheme.mutateAsync({ workspaceId, themeColor }),
      "테마 수정에 실패했습니다."
    );

  /** 내 활동 프로필(표시 이름)을 수정한다 */
  const changeProfileName = async (name: string) => {
    if (!user) return;
    await runWithErrorAlert(
      () =>
        updateMember.mutateAsync({ workspaceId, userId: user.id, updates: { display_name: name } }),
      "프로필 수정에 실패했습니다."
    );
  };

  /** 초대 링크를 생성해 클립보드에 복사한다 */
  const invite = async () => {
    if (!user) return;
    try {
      const code = await createInviteCode.mutateAsync({ workspaceId, userId: user.id });
      await navigator.clipboard.writeText(buildInviteLink(code));
      toastActions.showToast("초대 링크를 복사했어요. 파트너에게 공유해보세요.", "success");
    } catch {
      toastActions.showToast("초대 링크 생성에 실패했어요.", "error");
    }
  };

  /** 라이프룸에서 나가고 목록 화면으로 이동한다 */
  const leave = async () => {
    if (!user) return;
    await runWithErrorAlert(async () => {
      await leaveWorkspace.mutateAsync({ workspaceId, userId: user.id });
      workspaceActions.setCurrentWorkspaceId(null);
      router.replace(ROUTES.WORKSPACE.LIST.path);
    }, "나가기에 실패했습니다.");
  };

  return {
    user,
    isInviting: createInviteCode.isPending,
    changeName,
    changeStartDate,
    changeThemeColor,
    changeProfileName,
    invite,
    leave,
  };
};
