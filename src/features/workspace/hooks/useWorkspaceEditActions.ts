"use client";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { modalActions } from "@/stores/useModalStore";
import { toastActions } from "@/stores/useToastStore";
import { authQueries } from "@/features/auth/queries/authQueries";
import { workspaceActions } from "@/features/workspace/stores/useWorkspaceStore";
import {
  useUpdateWorkspaceNameMutation,
  useUpdateWorkspaceStartDateMutation,
  useUpdateWorkspaceMemberMutation,
  useLeaveWorkspaceMutation,
  useCreateInviteCodeMutation,
} from "@/features/workspace/queries/workspaceMutations";

/**
 * 라이프룸 설정 화면(WorkspaceEditView)의 수정·나가기·초대 액션을 담당하는 훅.
 * 각 액션은 뮤테이션 호출과 실패 시 에러 알림까지 책임지며, 컴포넌트는 모달 UI 구성만 담당한다.
 */
export const useWorkspaceEditActions = (workspaceId: string) => {
  const router = useRouter();
  const { data: user } = useQuery(authQueries.user());
  const updateName = useUpdateWorkspaceNameMutation();
  const updateStartDate = useUpdateWorkspaceStartDateMutation();
  const updateMember = useUpdateWorkspaceMemberMutation();
  const leaveWorkspace = useLeaveWorkspaceMutation();
  const createInviteCode = useCreateInviteCodeMutation();

  /** 라이프룸 제목을 수정한다 */
  const changeName = async (name: string) => {
    try {
      await updateName.mutateAsync({ workspaceId, name });
    } catch {
      modalActions.showModal({
        type: "alert",
        title: "오류",
        message: "제목 수정에 실패했습니다.",
      });
    }
  };

  /** 함께한 날(시작일)을 수정한다 */
  const changeStartDate = async (startDate: string) => {
    try {
      await updateStartDate.mutateAsync({ workspaceId, startDate });
    } catch {
      modalActions.showModal({
        type: "alert",
        title: "오류",
        message: "날짜 수정에 실패했습니다.",
      });
    }
  };

  /** 내 활동 프로필(표시 이름)을 수정한다 */
  const changeProfileName = async (name: string) => {
    if (!user) return;
    try {
      await updateMember.mutateAsync({
        workspaceId,
        userId: user.id,
        updates: { display_name: name },
      });
    } catch {
      modalActions.showModal({
        type: "alert",
        title: "오류",
        message: "프로필 수정에 실패했습니다.",
      });
    }
  };

  /** 초대 링크를 생성해 클립보드에 복사한다 */
  const invite = async () => {
    if (!user) return;
    try {
      const code = await createInviteCode.mutateAsync({ workspaceId, userId: user.id });
      const link = `${window.location.origin}${ROUTES.WORKSPACE.join(code)}`;
      await navigator.clipboard.writeText(link);
      toastActions.showToast("초대 링크를 복사했어요. 파트너에게 공유해보세요.", "success");
    } catch {
      toastActions.showToast("초대 링크 생성에 실패했어요.", "error");
    }
  };

  /** 라이프룸에서 나가고 목록 화면으로 이동한다 */
  const leave = async () => {
    if (!user) return;
    try {
      await leaveWorkspace.mutateAsync({ workspaceId, userId: user.id });
      workspaceActions.setCurrentWorkspaceId(null);
      router.replace(ROUTES.WORKSPACE.LIST.path);
    } catch {
      modalActions.showModal({ type: "alert", title: "오류", message: "나가기에 실패했습니다." });
    }
  };

  return {
    user,
    isInviting: createInviteCode.isPending,
    changeName,
    changeStartDate,
    changeProfileName,
    invite,
    leave,
  };
};
