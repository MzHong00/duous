"use client";
import { useRef } from "react";
import { Bell, Lock, Smartphone, ChevronRight, LogOut, Camera, Pencil } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/Card";
import { ProfileImage } from "@/components/ProfileImage";
import { cx } from "@/utils/cn";

import { useProfileUser } from "@/features/profile/hooks/useProfileUser";
import { useProfileSettings } from "@/features/profile/hooks/useProfileSettings";
import { toastActions } from "@/stores/useToastStore";
import styles from "./SettingsView.module.scss";

import type { ReactNode } from "react";

const SETTING_ICON_SIZE = 20; // 설정 행 아이콘 크기(px)

interface SettingItem {
  id: string; // 항목 고유 키
  label: string; // 표시 라벨
  description: string; // 보조 설명
  icon: ReactNode; // 아이콘 노드
}

const SETTING_ITEMS: SettingItem[] = [
  {
    id: "notifications",
    label: "알림 설정",
    description: "푸시 알림 및 메시지 알림",
    icon: <Bell size={SETTING_ICON_SIZE} color="var(--grey-900)" />,
  },
  {
    id: "privacy",
    label: "위치 공유 설정",
    description: "파트너와 위치 공유 여부",
    icon: <Lock size={SETTING_ICON_SIZE} color="var(--grey-900)" />,
  },
  {
    id: "device",
    label: "기기 관리",
    description: "연결된 기기 목록",
    icon: <Smartphone size={SETTING_ICON_SIZE} color="var(--grey-900)" />,
  },
];

export const SettingsView = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { user, email, displayName } = useProfileUser();
  const { openEditNameModal, changePhoto, confirmLogout } = useProfileSettings();
  // 서버 업로드가 끝나기 전엔 로컬 blob 미리보기가 표시되므로, 이를 업로드 중 상태로 간주한다
  const isUploadingPhoto = !!user?.profileImage?.startsWith("blob:");

  /** 이름 수정 모달을 띄운다 (입력값은 ref로 확인 시점에 읽는다) */
  const handleEditName = () => {
    openEditNameModal(
      displayName,
      <div className={styles.nameInputWrap}>
        <input
          ref={nameInputRef}
          defaultValue={displayName}
          placeholder="새 이름을 입력하세요"
          autoFocus
          className={styles.nameInput}
        />
      </div>,
      () => nameInputRef.current?.value ?? displayName
    );
  };

  /** 아직 구현되지 않은 설정 항목을 안내한다 */
  const handleSettingItemClick = (label: string) => {
    toastActions.showToast(`${label}은(는) 준비 중입니다`, "info");
  };

  return (
    <div className={styles.page}>
      <AppHeader />

      <div className={styles.profileSection}>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingPhoto}
          className={styles.avatarButton}
        >
          <ProfileImage uri={user?.profileImage} name={displayName} size={80} />
          {isUploadingPhoto && (
            <div className={styles.uploadOverlay}>
              <div className={styles.spinner} />
            </div>
          )}
          <div className={styles.cameraButton}>
            <Camera size={13} strokeWidth={2.5} />
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.fileInput}
          onChange={changePhoto}
        />

        <button onClick={handleEditName} className={styles.nameButton}>
          <span className={styles.displayName}>{displayName}</span>
          <Pencil size={14} />
        </button>
        <span className={styles.email}>{email}</span>
      </div>

      <div className={styles.content}>
        <Card className={styles.settingCard}>
          {SETTING_ITEMS.map((item) => (
            <div key={item.id}>
              <button
                className={styles.settingRow}
                onClick={() => handleSettingItemClick(item.label)}
              >
                <div className={styles.settingLeft}>
                  <div className={styles.settingIcon}>{item.icon}</div>
                  <div className={styles.settingInfo}>
                    <p className={styles.settingLabel}>{item.label}</p>
                    <p className={styles.settingDesc}>{item.description}</p>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--grey-400)" />
              </button>
              <div className={styles.divider} />
            </div>
          ))}
          <button onClick={confirmLogout} className={styles.settingRow}>
            <div className={styles.settingLeft}>
              <div className={cx(styles.settingIcon, styles.logoutIcon)}>
                <LogOut size={SETTING_ICON_SIZE} color="var(--error)" />
              </div>
              <div className={styles.settingInfo}>
                <p className={cx(styles.settingLabel, styles.logoutLabel)}>로그아웃</p>
                <p className={styles.settingDesc}>현재 기기에서 로그아웃합니다</p>
              </div>
            </div>
          </button>
        </Card>
      </div>
    </div>
  );
};
