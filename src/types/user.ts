export interface User {
  id: string; // 사용자 고유 ID
  name: string; // 표시 이름
  email?: string; // 이메일
  profileImage?: string; // 프로필 이미지 URL
  status?: string; // 상태 메시지
  location?: string; // 위치 정보
  lastActive?: string; // 마지막 활동 시각 (ISO)
}

export interface UserProfile {
  name: string; // 표시 이름
  profileImage?: string; // 프로필 이미지 URL
}
