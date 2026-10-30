import "../styles/globals.scss";
import { cookies } from "next/headers";

import { QueryProvider } from "@/lib/QueryProvider";
import { SessionProvider } from "@/lib/SessionProvider";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/feedback/Toast";
import { GlobalLoadingOverlay } from "@/components/feedback/GlobalLoadingOverlay";
import { NOINDEX_ROBOTS } from "@/constants/seo";
import { APP_BRAND_NAME, COOKIE_KEYS, SITE_URL } from "@/constants/config";

import type { Metadata } from "next";

const SITE_DESCRIPTION = "우리의 소중한 일상을 함께 나누는 공간"; // 기본 메타 설명
const OG_IMAGE_PATH = "/app_icon.png"; // OG 공유 카드 이미지 경로 (파비콘은 app/icon.png·app/apple-icon.png 파일 규칙 사용)

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: APP_BRAND_NAME.EN, template: `%s | ${APP_BRAND_NAME.EN}` },
  description: SITE_DESCRIPTION,
  // 대부분의 페이지가 로그인 후에만 접근 가능해 기본은 비노출, 공개 페이지에서만 개별적으로 index: true override
  robots: NOINDEX_ROBOTS,
  openGraph: {
    title: APP_BRAND_NAME.EN,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
};

/** 모든 페이지를 감싸는 루트 레이아웃 — 전역 프로바이더와 앱 단위 오버레이(모달·토스트·로딩)를 배치한다 */
const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  // 직전 방문에서 남긴 테마 쿠키로 첫 렌더부터 data-theme을 심어, 워크스페이스 API 응답까지 기본 테마가
  // 보였다 바뀌는 깜빡임을 없앤다. 쿠키가 없거나 정의되지 않은 테마면 어떤 [data-theme] 규칙에도
  // 걸리지 않아 :root의 기본 테마가 그대로 적용된다
  const themeColor = (await cookies()).get(COOKIE_KEYS.THEME)?.value;

  return (
    <html lang="ko" data-theme={themeColor}>
      <body>
        <QueryProvider>
          <SessionProvider>{children}</SessionProvider>
          <Modal />
          <Toast />
          <GlobalLoadingOverlay />
        </QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
