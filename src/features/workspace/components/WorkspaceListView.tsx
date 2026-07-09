"use client";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { Plus, Users, Heart, Star, Settings } from "lucide-react";
import { workspaceActions } from "@/features/workspace/stores/useWorkspaceStore";
import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { toastActions } from "@/stores/useToastStore";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { ProfileImage } from "@/components/ProfileImage";
import { formatDate, calculateDDay } from "@/utils/date";
import { APP_WORKSPACE } from "@/constants/config";
import styles from "./WorkspaceListView.module.scss";

export const WorkspaceListView = () => {
  const router = useRouter();
  const { workspaces, currentWorkspace } = useCurrentWorkspace();

  const handleSetMain = (id: string) => {
    const workspace = workspaces.find((w) => w.id === id);
    if (workspace) {
      workspaceActions.setCurrentWorkspaceId(id);
      toastActions.showToast(`'${workspace.name}'이 메인 라이프룸으로 설정되었습니다`, "success");
    }
  };

  return (
    <div className={styles.page}>
      <AppHeader />

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>내 라이프룸 목록</h1>
          <p className={styles.description}>참여 중인 라이프룸을 전환하거나 관리할 수 있습니다.</p>
        </div>

        {workspaces.map((ws) => {
          const isMain = ws.id === currentWorkspace?.id;
          const days = ws.startDate ? calculateDDay(ws.startDate) : null;

          return (
            <Card key={ws.id} className={styles.workspaceCard}>
              <div className={styles.cardIconActions}>
                {!isMain && (
                  <button
                    type="button"
                    onClick={() => handleSetMain(ws.id)}
                    className={styles.setMainButton}
                    aria-label={`${ws.name} 메인 라이프룸으로 설정`}
                    title="메인 설정"
                  >
                    <Star size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => router.push(ROUTES.WORKSPACE.EDIT.query({ workspaceId: ws.id }))}
                  className={styles.settingsButton}
                  aria-label={`${ws.name} 설정`}
                  title="설정"
                >
                  <Settings size={16} />
                </button>
              </div>

              <div className={styles.cardTop}>
                <div className={styles.wsIcon}>
                  {ws.type === "couple" ? <Heart size={22} /> : <Users size={22} />}
                </div>
                <div className={styles.wsInfo}>
                  <div className={styles.nameRow}>
                    <h3 className={styles.wsName}>{ws.name}</h3>
                    {isMain && <span className={styles.mainBadge}>메인</span>}
                  </div>
                  {ws.startDate && (
                    <p className={styles.wsDate}>
                      {formatDate(ws.startDate)} 시작 · {days}일째
                    </p>
                  )}
                </div>
              </div>

              {!!ws.members?.length && (
                <div className={styles.cardMembers}>
                  <div className={styles.membersStack}>
                    {[...ws.members].reverse().map((member) => (
                      <div key={member.id} className={styles.memberAvatar}>
                        <ProfileImage uri={member.avatar} name={member.name} size={24} />
                      </div>
                    ))}
                  </div>
                  <span className={styles.wsMember}>멤버 {ws.members.length}명</span>
                </div>
              )}
            </Card>
          );
        })}

        <button
          onClick={() => router.push(ROUTES.WORKSPACE.SETUP.path)}
          className={styles.addButton}
        >
          <Plus size={18} />새 {APP_WORKSPACE.KR} 만들기
        </button>
      </div>
    </div>
  );
};
