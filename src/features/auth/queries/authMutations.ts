import { useMutation } from "@tanstack/react-query";

import { authApi } from "@/features/auth/api/auth";

/** 구글 OAuth 로그인 뮤테이션. 성공 시 콜백 경로로 리다이렉트된다 */
export const useGoogleLoginMutation = () =>
  useMutation({
    mutationFn: (redirectPath?: string) => authApi.signInWithGoogle(redirectPath),
  });

/** 로그아웃 뮤테이션. 실패 시 세션·캐시를 정리하지 않도록 호출부에서 에러를 처리해야 한다 */
export const useSignOutMutation = () =>
  useMutation({
    mutationFn: () => authApi.signOut(),
  });
