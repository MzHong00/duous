"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { DDayHero } from "@/features/home/components/DDayHero";
import { MemoryFeed } from "@/features/home/components/MemoryFeed";
import { ROUTES } from "@/constants/routes";
import styles from "./HomeView.module.scss";

export const HomeView = () => {
  const router = useRouter();
  const { currentWorkspace, isPending } = useCurrentWorkspace();

  // 목록 로딩이 끝난 뒤에도 워크스페이스가 없을 때만 랜딩으로 이동 (로딩 중 오탐 리다이렉트 방지)
  useEffect(() => {
    if (!isPending && !currentWorkspace) {
      router.replace(ROUTES.WORKSPACE.LANDING.path);
    }
  }, [isPending, currentWorkspace, router]);

  if (isPending || !currentWorkspace) return null;

  return (
    <div className={styles.page}>
      <DDayHero />
      <MemoryFeed />
    </div>
  );
};
