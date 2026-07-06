import type { Metadata } from "next";
import "../styles/globals.scss";
import { QueryProvider } from "@/lib/QueryProvider";
import { SessionProvider } from "@/lib/SessionProvider";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";

export const metadata: Metadata = {
  title: "LifeShare",
  description: "우리의 소중한 일상을 함께 나누는 공간",
  icons: {
    icon: "/app_icon.png",
    apple: "/app_icon.png",
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
