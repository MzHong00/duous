"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { useWorkspaceStore } from "@/features/workspace/stores/useWorkspaceStore";

const RootPage = () => {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!currentWorkspace) {
      router.replace("/workspace/landing");
    } else {
      router.replace("/home");
    }
  }, [isAuthenticated, currentWorkspace, router]);

  return null;
};

export default RootPage;
