export type RoomType = "couple" | "group"; // 워크스페이스 유형: 커플 / 단체
export type ThemeColor = "pink" | "blue" | "twilight" | "yellow" | "green"; // 워크스페이스 전역 색상 테마

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: RoomType;
  startDate?: string;
  backgroundImage?: string;
  partnerName?: string;
  members?: WorkspaceMember[];
  themeColor: ThemeColor;
}
