"use client";
import { useQuery } from "@tanstack/react-query";

import { authQueries } from "@/features/auth/queries/authQueries";

import { FALLBACK_EMAIL, FALLBACK_NAME } from "@/features/profile/constants/profile";

import type { User } from "@/types/user";

interface UseProfileUserResult {
  user: User | null | undefined; // 원본 사용자 데이터
  email: string; // 대체값이 적용된 이메일
  displayName: string; // 대체값이 적용된 표시 이름
  isLoading: boolean; // 사용자 조회 로딩 여부
  isError: boolean; // 사용자 조회 실패 여부
}

/**
 * 인증 사용자 정보를 조회해 표시용 이름·이메일로 가공한다.
 * ProfileView·SettingsView 공통 파생 로직을 한 곳에 모은다.
 */
export const useProfileUser = (): UseProfileUserResult => {
  const { data: user, isLoading, isError } = useQuery(authQueries.user());

  // 로딩 중에는 폴백값을 노출하지 않는다 (새로고침 시 "user" 등 대체값 깜빡임 방지)
  const email = user?.email || (isLoading ? "" : FALLBACK_EMAIL);
  const displayName = user?.name || user?.email?.split("@")[0] || (isLoading ? "" : FALLBACK_NAME);

  return { user, email, displayName, isLoading, isError };
};
