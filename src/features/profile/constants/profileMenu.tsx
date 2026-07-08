import { ShieldCheck, Megaphone, Headphones } from "lucide-react";

import { ROUTES } from "@/constants/routes";

import type { ReactNode } from "react";

const LIST_ICON_SIZE = 20; // 메뉴 리스트 아이콘 크기(px)

/** 알림·지원 메뉴 리스트 단일 항목 */
export interface ProfileMenuItem {
  id: string; // 항목 고유 키
  label: string; // 표시 라벨
  subText: string; // 우측 보조 텍스트
  route: string; // 이동 경로
  icon: ReactNode; // 아이콘 노드
  colorClass: "blue" | "green" | "grey"; // 아이콘 박스 색상 클래스명
}

export const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  {
    id: "privacy",
    label: "개인정보 처리방침",
    subText: "약관 및 정책",
    route: ROUTES.PROFILE.PRIVACY.path,
    icon: <ShieldCheck size={LIST_ICON_SIZE} color="var(--grey-700)" />,
    colorClass: "grey",
  },
  {
    id: "notices",
    label: "공지사항",
    subText: "새로운 소식",
    route: ROUTES.NOTICES.path,
    icon: <Megaphone size={LIST_ICON_SIZE} color="var(--primary)" />,
    colorClass: "blue",
  },
  {
    id: "support",
    label: "고객센터",
    subText: "도움말 · 문의",
    route: ROUTES.SUPPORT.path,
    icon: <Headphones size={LIST_ICON_SIZE} color="var(--success)" />,
    colorClass: "green",
  },
];
