"use client";
import { UserPlus, Copy } from "lucide-react";

import styles from "./WorkspaceSetupView.module.scss";

interface SetupInviteStepProps {
  workspaceName: string; // 생성된 워크스페이스 이름
  inviteCode: string; // 생성된 초대 코드
  /** 초대 링크 복사 핸들러 */
  onCopy: () => void;
}

export const SetupInviteStep = ({ workspaceName, inviteCode, onCopy }: SetupInviteStepProps) => (
  <div className={styles.topSection}>
    <div className={styles.iconWrap}>
      <UserPlus size={32} />
    </div>
    <h2 className={styles.heading}>파트너 초대하기</h2>
    <p className={styles.desc}>
      {workspaceName}이(가) 생성되었습니다!{"\n"}아래 초대 코드를 파트너에게{"\n"}공유해보세요.
    </p>
    <button type="button" onClick={onCopy} className={styles.inviteCodeBox}>
      <span className={styles.inviteCodeText}>{inviteCode}</span>
      <Copy size={20} />
    </button>
  </div>
);
