"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Heart } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { authQueries } from "@/features/auth/queries/authQueries";
import { workspaceActions } from "@/features/workspace/stores/useWorkspaceStore";
import { workspacesApi } from "@/features/workspace/api/workspaces";
import type { Workspace } from "@/features/workspace/types/workspace";

export const WorkspaceJoinView = () => {
  const router = useRouter();
  const { code } = useParams<{ code: string }>();
  const { data: user } = useQuery(authQueries.user());

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [status, setStatus] = useState<"loading" | "preview" | "joining" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const ws = await workspacesApi.getByInviteCode(code);
        if (!ws) {
          setErrorMsg("초대 링크가 유효하지 않거나 만료되었습니다.");
          setStatus("error");
          return;
        }
        setWorkspace(ws);
        setStatus("preview");
      } catch {
        setErrorMsg("초대 정보를 불러오는 중 오류가 발생했습니다.");
        setStatus("error");
      }
    };
    load();
  }, [code]);

  const handleJoin = async () => {
    if (!user || !workspace) {
      router.push(`/login?redirect=/workspace/join/${code}`);
      return;
    }
    setStatus("joining");
    try {
      const joined = await workspacesApi.join(workspace.id, user);
      workspaceActions.setCurrentWorkspace(joined);
      workspaceActions.setWorkspaces([joined]);
      router.replace("/home");
    } catch {
      setErrorMsg("참여 중 오류가 발생했습니다. 다시 시도해주세요.");
      setStatus("error");
    }
  };

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        gap: 24,
        backgroundColor: "#fff",
      }}
    >
      <div style={{ color: "var(--primary)" }}>
        <Heart size={48} fill="var(--primary)" />
      </div>

      {status === "loading" && (
        <p style={{ fontSize: 15, color: "var(--grey-500)" }}>초대 확인 중...</p>
      )}

      {status === "preview" && workspace && (
        <>
          <div style={{ textAlign: "center" }}>
            <h1
              style={{ fontSize: 22, fontWeight: 700, color: "var(--grey-900)", marginBottom: 8 }}
            >
              {workspace.name}
            </h1>
            <p style={{ fontSize: 15, color: "var(--grey-600)", lineHeight: 1.6 }}>
              라이프룸에 초대받았습니다.{"\n"}함께 기억을 쌓아보세요.
            </p>
          </div>
          <button
            onClick={handleJoin}
            style={{
              width: "100%",
              maxWidth: 360,
              height: 56,
              background: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: 16,
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {user ? "참여하기" : "로그인 후 참여하기"}
          </button>
        </>
      )}

      {status === "joining" && <p style={{ fontSize: 15, color: "var(--grey-500)" }}>참여 중...</p>}

      {status === "error" && (
        <>
          <p style={{ fontSize: 15, color: "var(--error)", textAlign: "center" }}>{errorMsg}</p>
          <button
            onClick={() => router.replace("/home")}
            style={{
              padding: "12px 24px",
              background: "var(--grey-100)",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              color: "var(--grey-700)",
              cursor: "pointer",
            }}
          >
            홈으로 돌아가기
          </button>
        </>
      )}
    </main>
  );
};
