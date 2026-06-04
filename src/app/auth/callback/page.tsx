"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/features/auth/api/auth";
import { authActions } from "@/features/auth/stores/useAuthStore";
import { workspaceActions } from "@/features/workspace/stores/useWorkspaceStore";
import { workspacesApi } from "@/features/workspace/api/workspaces";

const AuthCallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // 세션 확보 (OAuth 리다이렉트 후 URL 해시 파싱)
      const session = await authApi.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      // 토큰 저장 — 유저 데이터는 SessionProvider의 onAuthStateChange가 React Query로 패칭
      authActions.setAuth(session.access_token, session.refresh_token ?? undefined);

      // 워크스페이스 조회 후 분기
      try {
        const workspaces = await workspacesApi.listMine();
        if (workspaces.length > 0) {
          workspaceActions.setWorkspaces(workspaces);
          workspaceActions.setCurrentWorkspace(workspaces[0]);
          router.replace("/home");
        } else {
          router.replace("/workspace/landing");
        }
      } catch {
        router.replace("/workspace/landing");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "3px solid var(--primary)",
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ fontSize: 14, color: "var(--grey-500)", fontWeight: 500 }}>로그인 중입니다...</p>
    </div>
  );
};

export default AuthCallbackPage;
