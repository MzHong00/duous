"use client";
import { useEffect } from "react";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";

/**
 * 현재 워크스페이스의 themeColor를 document.documentElement의 data-theme 속성에 반영해
 * 전역 CSS 테마 토큰(--theme-accent 등)이 워크스페이스별로 적용되게 한다.
 */
export const useWorkspaceThemeSync = () => {
  const { currentWorkspace } = useCurrentWorkspace();

  useEffect(() => {
    if (!currentWorkspace) return;
    document.documentElement.dataset.theme = currentWorkspace.themeColor;
  }, [currentWorkspace]);
};
