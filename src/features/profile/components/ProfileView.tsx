"use client";
import { useRouter } from "next/navigation";
import {
  Users,
  ShieldCheck,
  Inbox,
  Check,
  X,
  CalendarDays,
  Gift,
  ListTodo,
  Megaphone,
  Headphones,
  MessageCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authQueries } from "@/features/auth/queries/authQueries";
import { useWorkspaceStore, workspaceActions } from "@/features/workspace/stores/useWorkspaceStore";
import { modalActions } from "@/shared/stores/useModalStore";
import { ProfileImage } from "@/shared/components/ProfileImage";
import styles from "./ProfileView.module.scss";

export const ProfileView = () => {
  const router = useRouter();
  const { data: user } = useQuery(authQueries.user());
  const invitations = useWorkspaceStore((s) => s.invitations);
  const userEmail = user?.email || "user@example.com";

  const pendingInvitations = invitations.filter(
    (inv) => inv.inviteeEmail === userEmail && inv.status === "pending"
  );

  const displayName = user?.name || userEmail.split("@")[0] || "사용자";

  const handleInvitationResponse = (id: string, status: "accepted" | "declined", name: string) => {
    const action = status === "accepted" ? "수락" : "거절";
    modalActions.showModal({
      type: "confirm",
      title: "초대 확인",
      message: `'${name}' 라이프룸 초대를 ${action}하시겠습니까?`,
      onConfirm: () => workspaceActions.respondToInvitation(id, status),
    });
  };

  const listItems = [
    {
      id: "privacy",
      label: "개인정보 처리방침",
      subText: "약관 및 정책",
      icon: <ShieldCheck size={20} color="var(--grey-700)" />,
      onPress: () => router.push("/profile/privacy"),
    },
    {
      id: "notices",
      label: "공지사항",
      subText: "새로운 소식",
      icon: <Megaphone size={20} color="var(--grey-700)" />,
      onPress: () => router.push("/notices"),
    },
    {
      id: "support",
      label: "고객센터",
      subText: "도움말 · 문의",
      icon: <Headphones size={20} color="var(--grey-700)" />,
      onPress: () => router.push("/support"),
    },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <ProfileImage uri={user?.profileImage} name={displayName} size={36} />
          <h1 className={styles.headerName}>{displayName}</h1>
        </div>
        <div className={styles.headerRight}>
          <button onClick={() => router.push("/profile/settings")} className={styles.headerBtn}>
            설정
          </button>
        </div>
      </header>

      <div className={styles.quickGrid}>
        <button onClick={() => router.push("/workspace/list")} className={styles.gridItem}>
          <div className={[styles.gridIconWrap, styles.orange].join(" ")}>
            <Users size={24} />
          </div>
          <span className={styles.gridLabel}>라이프룸</span>
        </button>

        <button onClick={() => router.push("/chat")} className={styles.gridItem}>
          <div className={styles.gridIconBadgeWrap}>
            <div className={[styles.gridIconWrap, styles.blue].join(" ")}>
              <MessageCircle size={24} />
            </div>
            <span className={styles.gridBadge}>3</span>
          </div>
          <span className={styles.gridLabel}>채팅</span>
        </button>

        <button onClick={() => router.push("/calendar")} className={styles.gridItem}>
          <div className={[styles.gridIconWrap, styles.green].join(" ")}>
            <CalendarDays size={24} />
          </div>
          <span className={styles.gridLabel}>캘린더</span>
        </button>

        <button onClick={() => router.push("/anniversary")} className={styles.gridItem}>
          <div className={[styles.gridIconWrap, styles.red].join(" ")}>
            <Gift size={24} />
          </div>
          <span className={styles.gridLabel}>기념일</span>
        </button>

        <button onClick={() => router.push("/todo")} className={styles.gridItem}>
          <div className={[styles.gridIconWrap, styles.purple].join(" ")}>
            <ListTodo size={24} />
          </div>
          <span className={styles.gridLabel}>할 일</span>
        </button>
      </div>

      {pendingInvitations.length > 0 && (
        <div className={styles.invitationsSection}>
          {pendingInvitations.map((inv) => (
            <div key={inv.id} className={styles.inviteCard}>
              <div className={styles.inviteLeft}>
                <div className={styles.inviteIcon}>
                  <Inbox size={20} />
                </div>
                <div>
                  <p className={styles.inviterName}>{inv.inviterEmail}님이</p>
                  <p className={styles.inviteMessage}>'{inv.workspaceName}'에 초대했습니다.</p>
                </div>
              </div>
              <div className={styles.inviteActions}>
                <button
                  onClick={() => handleInvitationResponse(inv.id, "declined", inv.workspaceName)}
                  className={styles.declineButton}
                >
                  <X size={18} />
                </button>
                <button
                  onClick={() => handleInvitationResponse(inv.id, "accepted", inv.workspaceName)}
                  className={styles.acceptButton}
                >
                  <Check size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className={styles.sectionTitle}>알림 및 지원</h2>
      <div className={styles.list}>
        {listItems.map((item) => (
          <button key={item.id} onClick={item.onPress} className={styles.listRow}>
            <div className={styles.listLeft}>
              <div className={styles.listIconWrap}>{item.icon}</div>
              <span className={styles.listTitle}>{item.label}</span>
            </div>
            <span className={styles.listRightText}>{item.subText}</span>
          </button>
        ))}
      </div>

      <p className={styles.version}>버전 1.0.0 (beta)</p>
    </div>
  );
};
