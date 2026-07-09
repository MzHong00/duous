"use client";
import { Check } from "lucide-react";

import { cx } from "@/utils/cn";
import styles from "./WorkspaceThemePicker.module.scss";

import type { ThemeColor } from "@/features/workspace/types/workspace";

interface WorkspaceThemePickerProps {
  value: ThemeColor;
  onChange: (themeColor: ThemeColor) => void;
}

const THEME_OPTIONS: { value: ThemeColor; label: string }[] = [
  { value: "pink", label: "핑크 오로라" },
  { value: "blue", label: "블루 오로라" },
];

export const WorkspaceThemePicker = ({ value, onChange }: WorkspaceThemePickerProps) => {
  return (
    <div className={styles.picker}>
      {THEME_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cx(
              styles.card,
              option.value === "pink" ? styles.cardPink : styles.cardBlue,
              isSelected && styles.cardSelected
            )}
          >
            {/* 앱 오로라 배경과 동일한 색감의 그라데이션 미리보기 */}
            <div className={styles.swatch}>
              {isSelected && (
                <div className={styles.checkBadge}>
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </div>

            <span className={styles.label}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
