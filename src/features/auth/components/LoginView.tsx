"use client";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";

import { authApi } from "@/features/auth/api/auth";
import { authActions } from "@/features/auth/stores/useAuthStore";
import { workspaceActions } from "@/features/workspace/stores/useWorkspaceStore";
import { MOCK_DATA } from "@/shared/constants/mockData";
import { authQueries } from "@/features/auth/queries/authQueries";
import { KakaoIcon } from "@/shared/assets/icons/KakaoIcon";
import { GoogleIcon } from "@/shared/assets/icons/GoogleIcon";
import styles from "./LoginView.module.scss";

export const LoginView = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleMockLogin = () => {
    authActions.setAuth("mock-access-token");
    queryClient.setQueryData(authQueries.user().queryKey, {
      id: MOCK_DATA.user.id,
      name: MOCK_DATA.user.name,
      email: MOCK_DATA.user.email,
      profileImage: MOCK_DATA.user.profileImage,
    });
    workspaceActions.initMockData();
    router.replace("/home");
  };

  const handleGoogleLogin = async () => {
    await authApi.signInWithGoogle();
  };

  return (
    <main className={styles.main}>
      <div className={styles.inner}>
        <div className={styles.logoSection}>
          <div className={styles.logoWrap}>
            <Heart size={40} fill="#3182F6" color="#3182F6" />
          </div>
          <h1 className={styles.appName}>라이프쉐어</h1>
          <p className={styles.appDesc}>우리의 소중한 일상을 함께 나누는 공간</p>
        </div>

        <div className={styles.buttons}>
          <button onClick={handleMockLogin} className={styles.kakaoButton}>
            <KakaoIcon />
            카카오톡으로 시작하기
          </button>
          <button onClick={handleGoogleLogin} className={styles.googleButton}>
            <GoogleIcon />
            Google로 시작하기
          </button>
        </div>

        <p className={styles.terms}>
          로그인 시 라이프쉐어의 이용약관 및{"\n"}개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </main>
  );
};
