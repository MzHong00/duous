"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, User, Mail, Check, X, ChevronDown, ChevronUp } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { authQueries } from "@/features/auth/queries/authQueries";
import { workspaceActions } from "@/features/workspace/stores/useWorkspaceStore";
import { workspacesApi } from "@/features/workspace/api/workspaces";
import { APP_WORKSPACE } from "@/shared/constants/config";
import styles from "./WorkspaceLandingView.module.scss";

interface PendingInvite {
  id: string;
  workspaceId: string;
  workspaceName: string;
}

export const WorkspaceLandingView = () => {
  const router = useRouter();
  const { data: user } = useQuery(authQueries.user());
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [showInvites, setShowInvites] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) return;
    workspacesApi
      .getPendingInvites(user.email)
      .then(setPendingInvites)
      .catch(() => {});
  }, [user?.email]);

  const handleAccept = async (invite: PendingInvite) => {
    if (!user) return;
    setAcceptingId(invite.id);
    try {
      const workspace = await workspacesApi.acceptInvite(invite.id, invite.workspaceId, user);
      workspaceActions.setCurrentWorkspace(workspace);
      workspaceActions.setWorkspaces([workspace]);
      router.replace("/home");
    } catch {
      setAcceptingId(null);
    }
  };

  const handleDecline = async (invite: PendingInvite) => {
    try {
      await workspacesApi.declineInvite(invite.id);
      setPendingInvites((prev) => prev.filter((i) => i.id !== invite.id));
    } catch {}
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <button onClick={() => router.push("/profile")} className={styles.profileButton}>
          <div className={styles.profileInner}>
            <User size={22} />
          </div>
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.logoWrap}>
          <Heart size={40} fill="#3182F6" color="#3182F6" />
        </div>

        <div className={styles.textCenter}>
          <h2 className={styles.heading}>
            함께하는 {APP_WORKSPACE.KR}이{"\n"}비어있어요
          </h2>
          <p className={styles.desc}>
            우리만의 소중한 기록을 담을{"\n"}첫 번째 {APP_WORKSPACE.KR}을 만들어볼까요?
          </p>
        </div>

        <button onClick={() => router.push("/workspace/setup")} className={styles.ctaButton}>
          새로운 {APP_WORKSPACE.KR} 만들기
        </button>

        <button onClick={() => setShowInvites((prev) => !prev)} className={styles.inboxButton}>
          <Mail size={16} />
          초대함
          {pendingInvites.length > 0 && (
            <span className={styles.inboxBadge}>{pendingInvites.length}</span>
          )}
          {showInvites ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showInvites && (
          <div className={styles.inviteList}>
            {pendingInvites.length === 0 ? (
              <p className={styles.emptyInvite}>받은 초대가 없습니다.</p>
            ) : (
              pendingInvites.map((invite) => (
                <div key={invite.id} className={styles.inviteCard}>
                  <div className={styles.inviteIcon}>
                    <Mail size={18} />
                  </div>
                  <div className={styles.inviteInfo}>
                    <p className={styles.inviteName}>{invite.workspaceName}</p>
                    <p className={styles.inviteLabel}>라이프룸 초대</p>
                  </div>
                  <div className={styles.inviteActions}>
                    <button
                      onClick={() => handleAccept(invite)}
                      className={styles.acceptButton}
                      disabled={acceptingId === invite.id}
                    >
                      <Check size={14} />
                      수락
                    </button>
                    <button
                      onClick={() => handleDecline(invite)}
                      className={styles.declineButton}
                      disabled={acceptingId === invite.id}
                    >
                      <X size={14} />
                      거절
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
};
