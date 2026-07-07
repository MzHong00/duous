"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Trash2, User, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { workspaceActions } from "@/features/workspace/stores/useWorkspaceStore";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { authQueries } from "@/features/auth/queries/authQueries";
import { modalActions } from "@/stores/useModalStore";
import { toastActions } from "@/stores/useToastStore";
import {
  useUpdateWorkspaceNameMutation,
  useUpdateWorkspaceStartDateMutation,
  useUpdateWorkspaceMemberMutation,
  useLeaveWorkspaceMutation,
  useCreateInviteCodeMutation,
} from "@/features/workspace/queries/workspaceMutations";
import { AppHeader } from "@/components/AppHeader";
import { APP_WORKSPACE } from "@/constants/config";
import { cx } from "@/utils/cn";
import styles from "./WorkspaceEditView.module.scss";

export const WorkspaceEditView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId") || "";

  const { workspaces } = useCurrentWorkspace();
  const workspace = workspaces.find((ws) => ws.id === workspaceId);
  const { data: user } = useQuery(authQueries.user());
  const updateName = useUpdateWorkspaceNameMutation();
  const updateStartDate = useUpdateWorkspaceStartDateMutation();
  const updateMember = useUpdateWorkspaceMemberMutation();
  const leaveWorkspace = useLeaveWorkspaceMutation();
  const createInviteCode = useCreateInviteCodeMutation();

  if (!workspace) return null;

  const handleLeaveWorkspace = () => {
    modalActions.showModal({
      type: "confirm",
      title: `${APP_WORKSPACE.KR}에서 나가기`,
      message: `정말로 '${workspace.name}' ${APP_WORKSPACE.KR}에서 나갈까요?\n기존에 기록된 데이터는 삭제되지 않지만 목록에서 사라집니다.`,
      confirmText: "나가기",
      onConfirm: async () => {
        if (!user) return;
        try {
          await leaveWorkspace.mutateAsync({ workspaceId, userId: user.id });
          workspaceActions.setCurrentWorkspaceId(null);
          router.replace(ROUTES.WORKSPACE.LIST.path);
        } catch {
          modalActions.showModal({ type: "alert", title: "오류", message: "나가기에 실패했습니다." });
        }
      },
    });
  };

  const openNameEditModal = () => {
    let input = workspace.name;
    modalActions.showModal({
      type: "confirm",
      title: "라이프룸 제목 수정",
      confirmText: "수정하기",
      content: (
        <div className={styles.modalContent}>
          <p className={styles.modalHelp}>이 공간의 이름을 입력해주세요.</p>
          <input
            type="text"
            defaultValue={input}
            autoFocus
            onChange={(e) => {
              input = e.target.value;
            }}
            placeholder="제목 입력"
            className={styles.modalInput}
          />
        </div>
      ),
      onConfirm: async () => {
        if (!input.trim()) return;
        try {
          await updateName.mutateAsync({ workspaceId, name: input.trim() });
        } catch {
          modalActions.showModal({ type: "alert", title: "오류", message: "제목 수정에 실패했습니다." });
        }
      },
    });
  };

  const openStartDateModal = () => {
    let selectedDate = workspace.startDate || "";
    modalActions.showModal({
      type: "confirm",
      title: "날짜 선택",
      confirmText: "확인",
      content: (
        <div className={styles.modalContent}>
          <input
            type="date"
            defaultValue={selectedDate}
            autoFocus
            onChange={(e) => {
              selectedDate = e.target.value;
            }}
            className={styles.modalInput}
          />
        </div>
      ),
      onConfirm: async () => {
        if (!selectedDate) return;
        try {
          await updateStartDate.mutateAsync({ workspaceId, startDate: selectedDate });
        } catch {
          modalActions.showModal({ type: "alert", title: "오류", message: "날짜 수정에 실패했습니다." });
        }
      },
    });
  };

  const openProfileEditModal = () => {
    const myMember = workspace.members?.find((m) => m.id === user?.id);
    let input = myMember?.name || "";
    modalActions.showModal({
      type: "confirm",
      title: "내 활동 프로필 설정",
      confirmText: "수정하기",
      content: (
        <div className={styles.modalContent}>
          <p className={styles.modalHelp}>이 공간에서 사용할 이름을 입력해주세요.</p>
          <input
            type="text"
            defaultValue={input}
            autoFocus
            onChange={(e) => {
              input = e.target.value;
            }}
            placeholder="이름 입력"
            className={styles.modalInput}
          />
        </div>
      ),
      onConfirm: async () => {
        if (!input.trim() || !user) return;
        try {
          await updateMember.mutateAsync({
            workspaceId,
            userId: user.id,
            updates: { display_name: input.trim() },
          });
        } catch {
          modalActions.showModal({
            type: "alert",
            title: "오류",
            message: "프로필 수정에 실패했습니다.",
          });
        }
      },
    });
  };

  const handleInvite = async () => {
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

  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <span
            className={cx(
              styles.badge,
              workspace.type === "couple" ? styles.badgeCouple : styles.badgeGroup
            )}
          >
            {workspace.type === "couple" ? "커플" : "단체"} {APP_WORKSPACE.KR}
          </span>
          <button onClick={openNameEditModal}>
            <h2 className={styles.workspaceName}>{workspace.name}</h2>
          </button>
        </div>

        <div>
          <p className={styles.sectionLabel}>기본 설정</p>
          <div className={styles.settingCard}>
            <button onClick={openNameEditModal} className={styles.settingRow}>
              <span className={styles.settingLabel}>라이프룸 제목</span>
              <span className={styles.settingValue}>{workspace.name}</span>
              <ChevronRight size={16} color="var(--grey-300)" />
            </button>
            <div className={styles.divider} />
            <button onClick={openStartDateModal} className={styles.settingRow}>
              <span className={styles.settingLabel}>함께한 날</span>
              <span className={styles.settingValue}>{workspace.startDate || "날짜 선택"}</span>
              <ChevronRight size={16} color="var(--grey-300)" />
            </button>
          </div>
        </div>

        <div>
          <p className={styles.sectionLabel}>멤버 및 도구</p>
          <div className={styles.settingCard}>
            <button onClick={openProfileEditModal} className={styles.settingRow}>
              <div className={cx(styles.settingIcon, styles.settingIconPrimary)}>
                <User size={18} />
              </div>
              <span className={styles.settingLabel}>내 활동 프로필 설정</span>
              <ChevronRight size={16} color="var(--grey-300)" />
            </button>
            <div className={styles.divider} />
            <button
              onClick={handleInvite}
              className={styles.settingRow}
              disabled={createInviteCode.isPending}
            >
              <div className={cx(styles.settingIcon, styles.settingIconGreen)}>
                <UserPlus size={18} />
              </div>
              <span className={styles.settingLabel}>파트너 초대하기</span>
              <span className={styles.settingValue}>
                {workspace.members?.length || 0}명 참여 중
              </span>
              <ChevronRight size={16} color="var(--grey-300)" />
            </button>
          </div>
        </div>

        <div>
          <p className={styles.sectionLabel}>위험 구역</p>
          <div className={styles.dangerCard}>
            <button onClick={handleLeaveWorkspace} className={styles.dangerRow}>
              <div className={styles.dangerInfo}>
                <p className={styles.dangerTitle}>{APP_WORKSPACE.KR}에서 나가기</p>
                <p className={styles.dangerDesc}>데이터는 유지되지만 리스트에서 사라집니다.</p>
              </div>
              <Trash2 size={18} color="var(--error)" className={styles.dangerIcon} />
            </button>
          </div>
        </div>

        <p className={styles.footer}>
          각 공간의 설정은 해당 공간에 참여한 멤버들끼리만{"\n"}공유되며 안전하게 보호됩니다.
        </p>
      </div>
    </div>
  );
};
