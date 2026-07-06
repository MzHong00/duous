import { useMutation } from "@tanstack/react-query";

import { authApi } from "@/features/auth/api/auth";

/** 구글 OAuth 로그인 뮤테이션. 성공 시 콜백 경로로 리다이렉트된다 */
export const useGoogleLoginMutation = () =>
  useMutation({
    mutationFn: () => authApi.signInWithGoogle(),
  });
