"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Trash2, User, UserPlus } from "lucide-react";
import { useWorkspaceStore, workspaceActions } from "@/features/workspace/stores/useWorkspaceStore";
import { useQuery } from "@tanstack/react-query";
import { authQueries } from "@/features/auth/queries/authQueries";
import { modalActions } from "@/shared/stores/useModalStore";
import { workspacesApi } from "@/features/workspace/api/workspaces";
import { AppHeader } from "@/shared/components/AppHeader";
import { APP_WORKSPACE } from "@/shared/constants/config";
import styles from "./WorkspaceEditView.module.scss";

export const WorkspaceEditView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId") || "";

  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const workspace = workspaces.find((ws) => ws.id === workspaceId);
  const { data: user } = useQuery(authQueries.user());

  const [, setNameInput] = useState(workspace?.name || "");

  if (!workspace) return null;

  const handleDeleteWorkspace = () => {
    modalActions.showModal({
      type: "confirm",
      title: `${APP_WORKSPACE.KR}에서 나가기`,
      message: `정말로 '${workspace.name}' ${APP_WORKSPACE.KR}에서 나갈까요?\n기존에 기록된 데이터는 삭제되지 않지만 목록에서 사라집니다.`,
      confirmText: "나가기",
      onConfirm: () => {
        workspaceActions.removeWorkspace(workspaceId);
        router.replace("/workspace/list");
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
        <div style={{ padding: "0 4px 8px" }}>
          <p
            style={{
              fontSize: 14,
              color: "var(--grey-500)",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            이 공간의 이름을 입력해주세요.
          </p>
          <input
            type="text"
            defaultValue={input}
            autoFocus
            onChange={(e) => {
              input = e.target.value;
            }}
            placeholder="제목 입력"
            style={{
              width: "100%",
              height: 56,
              backgroundColor: "var(--grey-100)",
              borderRadius: 16,
              padding: "0 20px",
              fontSize: 16,
              fontWeight: 600,
              color: "var(--grey-900)",
            }}
          />
        </div>
      ),
      onConfirm: () => {
        if (input.trim()) {
          workspaceActions.updateWorkspaceName(workspaceId, input.trim());
          setNameInput(input.trim());
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
        <div style={{ padding: "0 4px 8px" }}>
          <input
            type="date"
            defaultValue={selectedDate}
            autoFocus
            onChange={(e) => {
              selectedDate = e.target.value;
            }}
            style={{
              width: "100%",
              height: 56,
              backgroundColor: "var(--grey-100)",
              borderRadius: 16,
              padding: "0 20px",
              fontSize: 16,
              fontWeight: 600,
              color: "var(--grey-900)",
            }}
          />
        </div>
      ),
      onConfirm: () => {
        if (selectedDate) workspaceActions.updateWorkspaceStartDate(workspaceId, selectedDate);
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
        <div style={{ padding: "0 4px 8px" }}>
          <p
            style={{
              fontSize: 14,
              color: "var(--grey-500)",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            이 공간에서 사용할 이름을 입력해주세요.
          </p>
          <input
            type="text"
            defaultValue={input}
            autoFocus
            onChange={(e) => {
              input = e.target.value;
            }}
            placeholder="이름 입력"
            style={{
              width: "100%",
              height: 56,
              backgroundColor: "var(--grey-100)",
              borderRadius: 16,
              padding: "0 20px",
              fontSize: 16,
              fontWeight: 600,
              color: "var(--grey-900)",
            }}
          />
        </div>
      ),
      onConfirm: async () => {
        if (!input.trim() || !user) return;
        try {
          await workspacesApi.updateMember(workspaceId, user.id, { display_name: input.trim() });
          workspaceActions.updateMemberProfile(workspaceId, user.id, { name: input.trim() });
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

  const openInviteModal = () => {
    let email = "";
    modalActions.showModal({
      type: "confirm",
      title: "파트너 초대하기",
      confirmText: "초대하기",
      content: (
        <div style={{ padding: "0 4px 8px" }}>
          <p
            style={{
              fontSize: 14,
              color: "var(--grey-500)",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            소셜 로그인으로 가입한 파트너의{"\n"}이메일 주소를 입력하면 초대장이 전송됩니다.
          </p>
          <input
            type="email"
            autoFocus
            onChange={(e) => {
              email = e.target.value;
            }}
            placeholder="example@email.com"
            style={{
              width: "100%",
              height: 56,
              backgroundColor: "var(--grey-100)",
              borderRadius: 16,
              padding: "0 20px",
              fontSize: 16,
              fontWeight: 600,
              color: "var(--grey-900)",
            }}
          />
        </div>
      ),
      onConfirm: async () => {
        if (!email.trim() || !email.includes("@") || !user) return;
        try {
          await workspacesApi.sendInvite(workspaceId, workspace.name, email.trim(), user.id);
          modalActions.showModal({
            type: "alert",
            title: "초대 완료",
            message: `${email.trim()}에 초대장을 보냈어요.\n파트너에게 앱에 접속해달라고 알려주세요.`,
          });
        } catch {
          modalActions.showModal({
            type: "alert",
            title: "오류",
            message: "초대 전송에 실패했습니다.",
          });
        }
      },
    });
  };

  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <span
            className={[
              styles.badge,
              workspace.type === "couple" ? styles.badgeCouple : styles.badgeGroup,
            ]
              .filter(Boolean)
              .join(" ")}
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
              <div
                className={[styles.settingIcon, styles.settingIconPrimary]
                  .filter(Boolean)
                  .join(" ")}
              >
                <User size={18} />
              </div>
              <span className={styles.settingLabel}>내 활동 프로필 설정</span>
              <ChevronRight size={16} color="var(--grey-300)" />
            </button>
            <div className={styles.divider} />
            <button onClick={openInviteModal} className={styles.settingRow}>
              <div
                className={[styles.settingIcon, styles.settingIconGreen].filter(Boolean).join(" ")}
              >
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
            <button onClick={handleDeleteWorkspace} className={styles.dangerRow}>
              <div className={styles.dangerInfo}>
                <p className={styles.dangerTitle}>{APP_WORKSPACE.KR}에서 나가기</p>
                <p className={styles.dangerDesc}>데이터는 유지되지만 리스트에서 사라집니다.</p>
              </div>
              <Trash2 size={18} color="var(--error)" style={{ flexShrink: 0 }} />
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
