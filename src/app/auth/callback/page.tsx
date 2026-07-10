"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

import { authApi } from "@/features/auth/api/auth";
import { workspaceActions } from "@/features/workspace/stores/useWorkspaceStore";
import { workspacesApi } from "@/features/workspace/api/workspaces";

import styles from "./page.module.scss";

const AuthCallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // 세션 확보 (OAuth 리다이렉트 후 URL 해시 파싱). 세션·유저는 Supabase가 자체 관리
      const session = await authApi.getSession();
      if (!session) {
        router.replace(ROUTES.LOGIN.path);
        return;
      }

      // 워크스페이스 조회 후 분기
      try {
        const workspaces = await workspacesApi.listMine();
        if (workspaces.length > 0) {
          workspaceActions.setCurrentWorkspaceId(workspaces[0].id);
          router.replace(ROUTES.HOME.path);
        } else {
          router.replace(ROUTES.WORKSPACE.LANDING.path);
        }
      } catch {
        router.replace(ROUTES.WORKSPACE.LANDING.path);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      <p className={styles.message}>로그인 중입니다...</p>
    </div>
  );
};

export default AuthCallbackPage;
