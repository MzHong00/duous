import type { Metadata } from "next";
import "../styles/globals.scss";
import { QueryProvider } from "@/lib/QueryProvider";
import { SessionProvider } from "@/lib/SessionProvider";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";
import { NOINDEX_ROBOTS, SITE_URL } from "@/constants/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Duous", template: "%s | Duous" },
  description: "우리의 소중한 일상을 함께 나누는 공간",
  icons: {
    icon: "/app_icon.png",
    apple: "/app_icon.png",
  },
  // 대부분의 페이지가 로그인 후에만 접근 가능해 기본은 비노출, 공개 페이지에서만 개별적으로 index: true override
  robots: NOINDEX_ROBOTS,
  openGraph: {
    title: "Duous",
    description: "우리의 소중한 일상을 함께 나누는 공간",
    images: ["/app_icon.png"],
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          <SessionProvider>{children}</SessionProvider>
          <Modal />
          <Toast />
        </QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
