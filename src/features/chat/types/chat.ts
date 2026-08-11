export interface ChatMessage {
  id: string;
  text: string;
  sender: "me" | "partner";
  senderId: string; // 실제 발신자 id(그룹 워크스페이스에서 발신자별 이름·아바타 조회에 사용)
  createdAt: string; // 생성 시각 ISO 문자열(표시용 포맷은 뷰어 타임존 기준으로 렌더 시점에 수행)
}
