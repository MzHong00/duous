"use client";
import type { CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Trash2, User, UserPlus } from "lucide-react";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { useWorkspaceEditActions } from "@/features/workspace/hooks/useWorkspaceEditActions";
import { WorkspaceThemePicker } from "@/features/workspace/components/WorkspaceThemePicker";
import { WORKSPACE_THEME_ACCENT } from "@/features/workspace/constants/theme";
import { modalActions } from "@/stores/useModalStore";
import { AppHeader } from "@/components/AppHeader";
import { APP_WORKSPACE } from "@/constants/config";
import { cx } from "@/utils/cn";
import styles from "./WorkspaceEditView.module.scss";

export const WorkspaceEditView = () => {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId") || "";

  const { workspaces } = useCurrentWorkspace();
  const workspace = workspaces.find((ws) => ws.id === workspaceId);
  const actions = useWorkspaceEditActions(workspaceId);

  if (!workspace) return null;

  const handleLeaveWorkspace = () => {
    modalActions.showModal({
      type: "confirm",
      title: `${APP_WORKSPACE.KR}에서 나가기`,
      message: `정말로 '${workspace.name}' ${APP_WORKSPACE.KR}에서 나갈까요?\n기존에 기록된 데이터는 삭제되지 않지만 목록에서 사라집니다.`,
      confirmText: "나가기",
      onConfirm: actions.leave,
    });
  };

  /** 텍스트 입력 하나로 구성된 수정 모달을 띄운다 (제목/프로필 이름 수정에서 공용으로 사용) */
  const openTextPromptModal = ({
    title,
    helpText,
    placeholder,
    defaultValue,
    onConfirm,
  }: {
    title: string;
    helpText: string;
    placeholder: string;
    defaultValue: string;
    onConfirm: (value: string) => Promise<void>;
  }) => {
    let input = defaultValue;
    modalActions.showModal({
      type: "confirm",
      title,
      confirmText: "수정하기",
      content: (
        <div className={styles.modalContent}>
          <p className={styles.modalHelp}>{helpText}</p>
          <input
            type="text"
            defaultValue={input}
            autoFocus
            onChange={(e) => {
              input = e.target.value;
            }}
            placeholder={placeholder}
            className={styles.modalInput}
          />
        </div>
      ),
      onConfirm: async () => {
        if (!input.trim()) return;
        await onConfirm(input.trim());
      },
    });
  };

  const openNameEditModal = () =>
    openTextPromptModal({
      title: "라이프룸 제목 수정",
      helpText: "이 공간의 이름을 입력해주세요.",
      placeholder: "제목 입력",
      defaultValue: workspace.name,
      onConfirm: actions.changeName,
    });

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
        await actions.changeStartDate(selectedDate);
      },
    });
  };

  const openProfileEditModal = () => {
    if (!actions.user) return;
    const myMember = workspace.members?.find((m) => m.id === actions.user?.id);
    openTextPromptModal({
      title: "내 활동 프로필 설정",
      helpText: "이 공간에서 사용할 이름을 입력해주세요.",
      placeholder: "이름 입력",
      defaultValue: myMember?.name || "",
      onConfirm: actions.changeProfileName,
    });
  };

  return (
    <div
      className={styles.page}
      style={{ "--item-accent": WORKSPACE_THEME_ACCENT[workspace.themeColor] } as CSSProperties}
    >
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
            <div className={styles.divider} />
            <div className={styles.themeRow}>
              <span className={styles.settingLabel}>테마</span>
              <WorkspaceThemePicker
                value={workspace.themeColor}
                onChange={actions.changeThemeColor}
              />
            </div>
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
              onClick={actions.invite}
              className={styles.settingRow}
              disabled={actions.isInviting}
            >
              <div className={cx(styles.settingIcon, styles.settingIconGreen)}>
                <UserPlus size={18} />
              </div>
              <span className={styles.settingLabel}>
                {workspace.type === "couple" ? "파트너 초대하기" : "멤버 초대하기"}
              </span>
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
