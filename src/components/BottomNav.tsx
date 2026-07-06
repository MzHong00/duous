"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, MapPin, User } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import { cx } from "@/utils/cn";

import styles from "./BottomNav.module.scss";

const navItems = [
  { href: ROUTES.HOME.path, label: "홈", Icon: Home },
  { href: ROUTES.STORIES.path, label: "스토리", Icon: Heart },
  { href: ROUTES.MAP.path, label: "위치", Icon: MapPin },
  { href: ROUTES.PROFILE.path, label: "프로필", Icon: User },
];

const GNB_PATHS = navItems.map((item) => item.href);

export const BottomNav = () => {
  const pathname = usePathname();
  const isGnbPage = GNB_PATHS.some((path) => pathname === path);

  if (!isGnbPage) return null;

  return (
    <nav className={styles.nav}>
      <div className={styles.navList}>
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={styles.navLink}>
              <span className={cx(styles.pill, isActive && styles.pillActive)}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={cx(styles.navLabel, isActive && styles.navLabelActive)}>
                  {label}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
