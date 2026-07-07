"use client";
import { useRouter } from "next/navigation";

import { ProfileImage } from "@/components/ProfileImage";
import { ROUTES } from "@/constants/routes";

import { useProfileUser } from "@/features/profile/hooks/useProfileUser";
import { QUICK_ACTIONS, PROFILE_MENU_ITEMS } from "@/features/profile/constants/profileMenu";
import { APP_VERSION } from "@/features/profile/constants/profile";
import { QuickActionButton } from "./QuickActionButton";
import { ProfileMenuRow } from "./ProfileMenuRow";
import styles from "./ProfileView.module.scss";

export const ProfileView = () => {
  const router = useRouter();
  const { user, displayName } = useProfileUser();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <ProfileImage uri={user?.profileImage} name={displayName} size={36} />
          <h1 className={styles.headerName}>{displayName}</h1>
        </div>
        <div className={styles.headerRight}>
          <button
            onClick={() => router.push(ROUTES.PROFILE.SETTINGS.path)}
            className={styles.headerBtn}
          >
            설정
          </button>
        </div>
      </header>

      <div className={styles.quickGrid}>
        {QUICK_ACTIONS.map((item) => (
          <QuickActionButton key={item.id} item={item} />
        ))}
      </div>

      <h2 className={styles.sectionTitle}>알림 및 지원</h2>
      <div className={styles.list}>
        {PROFILE_MENU_ITEMS.map((item) => (
          <ProfileMenuRow key={item.id} item={item} />
        ))}
      </div>

      <p className={styles.version}>{APP_VERSION}</p>
    </div>
  );
};
