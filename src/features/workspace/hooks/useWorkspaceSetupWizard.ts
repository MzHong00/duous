"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { APP_WORKSPACE } from "@/constants/config";
import { modalActions } from "@/stores/useModalStore";
import { getTodayDateString } from "@/utils/date";
import { authQueries } from "@/features/auth/queries/authQueries";
import { workspaceActions } from "@/features/workspace/stores/useWorkspaceStore";
import {
  useCreateWorkspaceMutation,
  useCreateInviteCodeMutation,
} from "@/features/workspace/queries/workspaceMutations";
import { toastActions } from "@/stores/useToastStore";
import { buildInviteLink } from "@/features/workspace/utils/workspaceUtils";

import type { RoomType } from "@/features/workspace/types/workspace";

type Step = "initial" | "create" | "invite"; // 위저드 최상위 단계
type CreateSubStep = "type" | "name"; // create 단계 내부 세부 단계

/**
 * 워크스페이스 생성 위저드의 상태·로직을 담당하는 커스텀 훅.
 * 단계 전환, 입력 상태, 생성/초대 뮤테이션 호출을 모두 캡슐화한다.
 */
export const useWorkspaceSetupWizard = () => {
  const router = useRouter();
  const { data: user } = useQuery(authQueries.user());
  const createWorkspace = useCreateWorkspaceMutation();
  const createInviteCode = useCreateInviteCodeMutation();

  const [step, setStep] = useState<Step>("initial"); // 현재 위저드 단계
  const [createSubStep, setCreateSubStep] = useState<CreateSubStep>("type"); // create 세부 단계
  const [roomType, setRoomType] = useState<RoomType>("couple"); // 선택한 워크스페이스 유형
  const [workspaceName, setWorkspaceName] = useState(""); // 입력한 워크스페이스 이름
  const [startDate, setStartDate] = useState(getTodayDateString()); // 시작일/만난 날짜
  const [isMain, setIsMain] = useState(true); // 메인 워크스페이스 설정 여부
  const [inviteCode, setInviteCode] = useState(""); // 생성된 초대 코드

  /** 유형 선택 → 이름 설정 세부 단계로 진입 */
  const goToNameStep = () => {
    setWorkspaceName("");
    setCreateSubStep("name");
  };

  /** 워크스페이스를 생성하고 초대 단계로 이동한다 */
  const completeCreate = async () => {
    if (!workspaceName.trim()) {
      modalActions.showModal({
        type: "alert",
        title: "알림",
        message: `${APP_WORKSPACE.KR} 이름을 입력해주세요.`,
      });
      return;
    }
    if (!user) return;

    try {
      const { workspace } = await createWorkspace.mutateAsync({
        name: workspaceName,
        type: roomType,
        startDate,
        user,
      });
      if (isMain) workspaceActions.setCurrentWorkspaceId(workspace.id);
      const code = await createInviteCode.mutateAsync({
        workspaceId: workspace.id,
        userId: user.id,
      });
      setInviteCode(code);
      setStep("invite");
    } catch {
      modalActions.showModal({
        type: "alert",
        title: "오류",
        message: "워크스페이스 생성 중 문제가 발생했습니다.",
      });
    }
  };

  /** 초대 링크를 클립보드에 복사한다 */
  const copyInviteLink = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(buildInviteLink(inviteCode));
      toastActions.showToast("초대 링크를 복사했어요.", "success");
    } catch {
      toastActions.showToast("복사에 실패했어요. 코드를 직접 전달해주세요.", "error");
    }
  };

  /** 단계/세부 단계에 따라 뒤로 이동한다 */
  const goBack = () => {
    if (step === "create" && createSubStep === "name") {
      setCreateSubStep("type");
    } else if (step === "initial") {
      router.back();
    } else {
      setStep("initial");
      setCreateSubStep("type");
    }
  };

  /** 초대 단계를 건너뛰고 홈으로 이동한다 */
  const skipInvite = () => router.replace(ROUTES.HOME.path);

  return {
    step,
    createSubStep,
    roomType,
    setRoomType,
    workspaceName,
    setWorkspaceName,
    startDate,
    setStartDate,
    isMain,
    setIsMain,
    inviteCode,
    inviteLink: inviteCode ? buildInviteLink(inviteCode) : "",
    isSaving: createWorkspace.isPending || createInviteCode.isPending,
    startCreate: () => setStep("create"),
    goToNameStep,
    completeCreate,
    copyInviteLink,
    goBack,
    skipInvite,
  };
};
