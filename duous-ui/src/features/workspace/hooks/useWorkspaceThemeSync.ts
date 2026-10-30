"use client";

import { useEffect } from "react";

import { useCurrentWorkspace } from "@/features/workspace/hooks/useCurrentWorkspace";
import { COOKIE_KEYS } from "@/constants/config";

const THEME_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 테마 쿠키 유지 기간 (1년)

/**
 * 현재 워크스페이스의 themeColor를 document.documentElement의 data-theme 속성에 반영해
 * 전역 CSS 테마 토큰(--theme-accent 등)이 워크스페이스별로 적용되게 한다.
 * 같은 값을 쿠키에도 남겨, 다음 방문의 루트 레이아웃(app/layout.tsx)이 워크스페이스 API 응답을
 * 기다리지 않고 첫 렌더부터 data-theme을 심을 수 있게 한다 (기본 테마가 잠깐 보였다 바뀌는 깜빡임 제거).
 */
export const useWorkspaceThemeSync = () => {
  const { currentWorkspace } = useCurrentWorkspace();

  useEffect(() => {
    if (!currentWorkspace) return;
    const { themeColor } = currentWorkspace;
    document.documentElement.dataset.theme = themeColor;
    document.cookie = `${COOKIE_KEYS.THEME}=${themeColor}; path=/; max-age=${THEME_COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
  }, [currentWorkspace]);
};
