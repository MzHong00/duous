import {
  Users,
  MessageCircle,
  CalendarDays,
  Gift,
  ListTodo,
  ShieldCheck,
  Megaphone,
  Headphones,
} from "lucide-react";

import { ROUTES } from "@/constants/routes";

import type { ReactNode } from "react";

const QUICK_ICON_SIZE = 24; // 퀵 그리드 아이콘 크기(px)
const LIST_ICON_SIZE = 20; // 메뉴 리스트 아이콘 크기(px)

/** 퀵 액션 그리드 단일 항목 */
export interface QuickActionItem {
  id: string; // 항목 고유 키
  label: string; // 표시 라벨
  route: string; // 이동 경로
  icon: ReactNode; // 아이콘 노드
  colorClass: "orange" | "blue" | "green" | "red" | "purple"; // 아이콘 박스 색상 클래스명
}

/** 알림·지원 메뉴 리스트 단일 항목 */
export interface ProfileMenuItem {
  id: string; // 항목 고유 키
  label: string; // 표시 라벨
  subText: string; // 우측 보조 텍스트
  route: string; // 이동 경로
  icon: ReactNode; // 아이콘 노드
}

export const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "workspace",
    label: "라이프룸",
    route: ROUTES.WORKSPACE.LIST.path,
    icon: <Users size={QUICK_ICON_SIZE} />,
    colorClass: "orange",
  },
  {
    id: "chat",
    label: "채팅",
    route: ROUTES.CHAT.path,
    icon: <MessageCircle size={QUICK_ICON_SIZE} />,
    colorClass: "blue",
  },
  {
    id: "calendar",
    label: "캘린더",
    route: ROUTES.CALENDAR.path,
    icon: <CalendarDays size={QUICK_ICON_SIZE} />,
    colorClass: "green",
  },
  {
    id: "anniversary",
    label: "기념일",
    route: ROUTES.ANNIVERSARY.path,
    icon: <Gift size={QUICK_ICON_SIZE} />,
    colorClass: "red",
  },
  {
    id: "todo",
    label: "할 일",
    route: ROUTES.TODO.path,
    icon: <ListTodo size={QUICK_ICON_SIZE} />,
    colorClass: "purple",
  },
];

export const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  {
    id: "privacy",
    label: "개인정보 처리방침",
    subText: "약관 및 정책",
    route: ROUTES.PROFILE.PRIVACY.path,
    icon: <ShieldCheck size={LIST_ICON_SIZE} color="var(--grey-700)" />,
  },
  {
    id: "notices",
    label: "공지사항",
    subText: "새로운 소식",
    route: ROUTES.NOTICES.path,
    icon: <Megaphone size={LIST_ICON_SIZE} color="var(--grey-700)" />,
  },
  {
    id: "support",
    label: "고객센터",
    subText: "도움말 · 문의",
    route: ROUTES.SUPPORT.path,
    icon: <Headphones size={LIST_ICON_SIZE} color="var(--grey-700)" />,
  },
];
