"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useWorkspaceStore } from "@/features/workspace/stores/useWorkspaceStore";
import { DDayHero } from "@/features/home/components/DDayHero";
import { MemoryFeed } from "@/features/home/components/MemoryFeed";
import styles from "./HomeView.module.scss";

export const HomeView = () => {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  useEffect(() => {
    if (!currentWorkspace) {
      router.replace("/workspace/landing");
    }
  }, [currentWorkspace, router]);

  if (!currentWorkspace) return null;

  return (
    <div className={styles.page}>
      <DDayHero />
      <MemoryFeed />
    </div>
  );
};
