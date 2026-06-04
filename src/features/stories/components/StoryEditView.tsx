"use client";
import { useState, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Image as ImageIcon, X, MapPin } from "lucide-react";

import { useStoryStore, storyActions } from "@/features/stories/stores/useStoryStore";
import { useQuery } from "@tanstack/react-query";
import { authQueries } from "@/features/auth/queries/authQueries";
import { useWorkspaceStore } from "@/features/workspace/stores/useWorkspaceStore";
import { modalActions } from "@/shared/stores/useModalStore";
import { toastActions } from "@/shared/stores/useToastStore";
import { storiesApi } from "@/features/stories/api/stories";
import { storageApi } from "@/shared/api/storage";
import { AppHeader } from "@/shared/components/AppHeader";
import { PathPickerMap } from "@/features/map/components/PathPickerMap";
import { PathPreview } from "@/features/map/components/PathPreview";
import { PATH_COLORS } from "@/shared/constants/theme";
import { getTodayDateString, formatDate } from "@/shared/utils/date";
import type { LocationPoint } from "@/features/stories/types/story";
import styles from "./StoryEditView.module.scss";

export const StoryEditView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams.get("storyId");
  const isEditMode = !!storyId;

  const { data: user } = useQuery(authQueries.user());
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const stories = useStoryStore((s) => s.stories);
  const existingStory = useMemo(
    () => (isEditMode ? stories.find((s) => s.id === storyId) : null),
    [isEditMode, storyId, stories]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(existingStory?.title || "");
  const [description, setDescription] = useState(existingStory?.description || "");
  const [date, setDate] = useState(
    existingStory ? formatDate(existingStory.date, "YYYY-MM-DD") : getTodayDateString()
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>(existingStory?.thumbnailUrl);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(existingStory?.thumbnailUrl);
  const [pathColor, setPathColor] = useState<string>(existingStory?.pathColor ?? PATH_COLORS[0]);
  const [path, setPath] = useState<LocationPoint[]>(existingStory?.path || []);
  const [showPathPicker, setShowPathPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setPendingFile(file);
    setPreviewUrl(blobUrl);
  };

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPendingFile(null);
    setPreviewUrl(undefined);
    setThumbnailUrl(undefined);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      let finalThumbnailUrl = thumbnailUrl;

      if (pendingFile && user) {
        try {
          finalThumbnailUrl = await storageApi.uploadImage(pendingFile, user.id);
        } catch {
          finalThumbnailUrl = previewUrl;
          toastActions.showToast("이미지 업로드 실패: 로컬 미리보기로 저장됩니다.", "warning");
        }
      }

      const storyData = {
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        thumbnailUrl: finalThumbnailUrl,
        path,
        pathColor,
      };

      if (isEditMode && storyId) {
        try {
          const updated = await storiesApi.update(storyId, storyData);
          storyActions.updateStory(storyId, updated);
        } catch {
          storyActions.updateStory(storyId, storyData);
        }
      } else {
        const newStory = {
          ...storyData,
          date: new Date(date).toISOString(),
          userId: user?.id ?? "local",
          workspaceId: currentWorkspace?.id ?? "local",
        };
        try {
          const created = await storiesApi.create(newStory);
          storyActions.addStory(created);
        } catch {
          storyActions.addStory({ ...newStory, id: `story-${Date.now()}` });
        }
      }

      modalActions.showModal({
        type: "alert",
        title: "성공",
        message: isEditMode ? "기억이 수정되었습니다." : "기억이 기록되었습니다.",
        onConfirm: () => router.back(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className={styles.page}>
        <AppHeader />

        <div className={styles.scrollArea}>
          <div>
            {previewUrl ? (
              <div className={styles.thumbnailWrap}>
                <img src={previewUrl} alt="thumbnail" className={styles.thumbnail} />
                <button onClick={handleRemoveImage} className={styles.removeButton}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className={styles.imagePlaceholder}
              >
                <ImageIcon size={32} />
                <span>사진 추가하기</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={handleImageSelect}
            />
          </div>

          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label}>제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="어떤 기억인가요? (선택)"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>내용</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="그날의 이야기를 들려주세요 (선택)"
                rows={4}
                className={styles.textarea}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>경로</label>
              {path.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setShowPathPicker(true)}
                  className={styles.pathPlaceholder}
                >
                  <div className={styles.pathPlaceholderIcon}>
                    <MapPin size={22} />
                  </div>
                  <p className={styles.pathPlaceholderText}>경로 추가하기</p>
                  <p className={styles.pathPlaceholderSub}>지도를 탭해서 이동 경로를 기록하세요</p>
                </button>
              ) : (
                <PathPreview
                  path={path}
                  pathColor={pathColor}
                  onEdit={() => setShowPathPicker(true)}
                  onClear={() => setPath([])}
                />
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={handleSave} className={styles.saveButton} disabled={isSaving}>
            {isSaving ? "저장 중..." : isEditMode ? "수정하기" : "기록하기"}
          </button>
        </div>
      </div>

      {showPathPicker && (
        <PathPickerMap
          initialPath={path}
          initialColor={pathColor}
          onConfirm={(newPath, newColor) => {
            setPath(newPath);
            setPathColor(newColor);
            setShowPathPicker(false);
          }}
          onClose={() => setShowPathPicker(false)}
        />
      )}
    </>
  );
};
