import { Image, Camera, MapPin, Gift } from "lucide-react";

import type { LucideIcon } from "lucide-react";

// 워크스페이스에 파트너 멤버가 없을 때 사용하는 기본값
export const DEFAULT_PARTNER = {
  id: "partner",
  name: "파트너",
  avatar: undefined as string | undefined,
  email: "",
} as const;

export const PARTNER_AVATAR_SIZE = 36; // 헤더 프로필 이미지 크기(px)
export const BUBBLE_AVATAR_SIZE = 32; // 말풍선 옆 프로필 이미지 크기(px)
export const AVATAR_FALLBACK_NAME = "?"; // 이름 없는 멤버의 아바타 이니셜 대체값

interface ChatActionItem {
  id: string;
  Icon: LucideIcon;
  label: string;
}

// 입력바 도구함 아이템 목록
export const CHAT_ACTION_ITEMS: ChatActionItem[] = [
  { id: "gallery", Icon: Image, label: "갤러리" },
  { id: "camera", Icon: Camera, label: "카메라" },
  { id: "location", Icon: MapPin, label: "위치" },
  { id: "gift", Icon: Gift, label: "선물" },
];
